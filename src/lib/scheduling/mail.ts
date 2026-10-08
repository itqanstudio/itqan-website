import nodemailer from 'nodemailer';
import { bookingCopy, formatWhen } from '@/content/v3/booking';
import { buildIcs } from './ics';
import type { Booking } from './types';

/** Short, because the booking response waits for the confirmation email. */
const SMTP_TIMEOUT_MS = 8_000;
const STUDIO_EMAIL = 'ibrahim@itqanstudio.com';
const SITE_URL = 'https://itqanstudio.com';

interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  ics?: { method: 'PUBLISH' | 'CANCEL'; content: string };
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
 * to the server log instead, so the booking and sign-in flows can be tested on
 * localhost. In production a missing setting is an error, never a silent skip.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const conf = smtp();
  if (!conf) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[mail:dev] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
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

export function studioInbox(): string {
  return process.env.BOOKING_NOTIFY_EMAIL || process.env.FEEDBACK_TO_EMAIL || STUDIO_EMAIL;
}

export function meetingUrl(): string | undefined {
  const url = process.env.BOOKING_MEETING_URL;
  return url && /^https:\/\//.test(url) ? url : undefined;
}

/**
 * The calendar file. The guest's copy carries only static copy, never a field
 * the visitor typed (their address is unverified); the studio's copy names the
 * company so the event reads well in Ibrahim's calendar.
 */
export function bookingIcs(b: Booking, method: 'PUBLISH' | 'CANCEL', audience: 'guest' | 'studio'): string {
  const t = bookingCopy[b.locale];
  const link = meetingUrl();
  return buildIcs({
    uid: `${b.id}@itqanstudio.com`,
    start: new Date(b.startUtc),
    end: new Date(b.endUtc),
    summary: audience === 'studio' ? `Itqan briefing · ${b.company}` : t.email.subject,
    description: [t.email.confirmed, link ? `${t.email.link}: ${link}` : t.email.linkPending].join('\n'),
    location: link,
    organizerEmail: STUDIO_EMAIL,
    method,
    sequence: method === 'CANCEL' ? 1 : 0,
  });
}

function cancelUrl(b: Booking, token: string): string {
  return `${SITE_URL}${b.locale === 'ar' ? '/ar' : ''}/book/cancel/${token}`;
}

export async function sendGuestConfirmation(b: Booking, cancelToken: string): Promise<MailResult> {
  const t = bookingCopy[b.locale].email;
  const link = meetingUrl();
  const text = [
    // No visitor-typed text in mail to the visitor's address: the address is not
    // verified, so a name field must not become a way to send a message as Itqan.
    `${t.hello}${b.locale === 'ar' ? '،' : ','}`,
    '',
    t.confirmed,
    '',
    `${t.when}: ${formatWhen(b.startUtc, b.timezone, b.locale)}`,
    `${t.with}: ${t.signoff}`,
    link ? `${t.link}: ${link}` : t.linkPending,
    '',
    t.prepare,
    '',
    t.cancelLine,
    cancelUrl(b, cancelToken),
    '',
    t.signoff,
  ].join('\n');
  return sendMail({ to: b.email, replyTo: STUDIO_EMAIL, subject: t.subject, text, ics: { method: 'PUBLISH', content: bookingIcs(b, 'PUBLISH', 'guest') } });
}

export async function sendStudioNotice(b: Booking): Promise<MailResult> {
  const text = [
    `New briefing: ${formatWhen(b.startUtc, 'Asia/Dubai', 'en')}`,
    `Guest time: ${formatWhen(b.startUtc, b.timezone, 'en')}`,
    '',
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    `Company: ${b.company}`,
    `Role: ${b.role || '-'}`,
    `Industry: ${b.industry}`,
    `Topic: ${b.topic}`,
    `Language: ${b.locale}`,
    '',
    'First job for an agent:',
    b.message || '-',
    '',
    `Manage: ${SITE_URL}/admin`,
  ].join('\n');
  return sendMail({
    to: studioInbox(),
    replyTo: b.email,
    subject: `[briefing] ${b.company} · ${b.name}`,
    text,
    ics: { method: 'PUBLISH', content: bookingIcs(b, 'PUBLISH', 'studio') },
  });
}

export async function sendCancellation(b: Booking, by: 'guest' | 'admin'): Promise<MailResult[]> {
  const t = bookingCopy[b.locale].email;
  const when = formatWhen(b.startUtc, b.timezone, b.locale);
  const rebook = `${SITE_URL}${b.locale === 'ar' ? '/ar' : ''}/book`;
  const guestText = [
    // No visitor-typed text in mail to the visitor's address: the address is not
    // verified, so a name field must not become a way to send a message as Itqan.
    `${t.hello}${b.locale === 'ar' ? '،' : ','}`,
    '',
    `${by === 'guest' ? t.cancelledByYou : t.cancelledByUs} ${when}.`,
    '',
    t.rebook,
    rebook,
    '',
    t.signoff,
  ].join('\n');
  return Promise.all([
    sendMail({
      to: b.email,
      replyTo: STUDIO_EMAIL,
      subject: t.cancelSubject,
      text: guestText,
      ics: { method: 'CANCEL', content: bookingIcs(b, 'CANCEL', 'guest') },
    }),
    sendMail({
      to: studioInbox(),
      subject: `[briefing cancelled by ${by}] ${b.company} · ${b.name}`,
      text: `Cancelled: ${formatWhen(b.startUtc, 'Asia/Dubai', 'en')}\n${b.name} <${b.email}>, ${b.company}`,
      ics: { method: 'CANCEL', content: bookingIcs(b, 'CANCEL', 'studio') },
    }),
  ]);
}

export async function sendLoginLink(email: string, url: string): Promise<MailResult> {
  return sendMail({
    to: email,
    subject: 'Sign in to the Itqan booking admin',
    text: [
      'Open this link to sign in. It works once and expires in 15 minutes.',
      '',
      url,
      '',
      'If you did not ask for it, ignore this email. Nobody can sign in without the link.',
    ].join('\n'),
  });
}
