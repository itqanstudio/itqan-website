import { formatWhen } from '@/content/v3/booking';
import type { BookingForEmail } from '@/lib/crm/contract';
import { claimSend, clearSendMemory, hasSent, isCancelled, markCancelled, sendMemorySize, settleSend } from './founders-memory';
import { buildIcs, type IcsAttendee, type IcsMethod } from './ics';
import { SMTP_TIMEOUT_MS, callMinutes, meetingLink, sendMail, type MailResult } from './mail';
import { BIDI_CONTROLS } from './validation';

export { FOUNDER_MEMORY_MAX } from './founders-memory';

/*
 * The founders' calendar invite. Every booking sends each active founder (the
 * CRM's booking.team) one email with a real invitation (METHOD:REQUEST); every
 * cancel, by the guest or from the CRM, sends each the CANCEL for the same UID.
 * The organizer is the studio's sending address (CONTACT_FROM_EMAIL, the SES
 * From), never a founder: a calendar treats an invite organized by its own
 * owner as their own event, not as an invitation. These emails are best effort:
 * nothing here throws, and a failure never touches the booking or the cancel.
 * The CRM hears whether a host cancel's CANCEL went (foundersCancelWent), so it
 * keeps offering Send calendar cancel again until it has.
 *
 * Once per founder (W5): the CRM and the guest may retry a cancel, and each
 * retry reaches this file again. A calendar takes a repeated CANCEL as a no-op,
 * but each one is another email, so this process remembers every REQUEST and
 * CANCEL that went (booking, method, address) for 24 hours and does not send
 * it again (founders-memory.ts). A send that did not go is forgotten at once,
 * so a retry tries it; one still going is never dropped to make room.
 *
 * In order: both sends run in the background, so a quick cancel could reach a
 * founder before the invite it withdraws, and a calendar would then ignore the
 * CANCEL and keep the later REQUEST. A cancel therefore waits for that
 * booking's invite send to finish.
 */

