import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingForEmail } from '@/lib/crm/contract';
import { bookingIcs, callMinutes, meetingLink, sendGuestCancellation, sendGuestConfirmation, sendMail } from './mail';

const booking: BookingForEmail = {
  id: 'b3c1d2e4-0000-4000-8000-000000000001',
  start: '2026-10-12T06:00:00.000Z',
  end: '2026-10-12T06:45:00.000Z',
  guestName: 'Click http://phish.example now',
  guestEmail: 'guest@example.com',
  company: 'Example Foods',
  role: 'COO',
  industry: 'fnb',
  message: 'Catering requests',
  topic: 'briefing',
  locale: 'en',
  guestTimezone: 'Europe/Stockholm',
  host: { slug: 'bisma', name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', meetingUrl: null },
  team: [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: false },
    { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: true },
  ],
};

let printed: string[] = [];

beforeEach(() => {
  printed = [];
  // No SMTP settings: in development the mail goes to the log, which the tests read.
  ['SES_SMTP_HOST', 'SES_SMTP_PORT', 'SES_SMTP_USERNAME', 'SES_SMTP_PASSWORD', 'CONTACT_FROM_EMAIL'].forEach((k) => vi.stubEnv(k, ''));
  vi.stubEnv('NODE_ENV', 'development');
  vi.spyOn(console, 'info').mockImplementation((msg: string) => {
    printed.push(msg);
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendMail', () => {
  it('prints instead of sending in development without SMTP, naming the calendar method', async () => {
    expect(await sendMail({ to: 'a@b.c', subject: 'Hi', text: 'Body' })).toEqual({ sent: true });
    expect(printed[0]).toContain('subject=Hi');
    await sendMail({ to: 'a@b.c', subject: 'Invite', text: 'Body', ics: { method: 'REQUEST', content: 'x' } });
    expect(printed[1]).toContain('subject=Invite ics=REQUEST');
  });
  it('fails loudly, never silently, in production without SMTP', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await sendMail({ to: 'a@b.c', subject: 'Hi', text: 'Body' })).toEqual({ sent: false, reason: 'not_configured' });
    expect(console.error).toHaveBeenCalled();
    expect(printed).toHaveLength(0);
  });
});

describe('guest confirmation', () => {
  it('names the host and the call length, in the guest language and zone, with no visitor-typed text', async () => {
    await sendGuestConfirmation(booking, 'tok_abcdefghijklmnopqrstuvwxyz');
    const mail = printed[0];
    expect(mail).toContain('to=guest@example.com');
    expect(mail).toContain('ics=PUBLISH');
    expect(mail).toContain('Your 45-minute briefing with Itqan is booked.');
    expect(mail).toContain('08:00 (Europe/Stockholm)');
    expect(mail).toContain('With: Bisma Aslam');
    expect(mail).toContain('Bisma Aslam will send the video link before the call.');
    expect(mail).toContain('Bisma Aslam, Itqan');
    expect(mail).toContain('https://itqanstudio.com/book/cancel/tok_abcdefghijklmnopqrstuvwxyz');
    expect(mail).not.toContain('phish');
    expect(mail).not.toContain('Example Foods');
    expect(mail).not.toContain('Catering');
  });

  it('uses the Arabic copy, the Arabic host name and the /ar cancel link for Arabic bookings', async () => {
    await sendGuestConfirmation({ ...booking, locale: 'ar' }, 'tok_abcdefghijklmnopqrstuvwxyz');
    expect(printed[0]).toContain('مرحباً،');
    expect(printed[0]).toContain('بسمة أسلم');
    expect(printed[0]).toContain('ومدتها 45 دقيقة');
    expect(printed[0]).toContain('/ar/book/cancel/');
  });

  it('includes the host meeting link when there is one', async () => {
    await sendGuestConfirmation({ ...booking, host: { ...booking.host, meetingUrl: 'https://meet.google.com/abc-defg-hij' } }, 'tok_abcdefghijklmnopqrstuvwxyz');
    expect(printed[0]).toContain('Video call: https://meet.google.com/abc-defg-hij');
  });
});

describe('guest cancellation', () => {
  it('a host cancel tells the guest in static copy, with the calendar CANCEL', async () => {
    await sendGuestCancellation(booking, 'host');
    expect(printed).toHaveLength(1);
    expect(printed[0]).toContain('to=guest@example.com');
    expect(printed[0]).toContain('ics=CANCEL');
    expect(printed[0]).toContain('We had to cancel your briefing on');
    expect(printed[0]).toContain('https://itqanstudio.com/book');
    expect(printed[0]).not.toContain('phish');
  });
  it('a guest cancel says they cancelled it', async () => {
    await sendGuestCancellation(booking, 'guest');
    expect(printed[0]).toContain('You cancelled your briefing on');
  });
});

describe('the guest calendar file and helpers', () => {
  it('derives the call length from start and end', () => {
    expect(callMinutes(booking)).toBe(45);
    expect(callMinutes({ ...booking, end: booking.start })).toBe(1);
  });
  it('accepts only https meeting links', () => {
    expect(meetingLink(booking)).toBeUndefined();
    expect(meetingLink({ ...booking, host: { ...booking.host, meetingUrl: 'javascript:alert(1)' } })).toBeUndefined();
    const withLink = { ...booking, host: { ...booking.host, meetingUrl: 'https://meet.google.com/abc-defg-hij' } };
    expect(meetingLink(withLink)).toBe('https://meet.google.com/abc-defg-hij');
    expect(bookingIcs(withLink, 'PUBLISH')).toContain('LOCATION:https://meet.google.com/abc-defg-hij');
  });
  it('stays as it was: PUBLISH, the host as organizer, no attendees and nothing the visitor typed', () => {
    const evil = { ...booking, company: 'Pay now at http://phish.example' };
    const guest = bookingIcs(evil, 'PUBLISH');
    expect(guest).toContain('METHOD:PUBLISH');
    expect(guest).not.toContain('phish');
    expect(guest).not.toContain('ATTENDEE');
    expect(guest).toContain('ORGANIZER;CN="Bisma Aslam":mailto:bisma@itqanstudio.com');
    expect(guest).toContain('SUMMARY:Your Itqan briefing');
  });
  it('builds a cancel with the booking UID', () => {
    const ics = bookingIcs(booking, 'CANCEL');
    expect(ics).toContain(`UID:${booking.id}@itqanstudio.com`);
    expect(ics).toContain('METHOD:CANCEL');
    expect(ics).toContain('SEQUENCE:1');
  });
});
