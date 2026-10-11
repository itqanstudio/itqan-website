import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingForEmail } from '@/lib/crm/contract';
import {
  CANCEL_RETRY_DELAYS_MS,
  FOUNDERS_CANCEL_WAIT_MS,
  clearFounderMemory,
  foundersCancelWent,
  sendFounderCancellations,
  sendFounderInvites,
} from './founders-mail';
import type { Mail, MailResult } from './mail';

/*
 * What the CRM's notify call hears about the founders' calendar CANCEL (code
 * review M2): true only when every founder on the booking has had it, so the
 * CRM stops offering Send calendar cancel again only then. A mail server this
 * test controls; vi.mock is hoisted above the imports.
 */

const sendMail = vi.hoisted(() => vi.fn<(mail: Mail) => Promise<MailResult>>());
vi.mock('./mail', async (importOriginal) => ({ ...(await importOriginal<typeof import('./mail')>()), sendMail }));

const booking: BookingForEmail = {
  id: 'b3c1d2e4-0000-4000-8000-000000000009',
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

/** A host cancel as the notify route runs it: the CANCEL starts, and the answer waits for it a short while. */
const cancelAndAnswer = (b: BookingForEmail = booking) => foundersCancelWent(b, sendFounderCancellations(b, { by: 'host' }));
const toBisma = (mail: Mail) => mail.to.startsWith('bisma');

beforeEach(() => {
  clearFounderMemory();
  sendMail.mockReset();
  vi.stubEnv('CONTACT_FROM_EMAIL', 'bookings@itqanstudio.com');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  clearFounderMemory();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("the notify answer about the founders' cancel (code review M2)", () => {
  it('is true once every founder has had the CANCEL, and leaves no timer behind', async () => {
    vi.useFakeTimers();
    sendMail.mockResolvedValue({ sent: true });
    expect(await cancelAndAnswer()).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is false when one founder's CANCEL failed, and true for Send calendar cancel again once the retry sent it", async () => {
    vi.useFakeTimers();
    let bismaFails = 1;
    sendMail.mockImplementation((mail) => {
      if (toBisma(mail) && bismaFails > 0) {
        bismaFails -= 1;
        return Promise.resolve<MailResult>({ sent: false, reason: 'failed' });
      }
      return Promise.resolve<MailResult>({ sent: true });
    });
    expect(await cancelAndAnswer()).toBe(false);
    await vi.advanceTimersByTimeAsync(CANCEL_RETRY_DELAYS_MS[0]);
    expect(sendMail).toHaveBeenCalledTimes(3);
    // Nothing is sent twice: both CANCELs went, so the repeat answers true.
    expect(await cancelAndAnswer()).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(3);
  });

  it('is false when the mail call throws', async () => {
    sendMail.mockImplementation((mail) => (toBisma(mail) ? Promise.reject(new Error('socket hang up')) : Promise.resolve<MailResult>({ sent: true })));
    expect(await cancelAndAnswer()).toBe(false);
  });

  it('is false when nothing can be sent (no usable organizer in production)', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(await cancelAndAnswer()).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('answers false when the wait runs out with a send still going; the send carries on and is not repeated', async () => {
    vi.useFakeTimers();
    let release: () => void = () => undefined;
    const hanging = new Promise<MailResult>((resolve) => {
      release = () => resolve({ sent: true });
    });
    sendMail.mockImplementation((mail) => (toBisma(mail) ? hanging : Promise.resolve<MailResult>({ sent: true })));
    let answer: boolean | undefined;
    void cancelAndAnswer().then((a) => {
      answer = a;
    });
    await vi.advanceTimersByTimeAsync(FOUNDERS_CANCEL_WAIT_MS - 1);
    expect(answer).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(answer).toBe(false);
    // Send calendar cancel again while Bisma's first send is still going: no second email, still false.
    expect(await cancelAndAnswer()).toBe(false);
    expect(sendMail).toHaveBeenCalledTimes(2);
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(await cancelAndAnswer()).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is false while the CANCEL still waits for that booking's invite send", async () => {
    vi.useFakeTimers();
    sendMail.mockImplementation((mail) =>
      mail.ics?.method === 'REQUEST' ? new Promise<MailResult>(() => undefined) : Promise.resolve<MailResult>({ sent: true }),
    );
    void sendFounderInvites(booking);
    const answer = cancelAndAnswer();
    await vi.advanceTimersByTimeAsync(FOUNDERS_CANCEL_WAIT_MS);
    expect(await answer).toBe(false);
  });

  it('is true for an empty team: the CRM listed nobody, so no cancel is owed', async () => {
    expect(await cancelAndAnswer({ ...booking, team: [] })).toBe(true);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("waits only a few seconds, well inside the CRM's 8 second notify call", () => {
    expect(FOUNDERS_CANCEL_WAIT_MS).toBeGreaterThanOrEqual(2_000);
    expect(FOUNDERS_CANCEL_WAIT_MS).toBeLessThanOrEqual(5_000);
  });
});