/** Where hosts manage bookings. A fixed public URL, never CRM_API_ORIGIN (which can be an internal address). */
const PORTAL_URL = 'https://portal.itqanstudio.com';
/** The founders work from Dubai and Gothenburg; their emails show both. */
const FOUNDER_ZONES = ['Asia/Dubai', 'Europe/Stockholm'] as const;
const ORGANIZER_NAME = 'Itqan Studio';
/** Development only, when CONTACT_FROM_EMAIL is not set: the mail is printed, never sent. */
const DEV_ORGANIZER = 'organizer@itqanstudio.invalid';
const ADDRESS = /^[^\s@<>"(),;:\\]+@[^\s@<>"(),;:\\]+\.[^\s@<>"(),;:\\]+$/;

type Founder = BookingForEmail['team'][number];

/** A cancel: who did it, and the guest's reason when they gave one. */
export interface CancelNote {
  by: 'guest' | 'host';
  reason?: string;
}

/**
 * The longest a cancel waits for its booking's invite send (review r2): above
 * the mail budget (the SMTP connect, greeting and socket timeouts, plus room),
 * so only a send that hangs is overtaken.
 */
export const INVITE_WAIT_MS = 4 * SMTP_TIMEOUT_MS;

/**
 * When a founders' CANCEL that failed is tried again in this process (review
 * r2): once the guest's email is recorded the CRM stops asking the site to
 * send, so nothing else would. The first retry is 1 minute after the failed
 * send, the second 5 minutes after a failed first retry; then it is given up
 * (logged). Only a send that failed is retried, never one that is not
 * configured. A restart loses a retry that is waiting.
 */
export const CANCEL_RETRY_DELAYS_MS: readonly number[] = [60_000, 300_000];
/** The most bookings with a cancel retry waiting at once (far above two founders' day). */
const CANCEL_RETRY_MAX = 500;

/**
 * How long the CRM's notify call waits for the founders' CANCEL (code review
 * M2). The CRM gives the whole call 8 seconds and the guest's email runs at
 * the same time, so a slow founders' send still leaves about 3 seconds for the
 * network and the checks around it. A normal SES send takes about a second.
 */
export const FOUNDERS_CANCEL_WAIT_MS = 5_000;

/** Per booking, the invite send still running: a cancel for that booking waits for it. */
const pendingInvites = new Map<string, Promise<unknown>>();
/** Per booking, the timer of the cancel retry waiting to run: one per booking. */
const cancelRetries = new Map<string, ReturnType<typeof setTimeout>>();

/** A timer that never keeps the process alive on its own (Node's unref, when the timer has one). */
function later(ms: number, run: () => void): ReturnType<typeof setTimeout> {
  const timer = setTimeout(run, ms);
  const handle: unknown = timer;
  if (typeof handle === 'object' && handle !== null && 'unref' in handle && typeof handle.unref === 'function') handle.unref();
  return timer;
}

/**
 * Waits for this booking's invite send to end, at most INVITE_WAIT_MS (review
 * r2): a send that hangs must not hold the CANCEL back for ever. When the wait
 * runs out the cancel goes anyway, and later cancels no longer wait for that
 * send. Never rejects, and leaves no timer behind when the invite ends first.
 */
function inviteEnded(bookingId: string, invite: Promise<unknown>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ranOut = new Promise<boolean>((resolve) => {
    timer = later(INVITE_WAIT_MS, () => resolve(true));
  });
  const ended = invite.then(
    () => false,
    () => false,
  );
  return Promise.race([ended, ranOut]).then((late) => {
    clearTimeout(timer);
    if (!late) return;
    console.error('[mail] the founders invite send is still running; sending the calendar cancel anyway for booking', bookingId);
    if (pendingInvites.get(bookingId) === invite) pendingInvites.delete(bookingId);
  });
}

function memoryKey(bookingId: string, method: IcsMethod, email: string): string {
  return `${bookingId}|${method}|${email.toLowerCase()}`;
}

/** Test hook: forget every send and every running invite, and drop every waiting cancel retry. */
export function clearFounderMemory(): void {
  clearSendMemory();
  pendingInvites.clear();
  cancelRetries.forEach((timer) => clearTimeout(timer));
  cancelRetries.clear();
}

/** Test hook: how many sends are remembered, going or gone. */
export function founderMemorySize(): number {
  return sendMemorySize();
}

/**
 * Text the guest typed (or the CRM passed on), made safe for the founders'
 * calendar title and description: Google Calendar shows a description as HTML,
 * so < and > become the single angle quotes and & the full-width ampersand
 * (no tag, link or entity survives), and bidi overrides are removed.
 */
function calendarText(value: string): string {
  return value.replace(BIDI_CONTROLS, '').replace(/</g, '‹').replace(/>/g, '›').replace(/&/g, '＆');
}

/** Text for the founders' plain email (subject and body): bidi overrides removed. */
function plainText(value: string): string {
  return value.replace(BIDI_CONTROLS, '');
}

/** CONTACT_FROM_EMAIL (the address SES sends from) as a bare address, or null when it is missing or not one. */
export function senderAddress(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.CONTACT_FROM_EMAIL?.trim();
  return raw && ADDRESS.test(raw) ? raw : null;
}

function crmLink(b: BookingForEmail): string {
  return `${PORTAL_URL}/calendar?booking=${encodeURIComponent(b.id)}`;
}

/** Who takes the call, by name: the host on the team, else the booking's host. */
function hostName(b: BookingForEmail): string {
  return b.team.find((t) => t.isHost)?.name ?? b.host.name;
}

function cityOf(zone: string): string {
  return (zone.split('/').pop() ?? zone).replace(/_/g, ' ');
}

/** "Mon 12 Oct" and "10:00" of an instant in a zone, built from parts so no ICU punctuation creeps in. */
function dateAndTime(d: Date, zone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: zone,
  }).formatToParts(d);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return { date: `${part('weekday')} ${part('day')} ${part('month')}`, time: `${part('hour')}:${part('minute')}` };
}

/** "Mon 12 Oct 10:00 Dubai, 08:00 Stockholm": each founder zone, the date written again only when it differs. */
export function shortWhen(iso: string): string {
  const d = new Date(iso);
  let lastDate = '';
  return FOUNDER_ZONES.map((zone) => {
    const { date, time } = dateAndTime(d, zone);
    const text = date === lastDate ? `${time} ${cityOf(zone)}` : `${date} ${time} ${cityOf(zone)}`;
    lastDate = date;
    return text;
  }).join(', ');
}

