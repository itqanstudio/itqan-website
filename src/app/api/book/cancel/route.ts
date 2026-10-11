import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { cancelCrmBooking, isCrmDown, isOutcomeUnknown, recordCancelNotice } from '@/lib/crm/client';
import type { BookingForEmail } from '@/lib/crm/contract';
import { forgetSlots } from '@/lib/crm/slots-cache';
import { finishInBackground, sendFounderCancellations } from '@/lib/scheduling/founders-mail';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { sendGuestCancellation, type MailResult } from '@/lib/scheduling/mail';
import { clientIp, isAllowedOrigin, json, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Room for a 500-character reason in any script (up to 4 bytes a character) plus the token. */
const BODY_LIMIT_BYTES = 4096;

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

/**
 * The guest's cancellation email and each founder's calendar CANCEL (with the
 * guest's reason). Only the guest's email decides the record: the founders'
 * are best effort and never fail the cancel.
 */
async function sendCancelEmails(token: string, booking: BookingForEmail, reason: string | undefined): Promise<void> {
  finishInBackground('book/cancel', booking.id, sendFounderCancellations(booking, { by: 'guest', reason }));
  // The cancel has happened: an email that throws (not just fails) must not turn this into an error.
  const guest = await sendGuestCancellation(booking, 'guest').catch((err: unknown): MailResult => {
    console.error('[book/cancel] guest cancellation threw for booking', booking.id, err instanceof Error ? err.message : String(err));
    return { sent: false, reason: 'failed' };
  });
  if (!guest.sent) console.error('[book/cancel] guest notice not sent for booking', booking.id);
  else await recordSent(token, booking.id);
}

/** POST /api/book/cancel: the guest cancels with the secret link from their email, with an optional reason. */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const limit = rateLimit(`cancel:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return json(429, { ok: false, error: 'rate' }, { 'Retry-After': String(limit.retryAfterSeconds) });

  let raw: unknown;
  try {
    raw = await readJson(req, BODY_LIMIT_BYTES);
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }
  const parsed = cancelRequestSchema.safeParse(raw);
  if (!parsed.success) {
    // A bad token reads as an unknown link; anything else (a reason that is too long) is a bad request.
    const tokenIssue = parsed.error.issues.some((issue) => issue.path[0] === 'token');
    return tokenIssue ? json(404, { ok: false, error: 'not_found' }) : json(400, { ok: false, error: 'invalid' });
  }
  const { token, reason } = parsed.data;

  const result = await cancelCrmBooking(token, reason);
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
  // once this site records them the CRM stops asking, so the guest's never goes twice.
  if (noticeOwed && booking) await sendCancelEmails(token, booking, reason);
  else if (noticeOwed) console.error('[book/cancel] the CRM cancelled a booking but sent no details; no emails went out');
  return json<Cancelled>(200, {
    ok: true,
    data: booking ? { changed, start: booking.start, timezone: booking.guestTimezone } : { changed },
  });
}
