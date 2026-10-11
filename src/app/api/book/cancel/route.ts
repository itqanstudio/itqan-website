import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { cancelCrmBooking, isCrmDown } from '@/lib/crm/client';
import { forgetSlots } from '@/lib/crm/slots-cache';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { sendGuestCancelledNotices } from '@/lib/scheduling/mail';
import { clientIp, isAllowedOrigin, json, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Cancelled {
  changed: boolean;
  /** The booked time and the guest's zone, so the page can say which call was cancelled. */
  start?: string;
  timezone?: string;
}

/** POST /api/book/cancel: the guest cancels with the secret link from their email. */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const limit = rateLimit(`cancel:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return json(429, { ok: false, error: 'rate' }, { 'Retry-After': String(limit.retryAfterSeconds) });

  let raw: unknown;
  try {
    raw = await readJson(req, 1024);
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }
  const parsed = cancelRequestSchema.safeParse(raw);
  if (!parsed.success) return json(404, { ok: false, error: 'not_found' });

  const result = await cancelCrmBooking(parsed.data.token);
  if (!result.ok) {
    if (isCrmDown(result)) return json(503, { ok: false, error: 'paused' });
    if (result.error === 'past') return json(409, { ok: false, error: 'past' });
    return json(404, { ok: false, error: 'not_found' });
  }

  const { changed, booking } = result.data;
  if (changed) forgetSlots();
  if (changed && booking) {
    const sent = await sendGuestCancelledNotices(booking);
    if (!sent.host.sent) console.error('[book/cancel] host notice not sent for booking', booking.id);
    if (!sent.guest.sent) console.error('[book/cancel] guest notice not sent for booking', booking.id);
  } else if (changed) {
    console.error('[book/cancel] the CRM cancelled a booking but sent no details; no emails went out');
  }
  return json<Cancelled>(200, {
    ok: true,
    data: booking ? { changed, start: booking.start, timezone: booking.guestTimezone } : { changed },
  });
}
