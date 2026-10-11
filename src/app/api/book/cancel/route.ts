import type { NextRequest } from 'next/server';
import type { ZodIssue } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { cancelCrmBooking, isCrmDown, isOutcomeUnknown, recordCancelNotice, type CrmFailure } from '@/lib/crm/client';
import type { BookingForEmail, CancelBookingData } from '@/lib/crm/contract';
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
 * The reason the founders see: the one the CRM stored (W5), so a retry's own
 * text never replaces the first cancel's. A CRM from before that field sends
 * none: then only the cancel that went through (changed) has a reason, its own.
 */
function foundersReason(data: CancelBookingData, sentReason: string | undefined): string | undefined {
  if (data.cancelReason !== undefined) return data.cancelReason ?? undefined;
  return data.changed ? sentReason : undefined;
}

/** What the page hears when the CRM did not cancel. A 404 means only that the link itself failed. */
function failureAnswer(result: CrmFailure, sentReason: string | undefined): ReturnType<typeof json> {
  // The CRM may have cancelled (cancelling again is safe and sends any owed emails): drop the cached times.
  if (isOutcomeUnknown(result)) forgetSlots();
  if (isCrmDown(result)) return json(503, { ok: false, error: 'paused' });
  if (result.error === 'past') return json(409, { ok: false, error: 'past' });
  if (result.error === 'limit') return json(429, { ok: false, error: 'rate' });
  if (result.error === 'not_found') return json(404, { ok: false, error: 'not_found' });
  // The token passed this site's check, so a CRM "invalid" is about the reason; with none sent, the link.
  if (result.error === 'invalid') {
    return sentReason ? json(400, { ok: false, error: 'reason_rejected' }) : json(404, { ok: false, error: 'not_found' });
  }
  console.error('[book/cancel] unexpected CRM answer', { error: result.error, status: result.status });
  return json(503, { ok: false, error: 'paused' });
}

/** A request that did not parse: a bad token reads as an unknown link, a long reason and anything else apart. */
function parseFailure(issues: readonly ZodIssue[]): ReturnType<typeof json> {
  if (issues.some((issue) => issue.path[0] === 'token')) return json(404, { ok: false, error: 'not_found' });
  const tooLong = issues.some((issue) => issue.path[0] === 'reason' && issue.code === 'too_big');
  return json(400, { ok: false, error: tooLong ? 'reason_too_long' : 'invalid' });
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
    // Not the reason's fault: the page says the request did not arrive whole.
    return json(400, { ok: false, error: 'unreadable' });
  }
  const parsed = cancelRequestSchema.safeParse(raw);
  if (!parsed.success) return parseFailure(parsed.error.issues);
  const { token, reason } = parsed.data;

  const result = await cancelCrmBooking(token, reason);
  if (!result.ok) return failureAnswer(result, reason);

  const { changed, booking, noticeOwed } = result.data;
  if (changed) forgetSlots();
  // Owed, not just changed: a retry after a lost answer still sends the emails, and
  // once this site records them the CRM stops asking, so the guest's never goes twice.
  if (noticeOwed && booking) await sendCancelEmails(token, booking, foundersReason(result.data, reason));
  else if (noticeOwed) console.error('[book/cancel] the CRM cancelled a booking but sent no details; no emails went out');
  return json<Cancelled>(200, {
    ok: true,
    data: booking ? { changed, start: booking.start, timezone: booking.guestTimezone } : { changed },
  });
}
