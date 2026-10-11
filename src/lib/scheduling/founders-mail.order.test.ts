import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingForEmail } from '@/lib/crm/contract';
import { FOUNDER_MEMORY_MAX, clearFounderMemory, founderMemorySize, sendFounderCancellations, sendFounderInvites } from './founders-mail';
import type { Mail, MailResult } from './mail';

/*
 * The founders' sends with a mail server this test controls: a cancel waits for
 * the same booking's invite, and a send that failed is tried again later.
 * vi.mock is hoisted above the imports, so founders-mail sees this sendMail.
 */

const sendMail = vi.hoisted(() => vi.fn<(mail: Mail) => Promise<MailResult>>());
vi.mock('./mail', async (importOriginal) => ({ ...(await importOriginal<typeof import('./mail')>()), sendMail }));

const booking: BookingForEmail = {
  id: 'b3c1d2e4-0000-4000-8000-000000000001',
  start: '2026-10-12T06:00:00.000Z',
  end: '2026-10-12T06:30:00.000Z',
  guestName: 'Sara Ahmed',
  guestEmail: 'sara@example.com',
  company: 'Example Foods',
  role: 'COO',
  industry: 'fnb',
  message: '',
  topic: 'briefing',
  locale: 'en',
  guestTimezone: 'Asia/Riyadh',
  host: { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', meetingUrl: null },
  team: [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true },
    { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: false },
  ],
};

