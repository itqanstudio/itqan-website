import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createBooking } from '@/lib/scheduling/repo';
import { bookingRequestSchema, firstIssue } from '@/lib/scheduling/validation';
import { sendGuestConfirmation, sendStudioNotice } from '@/lib/scheduling/mail';
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
  emailed: boolean;
}

/**
 * POST /api/book: book a briefing.
 * Public and unauthenticated, so it carries an origin check, per-IP and
 * per-email rate limits, a honeypot, and schema validation with length caps.
 * The slot is re-checked inside the write transaction (see createBooking).
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

  let result: ReturnType<typeof createBooking>;
  try {
    result = createBooking(input, Date.now(), ipKey(ip));
  } catch (err) {
    console.error('[book] create failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'server' });
  }
  if (!result.ok) {
    return result.reason === 'limit' ? json(429, { ok: false, error: 'limit' }) : json(409, { ok: false, error: 'taken' });
  }

  const { booking, cancelToken } = result;
  const [guest, studio] = await Promise.all([sendGuestConfirmation(booking, cancelToken), sendStudioNotice(booking)]);
  if (!studio.sent) console.error('[book] studio notice not sent for booking', booking.id);
  if (!guest.sent) console.error('[book] guest confirmation not sent for booking', booking.id);

  return json<Created>(201, {
    ok: true,
    data: { id: booking.id, start: booking.startUtc, end: booking.endUtc, emailed: guest.sent },
  });
}
