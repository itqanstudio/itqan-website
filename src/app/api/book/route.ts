import type { NextRequest } from 'next/server';
import { localHostName } from '@/content/v3/booking-format';
import { rateLimit } from '@/lib/rate-limit';
import { createCrmBooking, isCrmDown, isOutcomeUnknown } from '@/lib/crm/client';
import type { CreateBookingRequest } from '@/lib/crm/contract';
import { bookingRequestSchema, firstIssue } from '@/lib/scheduling/validation';
import { sendGuestConfirmation, sendHostNotice } from '@/lib/scheduling/mail';
import { clientIp, ipKey, isAllowedOrigin, json, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Per IP and per email: each booking sends two real emails. */
const IP_MAX = 5;
const EMAIL_MAX = 3;
const WINDOW_MS = 10 * 60 * 1000;

interface Created {
  id: string;
  start: string;
  end: string;
  hostName: string;
  emailed: boolean;
}

/**
 * POST /api/book: book a briefing.
 * Public and unauthenticated, so it keeps its origin check, per-IP and
 * per-email rate limits, a 16 KB streamed body cap, a honeypot and schema
 * validation. Then the CRM books it (its database refuses double bookings and
 * picks the host) and this site sends the guest and host emails. When the CRM's
 * answer does not arrive in time or cannot be read, the answer is "unconfirmed"
 * (the booking may exist), never "paused".
 */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });

  const ip = clientIp(req);
  const byIp = rateLimit(`book:ip:${ip}`, IP_MAX, WINDOW_MS);
  if (!byIp.allowed) return json(429, { ok: false, error: 'rate' }, { 'Retry-After': String(byIp.retryAfterSeconds) });

  let raw: unknown;
  try {
    raw = await readJson(req);
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }
  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: `invalid: ${firstIssue(parsed.error)}` });
  const input = parsed.data;

  // Never a silent fake success: the hit is logged and the visitor sees an error.
  if (input.leave_empty) {
    console.warn('[book] honeypot filled; rejected', { ip });
    return json(400, { ok: false, error: 'invalid' });
  }

  const byEmail = rateLimit(`book:email:${input.email}`, EMAIL_MAX, WINDOW_MS);
  if (!byEmail.allowed) return json(429, { ok: false, error: 'rate' }, { 'Retry-After': String(byEmail.retryAfterSeconds) });

  // Keyed by the shared secret; without it nothing can be signed either, so booking is paused.
  const ipHash = ipKey(ip);
  if (!ipHash) {
    console.error('[book] ITQAN_BOOKING_SECRET is missing or shorter than 32 characters; booking refused');
    return json(503, { ok: false, error: 'paused' });
  }

  const request: CreateBookingRequest = {
    start: input.start,
    ...(input.with ? { with: input.with } : {}),
    name: input.name,
    email: input.email,
    company: input.company,
    role: input.role,
    industry: input.industry,
    message: input.message,
    topic: input.topic,
    locale: input.locale,
    timezone: input.timezone,
    ipHash,
  };
  const result = await createCrmBooking(request);
  if (!result.ok) {
    // The CRM may have booked (it keeps going when this site stops waiting), but no email can go out
    // without its answer. The visitor is told to check before trying again; the host still gets the
    // CRM's notification and can find it by this time.
    if (isOutcomeUnknown(result)) {
      console.error('[book] booking outcome unknown; check the CRM calendar', { start: input.start, with: input.with ?? 'any', status: result.status, detail: result.message });
      return json(result.message === 'timeout' ? 504 : 502, { ok: false, error: 'unconfirmed' });
    }
    if (isCrmDown(result)) return json(503, { ok: false, error: 'paused' });
    if (result.error === 'unavailable') return json(409, { ok: false, error: 'taken' });
    if (result.error === 'limit') return json(429, { ok: false, error: 'limit' });
    if (result.error === 'invalid') return json(400, { ok: false, error: 'invalid' });
    console.error('[book] unexpected CRM answer', { error: result.error, status: result.status });
    return json(503, { ok: false, error: 'paused' });
  }

  const { booking, cancelToken } = result.data;
  const [guest, host] = await Promise.all([sendGuestConfirmation(booking, cancelToken), sendHostNotice(booking)]);
  if (!host.sent) console.error('[book] host notice not sent for booking', booking.id);
  if (!guest.sent) console.error('[book] guest confirmation not sent for booking', booking.id);

  return json<Created>(201, {
    ok: true,
    data: { id: booking.id, start: booking.start, end: booking.end, hostName: localHostName(booking.host, input.locale), emailed: guest.sent },
  });
}
