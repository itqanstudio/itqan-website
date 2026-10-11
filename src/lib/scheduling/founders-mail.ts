import { formatWhen } from '@/content/v3/booking';
import type { BookingForEmail } from '@/lib/crm/contract';
import { buildIcs, type IcsAttendee } from './ics';
import { callMinutes, meetingLink, sendMail, type MailResult } from './mail';

/*
 * The founders' calendar invite. Every booking sends each active founder (the
 * CRM's booking.team) one email with a real invitation (METHOD:REQUEST); every
 * cancel, by the guest or from the CRM, sends each the CANCEL for the same UID.
 * The organizer is the studio's sending address (CONTACT_FROM_EMAIL, the SES
 * From), never a founder: a calendar treats an invite organized by its own
 * owner as their own event, not as an invitation. These emails are best effort:
 * nothing here throws, and a failure never touches the booking or the cancel.
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
  return `${tag} ${b.guestName}, ${b.company}, ${shortWhen(b.start)}`;
}

function cancelLines(cancel: CancelNote): string[] {
  const who = cancel.by === 'guest' ? 'Cancelled by the guest.' : 'Cancelled from the CRM.';
  return cancel.reason ? [who, `Their reason: ${cancel.reason}`, ''] : [who, ''];
}

/**
 * The founders' event: one VEVENT for all of them, the host required and
 * anyone else optional. REQUEST with sequence 0 on booking; CANCEL with
 * sequence 1, the same UID, organizer and attendees on any cancel.
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
    `Guest: ${b.guestName} <${b.guestEmail}>`,
    `Company: ${b.company}`,
    `Notes: ${b.message.trim() || 'none'}`,
    `Host: ${hostName(b)}`,
    ...(link ? [`Video call: ${link}`] : []),
    `Open in the CRM: ${crmLink(b)}`,
  ].join('\n');
  return buildIcs({
    uid: `${b.id}@itqanstudio.com`,
    start: new Date(b.start),
    end: new Date(b.end),
    summary: `Itqan briefing: ${b.guestName}, ${b.company}`,
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
  ].join('\n');
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

async function sendToFounders(b: BookingForEmail, cancel?: CancelNote): Promise<MailResult[]> {
  try {
    if (b.team.length === 0) {
      console.error('[mail] no founders on booking', b.id, '; no calendar email sent');
      return [];
    }
    const organizer = organizerFor(b);
    if (!organizer) return b.team.map((): MailResult => ({ sent: false, reason: 'not_configured' }));
    const content = foundersIcs(b, organizer, cancel);
    const subject = subjectFor(b, cancel);
    const method = cancel ? 'CANCEL' : 'REQUEST';
    return await Promise.all(
      b.team.map((to) => sendMail({ to: to.email, replyTo: b.guestEmail, subject, text: founderText(b, to, cancel), ics: { method, content } }))
    );
  } catch (err) {
    console.error('[mail] the founders\' calendar emails threw for booking', b.id, err instanceof Error ? err.message : String(err));
    return b.team.map((): MailResult => ({ sent: false, reason: 'failed' }));
  }
}

/** A new booking: each founder gets the invitation. Never throws. */
export function sendFounderInvites(b: BookingForEmail): Promise<MailResult[]> {
  return sendToFounders(b);
}

/** Any cancel: each founder gets the CANCEL for the same event. Never throws. */
export function sendFounderCancellations(b: BookingForEmail, cancel: CancelNote): Promise<MailResult[]> {
  return sendToFounders(b, cancel);
}

/** Logs the founders' sends that did not go (counts only); they never change an answer. */
export function logFounderSends(label: string, bookingId: string, results: readonly MailResult[]): void {
  const failed = results.filter((r) => !r.sent).length;
  if (failed > 0) console.error(`[${label}] ${failed} of ${results.length} founder calendar emails not sent for booking`, bookingId);
}

/**
 * Lets the founders' sends finish on their own (the site runs as a long-lived
 * Node server) and logs what did not go. A route never waits on them, so a slow
 * mail server cannot hold up the visitor's answer, or the answer a CRM lease
 * waits on (the guest's email is the only one that decides it).
 */
export function finishInBackground(label: string, bookingId: string, sends: Promise<MailResult[]>): void {
  void sends
    .then((results) => logFounderSends(label, bookingId, results))
    .catch((err: unknown) => console.error(`[${label}] founder calendar emails failed for booking`, bookingId, err instanceof Error ? err.message : String(err)));
}