function subjectFor(b: BookingForEmail, cancel?: CancelNote): string {
  const tag = !cancel ? '[briefing]' : cancel.by === 'guest' ? '[briefing cancelled by guest]' : '[briefing cancelled]';
  return plainText(`${tag} ${b.guestName}, ${b.company}, ${shortWhen(b.start)}`);
}

function cancelLines(cancel: CancelNote): string[] {
  const who = cancel.by === 'guest' ? 'Cancelled by the guest.' : 'Cancelled from the CRM.';
  return cancel.reason ? [who, `Their reason: ${calendarText(cancel.reason)}`, ''] : [who, ''];
}

/**
 * The founders' event: one VEVENT for all of them, the host required and
 * anyone else optional. REQUEST with sequence 0 on booking; CANCEL with
 * sequence 1, the same UID, organizer and attendees on any cancel. Every typed
 * value in the title and description goes through calendarText; the video and
 * CRM links stay plain text (both are https links this site or the CRM made).
 */
export function foundersIcs(b: BookingForEmail, organizerEmail: string, cancel?: CancelNote): string {
  const link = meetingLink(b);
  const attendees: IcsAttendee[] = b.team.map((t) => ({
    name: t.name,
    email: t.email,
    role: t.isHost ? 'REQ-PARTICIPANT' : 'OPT-PARTICIPANT',
  }));
  const description = [
    ...(cancel ? cancelLines(cancel) : []),
    `Guest: ${calendarText(b.guestName)} (${calendarText(b.guestEmail)})`,
    `Company: ${calendarText(b.company)}`,
    `Notes: ${calendarText(b.message.trim()) || 'none'}`,
    `Host: ${calendarText(hostName(b))}`,
    ...(link ? [`Video call: ${link}`] : []),
    `Open in the CRM: ${crmLink(b)}`,
  ].join('\n');
  return buildIcs({
    uid: `${b.id}@itqanstudio.com`,
    start: new Date(b.start),
    end: new Date(b.end),
    summary: calendarText(`Itqan briefing: ${b.guestName}, ${b.company}`),
    description,
    location: link,
    organizerEmail,
    organizerName: ORGANIZER_NAME,
    attendees,
    method: cancel ? 'CANCEL' : 'REQUEST',
    sequence: cancel ? 1 : 0,
  });
}

function leadLine(b: BookingForEmail, to: Founder, cancel?: CancelNote): string {
  const host = to.isHost ? 'You' : hostName(b);
  if (!cancel) return `New briefing, ${callMinutes(b)} minutes. ${host} ${to.isHost ? 'host' : 'hosts'} it.`;
  const who = cancel.by === 'guest' ? 'The guest cancelled this briefing.' : 'This briefing was cancelled from the CRM.';
  return `${who} ${host} ${to.isHost ? 'were' : 'was'} hosting it.`;
}

/** Everything the guest typed, to one founder. Reply goes to the guest. */
function founderText(b: BookingForEmail, to: Founder, cancel?: CancelNote): string {
  const link = meetingLink(b);
  return [
    leadLine(b, to, cancel),
    ...(cancel?.reason ? ['', 'Their reason:', cancel.reason] : []),
    '',
    ...FOUNDER_ZONES.map((zone) => `Time: ${formatWhen(b.start, zone, 'en')}`),
    `Guest time: ${formatWhen(b.start, b.guestTimezone, 'en')}`,
    '',
    `Name: ${b.guestName}`,
    `Email: ${b.guestEmail}`,
    `Company: ${b.company}`,
    `Role: ${b.role || '-'}`,
    `Industry: ${b.industry}`,
    `Topic: ${b.topic}`,
    `Language: ${b.locale}`,
    '',
    'First job for an agent:',
    b.message || '-',
    '',
    ...(link && !cancel ? [`Video call: ${link}`] : []),
    `Open in the CRM: ${crmLink(b)}`,
  ].map(plainText).join('\n');
}

/** The organizer for this run, or null when none can be used (logged). */
function organizerFor(b: BookingForEmail): string | null {
  const organizer = senderAddress() ?? (process.env.NODE_ENV === 'development' ? DEV_ORGANIZER : null);
  if (!organizer) {
    console.error('[mail] CONTACT_FROM_EMAIL is missing or not an address; no calendar email to the founders for booking', b.id);
    return null;
  }
  if (b.team.some((t) => t.email.toLowerCase() === organizer.toLowerCase())) {
    console.error("[mail] CONTACT_FROM_EMAIL is a founder's address; that founder's calendar will not take the invite as one. Booking", b.id);
  }
  return organizer;
}

