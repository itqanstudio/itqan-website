import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bookingIcs, meetingUrl, sendCancellation, sendGuestConfirmation, sendLoginLink, sendMail, sendStudioNotice, studioInbox } from './mail';
import type { Booking } from './types';

const booking: Booking = {
  id: 'b3c1d2e4-0000-4000-8000-000000000001',
  startUtc: '2026-10-12T06:00:00.000Z',
  endUtc: '2026-10-12T06:30:00.000Z',
  name: 'Click http://phish.example now',
  email: 'guest@example.com',
  company: 'Example Foods',
  role: 'COO',
  industry: 'fnb',
  message: 'Catering requests',
  topic: 'briefing',
  locale: 'en',
  timezone: 'Europe/Stockholm',
  status: 'confirmed',
  createdAt: '2026-10-08T10:00:00.000Z',
  cancelledAt: null,
  cancelledBy: null,
};

let printed: string[] = [];

beforeEach(() => {
  printed = [];
  // No SMTP settings: in development the mail goes to the log, which the tests read.
  ['SES_SMTP_HOST', 'SES_SMTP_PORT', 'SES_SMTP_USERNAME', 'SES_SMTP_PASSWORD', 'CONTACT_FROM_EMAIL', 'BOOKING_MEETING_URL', 'BOOKING_NOTIFY_EMAIL', 'FEEDBACK_TO_EMAIL'].forEach((k) =>
    vi.stubEnv(k, ''),
  );
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
  it('prints instead of sending in development without SMTP', async () => {
    expect(await sendMail({ to: 'a@b.c', subject: 'Hi', text: 'Body' })).toEqual({ sent: true });
    expect(printed[0]).toContain('subject=Hi');
  });
  it('fails loudly, never silently, in production without SMTP', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await sendMail({ to: 'a@b.c', subject: 'Hi', text: 'Body' })).toEqual({ sent: false, reason: 'not_configured' });
    expect(console.error).toHaveBeenCalled();
    expect(printed).toHaveLength(0);
  });
});

describe('booking emails', () => {
  it('confirms in the guest language and time zone, with no visitor-typed text', async () => {
    await sendGuestConfirmation(booking, 'tok_abcdefghijklmnopqrstuvwxyz');
    const mail = printed[0];
    expect(mail).toContain('to=guest@example.com');
    expect(mail).toContain('08:00 (Europe/Stockholm)');
    expect(mail).toContain('https://itqanstudio.com/book/cancel/tok_abcdefghijklmnopqrstuvwxyz');
    expect(mail).not.toContain('phish');
    expect(mail).not.toContain('Example Foods');
  });
  it('uses the Arabic copy and the /ar cancel link for Arabic bookings', async () => {
    await sendGuestConfirmation({ ...booking, locale: 'ar' }, 'tok_abcdefghijklmnopqrstuvwxyz');
    expect(printed[0]).toContain('مرحباً،');
    expect(printed[0]).toContain('/ar/book/cancel/');
  });
  it('tells the studio everything, in Dubai time', async () => {
    await sendStudioNotice(booking);
    expect(printed[0]).toContain('to=ibrahim@itqanstudio.com');
    expect(printed[0]).toContain('10:00 (Asia/Dubai)');
    expect(printed[0]).toContain('Catering requests');
  });
  it('sends cancellations to both sides', async () => {
    await sendCancellation(booking, 'admin');
    expect(printed).toHaveLength(2);
    expect(printed[0]).toContain('We had to cancel');
  });
  it('emails a sign-in link', async () => {
    await sendLoginLink('ibrahim@itqanstudio.com', 'https://itqanstudio.com/admin/verify?token=x');
    expect(printed[0]).toContain('admin/verify?token=x');
  });
});

describe('settings', () => {
  it('routes studio mail by env, with a default', () => {
    expect(studioInbox()).toBe('ibrahim@itqanstudio.com');
    vi.stubEnv('BOOKING_NOTIFY_EMAIL', 'bookings@itqanstudio.com');
    expect(studioInbox()).toBe('bookings@itqanstudio.com');
  });
  it('accepts only https meeting links', () => {
    vi.stubEnv('BOOKING_MEETING_URL', 'javascript:alert(1)');
    expect(meetingUrl()).toBeUndefined();
    vi.stubEnv('BOOKING_MEETING_URL', 'https://meet.google.com/abc-defg-hij');
    expect(meetingUrl()).toBe('https://meet.google.com/abc-defg-hij');
    expect(bookingIcs(booking, 'PUBLISH')).toContain('LOCATION:https://meet.google.com/abc-defg-hij');
  });
  it('builds a cancel invite with the booking UID', () => {
    const ics = bookingIcs(booking, 'CANCEL');
    expect(ics).toContain(`UID:${booking.id}@itqanstudio.com`);
    expect(ics).toContain('METHOD:CANCEL');
  });
});
