import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { cancelCrmBooking, isCrmDown, isOutcomeUnknown, recordCancelNotice } from '@/lib/crm/client';
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

/** Tells the CRM the guest's email went; a failure only means a later retry may send it again. */
async function recordSent(token: string, bookingId: string): Promise<void> {
  const recorded = await recordCancelNotice(token);
  if (!recorded.ok) console.error('[book/cancel] could not record the sent notice for booking', bookingId, recorded.error);
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
    // The CRM may have cancelled (cancelling again is safe and sends any owed emails): drop the cached times.
    if (isOutcomeUnknown(result)) forgetSlots();
    if (isCrmDown(result)) return json(503, { ok: false, error: 'paused' });
    if (result.error === 'past') return json(409, { ok: false, error: 'past' });
    if (result.error === 'limit') return json(429, { ok: false, error: 'rate' });
    return json(404, { ok: false, error: 'not_found' });
  }

  const { changed, booking, noticeOwed } = result.data;
  if (changed) forgetSlots();
  // Owed, not just changed: a retry after a lost answer still sends the emails, and
  // once this site records them the CRM stops asking, so they never go twice.
  if (noticeOwed && booking) {
    const sent = await sendGuestCancelledNotices(booking);
    if (!sent.host.sent) console.error('[book/cancel] host notice not sent for booking', booking.id);
    if (!sent.guest.sent) console.error('[book/cancel] guest notice not sent for booking', booking.id);
    else await recordSent(parsed.data.token, booking.id);
  } else if (noticeOwed) {
    console.error('[book/cancel] the CRM cancelled a booking but sent no details; no emails went out');
  }
  return json<Cancelled>(200, {
    ok: true,
    data: booking ? { changed, start: booking.start, timezone: booking.guestTimezone } : { changed },
  });
}