/** One founder's email; a throw counts as not sent, and anything not sent is forgotten for a retry. */
async function sendOne(key: string, claimedAt: number, send: () => Promise<MailResult>): Promise<MailResult> {
  let result: MailResult;
  try {
    // Called at once (no extra tick), and a throw before or after the send counts the same.
    result = await send();
  } catch (err) {
    console.error('[mail] a founder calendar email threw:', err instanceof Error ? err.message : String(err));
    result = { sent: false, reason: 'failed' };
  }
  settleSend(key, claimedAt, result.sent);
  return result;
}

/**
 * Each founder on the team who has not had this booking's REQUEST (or CANCEL)
 * from this process gets it; the answer lists only those sends, so a repeat
 * answers []. Never throws.
 */
async function sendToFounders(b: BookingForEmail, cancel?: CancelNote): Promise<MailResult[]> {
  const method: IcsMethod = cancel ? 'CANCEL' : 'REQUEST';
  const claimed: Array<{ key: string; at: number }> = [];
  try {
    if (b.team.length === 0) {
      console.error('[mail] no founders on booking', b.id, '; no calendar email sent');
      return [];
    }
    const organizer = organizerFor(b);
    if (!organizer) return b.team.map((): MailResult => ({ sent: false, reason: 'not_configured' }));
    const now = Date.now();
    const due = b.team.filter((to) => {
      const key = memoryKey(b.id, method, to.email);
      if (!claimSend(key, now)) return false;
      claimed.push({ key, at: now });
      return true;
    });
    if (due.length === 0) return [];
    const content = foundersIcs(b, organizer, cancel);
    const subject = subjectFor(b, cancel);
    return await Promise.all(
      due.map((to, i) =>
        sendOne(claimed[i].key, claimed[i].at, () =>
          sendMail({ to: to.email, replyTo: b.guestEmail, subject, text: founderText(b, to, cancel), ics: { method, content } })
        )
      )
    );
  } catch (err) {
    claimed.forEach(({ key, at }) => settleSend(key, at, false));
    console.error('[mail] the founders\' calendar emails threw for booking', b.id, err instanceof Error ? err.message : String(err));
    return b.team.map((): MailResult => ({ sent: false, reason: 'failed' }));
  }
}

/**
 * A new booking: each founder gets the invitation, once. Never throws. A
 * booking this process has started cancelling gets none: a REQUEST after its
 * CANCEL would put the cancelled briefing back on the founders' calendars.
 */
export function sendFounderInvites(b: BookingForEmail): Promise<MailResult[]> {
  if (isCancelled(b.id, Date.now())) {
    console.warn('[mail] booking already cancelled; no calendar invite to the founders for booking', b.id);
    return Promise.resolve([]);
  }
  const sends = sendToFounders(b);
  // A second call for the same booking must not hide a first one that is still sending.
  const prior = pendingInvites.get(b.id);
  const settled: Promise<unknown> = prior ? Promise.allSettled([prior, sends]) : sends;
  pendingInvites.set(b.id, settled);
  void settled.finally(() => {
    if (pendingInvites.get(b.id) === settled) pendingInvites.delete(b.id);
  });
  return sends;
}

/** The CANCEL to each founder who has not had it, after this booking's invite send (waited for at most INVITE_WAIT_MS). */
function cancelInOrder(b: BookingForEmail, cancel: CancelNote): Promise<MailResult[]> {
  const invite = pendingInvites.get(b.id);
  if (!invite) return sendToFounders(b, cancel);
  return inviteEnded(b.id, invite).then(() => sendToFounders(b, cancel));
}

const failedToSend = (result: MailResult): boolean => !result.sent && result.reason === 'failed';

