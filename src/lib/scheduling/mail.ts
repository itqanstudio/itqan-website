import nodemailer from 'nodemailer';
import { bookingCopy, fill, formatWhen, localHostName } from '@/content/v3/booking';
import type { BookingForEmail } from '@/lib/crm/contract';
import { buildIcs, type IcsMethod } from './ics';

/** Short, because the booking response waits for the confirmation email. Each of connect, greeting and socket. */
export const SMTP_TIMEOUT_MS = 8_000;
const SITE_URL = 'https://itqanstudio.com';

export interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  ics?: { method: IcsMethod; content: string };
}

export type MailResult = { sent: true } | { sent: false; reason: 'not_configured' | 'failed' };

function smtp() {
  const host = process.env.SES_SMTP_HOST;
  const port = process.env.SES_SMTP_PORT;
  const user = process.env.SES_SMTP_USERNAME;
  const pass = process.env.SES_SMTP_PASSWORD;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!host || !port || !user || !pass || !from) return null;
  return {
    from,
    transport: nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      // On 587 the upgrade to TLS is mandatory, so a stripped STARTTLS fails instead of sending in clear.
      requireTLS: Number(port) !== 465,
      auth: { user, pass },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    }),
  };
}

/**
 * Sends one email. Without SMTP settings in development the message is printed
 * to the server log instead, so the booking flow can be tested on localhost.
 * In production a missing setting is an error, never a silent skip.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const conf = smtp();
  if (!conf) {
    if (process.env.NODE_ENV === 'development') {
      const ics = mail.ics ? ` ics=${mail.ics.method}` : '';
      console.info(`[mail:dev] to=${mail.to} subject=${mail.subject}${ics}\n${mail.text}`);
      return { sent: true };
    }
    console.error('[mail] SES SMTP settings are missing; email not sent:', mail.subject);
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await conf.transport.sendMail({
      from: `Itqan <${conf.from}>`,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      icalEvent: mail.ics ? { method: mail.ics.method, filename: 'itqan-briefing.ics', content: mail.ics.content } : undefined,
    });
    return { sent: true };
  } catch (err) {
    // The code only: nodemailer messages can carry recipient addresses.
    const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : 'unknown';
    console.error('[mail] send failed, code:', code);
    return { sent: false, reason: 'failed' };
  }
}

/** The call length in whole minutes, from the booked start and end. */
export function callMinutes(b: BookingForEmail): number {
  return Math.max(1, Math.round((Date.parse(b.end) - Date.parse(b.start)) / 60_000));
}

/** The host's video link, only when it is https. */
export function meetingLink(b: BookingForEmail): string | undefined {
  const url = b.host.meetingUrl;
  return url && /^https:\/\/[^\s]+$/.test(url) ? url : undefined;
}

/**
 * The guest's calendar file (PUBLISH, and the CANCEL that removes it). It
 * carries only static copy and the host's details, never a field the visitor
 * typed (their address is unverified). The founders get their own invite
 * (founders-mail.ts) with the same UID.
 */
export function bookingIcs(b: BookingForEmail, method: 'PUBLISH' | 'CANCEL'): string {
  const t = bookingCopy[b.locale].email;
  const host = localHostName(b.host, b.locale);
  const link = meetingLink(b);
  return buildIcs({
    uid: `${b.id}@itqanstudio.com`,
    start: new Date(b.start),
    end: new Date(b.end),
    summary: t.subject,
    description: [fill(t.confirmed, { n: callMinutes(b) }), link ? `${t.link}: ${link}` : fill(t.linkPending, { host })].join('\n'),
    location: link,
    organizerEmail: b.host.email,
    organizerName: host,
    method,
    sequence: method === 'CANCEL' ? 1 : 0,
  });
}

function localePath(b: BookingForEmail): string {
  return b.locale === 'ar' ? '/ar' : '';
}

function greeting(b: BookingForEmail): string {
  return `${bookingCopy[b.locale].email.hello}${b.locale === 'ar' ? '،' : ','}`;
}

export async function sendGuestConfirmation(b: BookingForEmail, cancelToken: string): Promise<MailResult> {
  const t = bookingCopy[b.locale].email;
  const host = localHostName(b.host, b.locale);
  const link = meetingLink(b);
  const text = [
    // No visitor-typed text in mail to the visitor's address: the address is not
    // verified, so a name field must not become a way to send a message as Itqan.
    greeting(b),
    '',
    fill(t.confirmed, { n: callMinutes(b) }),
    '',
    `${t.when}: ${formatWhen(b.start, b.guestTimezone, b.locale)}`,
    `${t.with}: ${host}`,
    link ? `${t.link}: ${link}` : fill(t.linkPending, { host }),
    '',
    t.prepare,
    '',
    t.cancelLine,
    `${SITE_URL}${localePath(b)}/book/cancel/${encodeURIComponent(cancelToken)}`,
    '',
    fill(t.signoff, { host }),
  ].join('\n');
  return sendMail({ to: b.guestEmail, replyTo: b.host.email, subject: t.subject, text, ics: { method: 'PUBLISH', content: bookingIcs(b, 'PUBLISH') } });
}

/** Static copy only, with the rebook link. `by` says who cancelled. */
export async function sendGuestCancellation(b: BookingForEmail, by: 'guest' | 'host'): Promise<MailResult> {
  const t = bookingCopy[b.locale].email;
  const when = formatWhen(b.start, b.guestTimezone, b.locale);
  const text = [
    // No visitor-typed text in mail to the visitor's address (see sendGuestConfirmation).
    greeting(b),
    '',
    `${by === 'guest' ? t.cancelledByYou : t.cancelledByUs} ${when}.`,
    '',
    t.rebook,
    `${SITE_URL}${localePath(b)}/book`,
    '',
    fill(t.signoff, { host: localHostName(b.host, b.locale) }),
  ].join('\n');
  return sendMail({
    to: b.guestEmail,
    replyTo: b.host.email,
    subject: t.cancelSubject,
    text,
    ics: { method: 'CANCEL', content: bookingIcs(b, 'CANCEL') },
  });
}