/** Lets every queued promise callback run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const methods = () => sendMail.mock.calls.map(([mail]) => `${mail.ics?.method} ${mail.to}`);

beforeEach(() => {
  clearFounderMemory();
  sendMail.mockReset();
  vi.stubEnv('CONTACT_FROM_EMAIL', 'bookings@itqanstudio.com');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('a cancel never overtakes its invite', () => {
  it("waits for that booking's invite to finish before sending the CANCEL", async () => {
    let release: () => void = () => undefined;
    const slow = new Promise<MailResult>((resolve) => {
      release = () => resolve({ sent: true });
    });
    sendMail.mockImplementation((mail) => (mail.ics?.method === 'REQUEST' ? slow : Promise.resolve({ sent: true })));

    const invites = sendFounderInvites(booking);
    const cancels = sendFounderCancellations(booking, { by: 'guest' });
    await settle();
    expect(methods()).toEqual(['REQUEST ibrahim@itqanstudio.com', 'REQUEST bisma@itqanstudio.com']);

    release();
    expect(await invites).toEqual([{ sent: true }, { sent: true }]);
    expect(await cancels).toEqual([{ sent: true }, { sent: true }]);
    expect(methods()).toEqual([
      'REQUEST ibrahim@itqanstudio.com',
      'REQUEST bisma@itqanstudio.com',
      'CANCEL ibrahim@itqanstudio.com',
      'CANCEL bisma@itqanstudio.com',
    ]);
  });

  it('still sends the CANCEL when the invite failed, and does not wait on another booking', async () => {
    let release: () => void = () => undefined;
    sendMail.mockImplementation((mail) =>
      mail.ics?.method === 'REQUEST'
        ? new Promise<MailResult>((resolve) => {
            release = () => resolve({ sent: false, reason: 'failed' });
          })
        : Promise.resolve({ sent: true }),
    );
    const invites = sendFounderInvites({ ...booking, team: [booking.team[0]] });
    // Another booking's cancel goes at once.
    expect(await sendFounderCancellations({ ...booking, id: 'b3c1d2e4-0000-4000-8000-000000000009' }, { by: 'host' })).toHaveLength(2);
    release();
    await invites;
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([{ sent: true }, { sent: true }]);
  });

  it('sends the cancel right away when no invite is running', async () => {
    sendMail.mockResolvedValue({ sent: true });
    const cancels = sendFounderCancellations(booking, { by: 'host' });
    expect(sendMail).toHaveBeenCalledTimes(2);
    await cancels;
  });
});

describe('a booking this process has started cancelling (review r2)', () => {
  const other = 'b3c1d2e4-0000-4000-8000-000000000002';

  it('gets no founders invite afterwards, so no calendar keeps the cancelled briefing', async () => {
    sendMail.mockResolvedValue({ sent: true });
    const cancels = sendFounderCancellations(booking, { by: 'guest' });
    expect(await sendFounderInvites(booking)).toEqual([]);
    await cancels;
    expect(methods()).toEqual(['CANCEL ibrahim@itqanstudio.com', 'CANCEL bisma@itqanstudio.com']);
    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/already cancelled/), booking.id);
    // Another booking is still invited.
    expect(await sendFounderInvites({ ...booking, id: other })).toHaveLength(2);
  });

  it('blocks the invite even when the cancel itself could not send', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([
      { sent: false, reason: 'not_configured' },
      { sent: false, reason: 'not_configured' },
    ]);
    vi.stubEnv('CONTACT_FROM_EMAIL', 'bookings@itqanstudio.com');
    sendMail.mockResolvedValue({ sent: true });
    expect(await sendFounderInvites(booking)).toEqual([]);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('the send memory (review r2)', () => {
  const one = { ...booking, team: [booking.team[0]] };
  const id = (n: number) => `b3c1d2e4-0000-4000-8000-${String(n).padStart(12, '0')}`;

  it('sends once when two calls for the same booking come at once', async () => {
    sendMail.mockResolvedValue({ sent: true });
    const [first, second] = await Promise.all([sendFounderInvites(booking), sendFounderInvites(booking)]);
    expect(first).toEqual([{ sent: true }, { sent: true }]);
    expect(second).toEqual([]);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it('never drops a send that is still going to make room, so a retry of it does not send it again', async () => {
    let release: () => void = () => undefined;
    const hanging = new Promise<MailResult>((resolve) => {
      release = () => resolve({ sent: true });
    });
    sendMail.mockImplementationOnce(() => hanging).mockResolvedValue({ sent: true });
    const first = sendFounderInvites({ ...one, id: id(0) });
    // A full memory of sends that went, all after the one still going.
    for (let n = 1; n <= FOUNDER_MEMORY_MAX; n += 1) await sendFounderInvites({ ...one, id: id(n) });
    expect(await sendFounderInvites({ ...one, id: id(0) })).toEqual([]);
    expect(sendMail).toHaveBeenCalledTimes(FOUNDER_MEMORY_MAX + 1);
    release();
    expect(await first).toEqual([{ sent: true }]);
    // Once it went it is remembered like any other, and the memory stays bounded.
    expect(await sendFounderInvites({ ...one, id: id(0) })).toEqual([]);
    expect(founderMemorySize()).toBe(FOUNDER_MEMORY_MAX);
  });
});

describe('a founder email that did not go', () => {
  it('is not remembered, so the next call sends it; the one that went is not repeated', async () => {
    sendMail.mockImplementation((mail) =>
      Promise.resolve<MailResult>(mail.to.startsWith('bisma') ? { sent: false, reason: 'failed' } : { sent: true }),
    );
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([{ sent: true }, { sent: false, reason: 'failed' }]);
    expect(founderMemorySize()).toBe(1);
    sendMail.mockResolvedValue({ sent: true });
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([{ sent: true }]);
    expect(methods().slice(2)).toEqual(['CANCEL bisma@itqanstudio.com']);
  });

  it('is not remembered when the mail call throws either, and the answer never throws', async () => {
    sendMail.mockRejectedValueOnce(new Error('socket hang up')).mockResolvedValue({ sent: true });
    const first = await sendFounderInvites({ ...booking, team: [booking.team[0]] });
    expect(first).toEqual([{ sent: false, reason: 'failed' }]);
    expect(founderMemorySize()).toBe(0);
    expect(await sendFounderInvites({ ...booking, team: [booking.team[0]] })).toEqual([{ sent: true }]);
  });
});