/** Runs retry `attempt` after its delay, and the next one if that fails too; past the last, gives up. */
function retryCancel(b: BookingForEmail, cancel: CancelNote, attempt: number): void {
  const delay = CANCEL_RETRY_DELAYS_MS[attempt];
  if (delay === undefined) {
    cancelRetries.delete(b.id);
    console.error('[mail] gave up on the founders calendar cancel after its retries for booking', b.id);
    return;
  }
  console.warn(`[mail] founders calendar cancel not sent; trying again in ${delay / 1000} s for booking`, b.id);
  const timer = later(delay, () => {
    void cancelInOrder(b, cancel)
      .then((results) => {
        // Dropped meanwhile (the test hook): this retry ends here.
        if (cancelRetries.get(b.id) !== timer) return;
        if (results.some(failedToSend)) retryCancel(b, cancel, attempt + 1);
        else cancelRetries.delete(b.id);
      })
      .catch((err: unknown) => {
        if (cancelRetries.get(b.id) === timer) cancelRetries.delete(b.id);
        console.error('[mail] the founders calendar cancel retry failed for booking', b.id, err instanceof Error ? err.message : String(err));
      });
  });
  cancelRetries.set(b.id, timer);
}

/** Starts the retries for a cancel that failed for some founder, unless this booking already has them. */
function retryIfFailed(b: BookingForEmail, cancel: CancelNote, results: readonly MailResult[]): void {
  if (!results.some(failedToSend) || cancelRetries.has(b.id)) return;
  if (cancelRetries.size >= CANCEL_RETRY_MAX) {
    console.error('[mail] too many founders calendar cancels waiting to retry; no retry for booking', b.id);
    return;
  }
  retryCancel(b, cancel, 0);
}

/**
 * Any cancel: each founder gets the CANCEL for the same event, once, and never
 * before this booking's invite send has finished (sent or not). From the first
 * call on, no new invite goes for this booking, and a CANCEL that failed is
 * tried again in this process (CANCEL_RETRY_DELAYS_MS). Never throws.
 */
export function sendFounderCancellations(b: BookingForEmail, cancel: CancelNote): Promise<MailResult[]> {
  markCancelled(b.id, Date.now());
  const sends = cancelInOrder(b, cancel);
  void sends
    .then((results) => retryIfFailed(b, cancel, results))
    .catch((err: unknown) => console.error('[mail] could not set up the founders cancel retry for booking', b.id, err instanceof Error ? err.message : String(err)));
  return sends;
}

/**
 * Whether every founder on the booking has had its CANCEL from this process,
 * read once `sends` ends or `waitMs` runs out, whichever comes first (code
 * review M2). A CANCEL that failed, could not be sent, or is still going (this
 * call's or an earlier one's) makes it false; the send and its retries carry
 * on in the background. A repeat after every CANCEL went is true without
 * sending again, and so is an empty team (nobody is owed one). Read from the
 * send memory, not from `sends`, which lists only this call's new sends.
 * Never rejects, and leaves no timer behind.
 */
export async function foundersCancelWent(b: BookingForEmail, sends: Promise<unknown>, waitMs = FOUNDERS_CANCEL_WAIT_MS): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ranOut = new Promise<void>((resolve) => {
    timer = later(waitMs, () => resolve());
  });
  const ended = sends.then(
    () => undefined,
    () => undefined,
  );
  await Promise.race([ended, ranOut]);
  clearTimeout(timer);
  const now = Date.now();
  return b.team.every((to) => hasSent(memoryKey(b.id, 'CANCEL', to.email), now));
}

/** Logs the founders' sends that did not go (counts only); they never change an answer. */
export function logFounderSends(label: string, bookingId: string, results: readonly MailResult[]): void {
  const failed = results.filter((r) => !r.sent).length;
  if (failed > 0) console.error(`[${label}] ${failed} of ${results.length} founder calendar emails not sent for booking`, bookingId);
}

/**
 * Lets the founders' sends finish on their own (the site runs as a long-lived
 * Node server) and logs what did not go. The visitor's routes never wait on
 * them; the CRM's notify route waits for the CANCEL at most
 * FOUNDERS_CANCEL_WAIT_MS (foundersCancelWent), so a slow mail server cannot
 * hold up an answer for long.
 */
export function finishInBackground(label: string, bookingId: string, sends: Promise<MailResult[]>): void {
  void sends
    .then((results) => logFounderSends(label, bookingId, results))
    .catch((err: unknown) => console.error(`[${label}] founder calendar emails failed for booking`, bookingId, err instanceof Error ? err.message : String(err)));
}
