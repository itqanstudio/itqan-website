import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingForEmail } from '@/lib/crm/contract';
import {
  FOUNDER_MEMORY_MAX,
  clearFounderMemory,
  finishInBackground,
  founderMemorySize,
  foundersIcs,
  logFounderSends,
  sendFounderCancellations,
  sendFounderInvites,
  senderAddress,
  shortWhen,
} from './founders-mail';

const booking: BookingForEmail = {
  id: 'b3c1d2e4-0000-4000-8000-000000000001',
  start: '2026-10-12T06:00:00.000Z',
  end: '2026-10-12T06:30:00.000Z',
  guestName: 'Sara Ahmed',
  guestEmail: 'sara@example.com',
  company: 'Example Foods, Dubai',
  role: 'COO',
  industry: 'fnb',
  message: 'Catering requests; quotes by WhatsApp',
  topic: 'briefing',
  locale: 'en',
  guestTimezone: 'Asia/Riyadh',
  host: { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', meetingUrl: 'https://meet.google.com/abc-defg-hij' },
  team: [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true },
    { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: false },
  ],
};

const ORGANIZER = 'bookings@itqanstudio.com';
const unfold = (ics: string) => ics.replace(/\r\n /g, '');
const lines = (ics: string) => unfold(ics).split('\r\n');

let printed: string[] = [];

beforeEach(() => {
  printed = [];
  clearFounderMemory();
  ['SES_SMTP_HOST', 'SES_SMTP_PORT', 'SES_SMTP_USERNAME', 'SES_SMTP_PASSWORD'].forEach((k) => vi.stubEnv(k, ''));
  vi.stubEnv('CONTACT_FROM_EMAIL', ORGANIZER);
  vi.stubEnv('NODE_ENV', 'development');
  vi.spyOn(console, 'info').mockImplementation((msg: string) => {
    printed.push(msg);
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('the founders invite (METHOD:REQUEST)', () => {
  it('is one event from the studio, the host required and the other founder optional, both asked to answer', () => {
    const ics = lines(foundersIcs(booking, ORGANIZER));
    expect(ics).toContain('METHOD:REQUEST');
    expect(ics).toContain(`UID:${booking.id}@itqanstudio.com`);
    expect(ics).toContain('SEQUENCE:0');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics.some((l) => /^DTSTAMP:\d{8}T\d{6}Z$/.test(l))).toBe(true);
    expect(ics).toContain('ORGANIZER;CN="Itqan Studio":mailto:bookings@itqanstudio.com');
    expect(ics).toContain('ATTENDEE;CN="Ibrahim Shareef";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:ibrahim@itqanstudio.com');
    expect(ics).toContain('ATTENDEE;CN="Bisma Aslam";ROLE=OPT-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:bisma@itqanstudio.com');
    expect(ics).toContain('LOCATION:https://meet.google.com/abc-defg-hij');
    expect(ics).toContain('SUMMARY:Itqan briefing: Sara Ahmed\\, Example Foods\\, Dubai');
    expect(ics.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(1);
  });

  it('describes the guest, the notes, who hosts and where it is in the CRM', () => {
    const description = lines(foundersIcs(booking, ORGANIZER)).find((l) => l.startsWith('DESCRIPTION:'));
    expect(description).toBe(
      'DESCRIPTION:Guest: Sara Ahmed (sara@example.com)\\nCompany: Example Foods\\, Dubai\\nNotes: Catering requests\\; quotes by WhatsApp\\nHost: Ibrahim Shareef\\nVideo call: https://meet.google.com/abc-defg-hij\\nOpen in the CRM: https://portal.itqanstudio.com/calendar?booking=b3c1d2e4-0000-4000-8000-000000000001'
    );
  });

  it('neutralises markup in what the guest typed (calendars render the description as HTML), and keeps the links plain', () => {
    const typed = {
      ...booking,
      guestName: 'Sara <a href="https://evil.example">Ahmed</a>',
      company: 'Foods & <b>Co</b>',
      role: '<i>COO</i>',
      message: '<img src=x onerror=alert(1)> see &lt;this&gt;',
    };
    const ics = lines(foundersIcs(typed, ORGANIZER, { by: 'guest', reason: '<script>x</script> & more' }));
    const summary = ics.find((l) => l.startsWith('SUMMARY:')) ?? '';
    const description = ics.find((l) => l.startsWith('DESCRIPTION:')) ?? '';
    expect(summary).not.toMatch(/[<>&]/);
    expect(description).not.toMatch(/[<>&]/);
    expect(summary).toBe('SUMMARY:Itqan briefing: Sara ‹a href="https://evil.example"›Ahmed‹/a›\\, Foods ＆ ‹b›Co‹/b›');
    expect(description).toContain('Their reason: ‹script›x‹/script› ＆ more');
    expect(description).toContain('Guest: Sara ‹a href="https://evil.example"›Ahmed‹/a› (sara@example.com)');
    expect(description).toContain('Notes: ‹img src=x onerror=alert(1)› see ＆lt\\;this＆gt\\;');
    expect(description).toContain('Video call: https://meet.google.com/abc-defg-hij');
    expect(description).toContain('Open in the CRM: https://portal.itqanstudio.com/calendar?booking=b3c1d2e4-0000-4000-8000-000000000001');
  });

  it('strips bidi overrides from the subject and the calendar text, whatever the CRM sent', async () => {
    const rlo = String.fromCodePoint(0x202e);
    const lri = String.fromCodePoint(0x2066);
    const typed = { ...booking, guestName: `Sara${rlo} Ahmed`, company: `${lri}Example Foods` };
    const ics = unfold(foundersIcs(typed, ORGANIZER, { by: 'guest', reason: `moved${rlo}` }));
    expect(ics).not.toContain(rlo);
    expect(ics).not.toContain(lri);
    await sendFounderInvites(typed);
    expect(printed[0]).toContain('subject=[briefing] Sara Ahmed, Example Foods, Mon 12 Oct');
    expect(printed.join('')).not.toContain(rlo);
  });

  it('sends one email per founder, to that founder, naming the guest, company and time, saying who hosts', async () => {
    const results = await sendFounderInvites(booking);
    expect(results).toEqual([{ sent: true }, { sent: true }]);
    expect(printed).toHaveLength(2);
    const [toIbrahim, toBisma] = printed;
    expect(toIbrahim).toContain('to=ibrahim@itqanstudio.com subject=[briefing] Sara Ahmed, Example Foods, Dubai, Mon 12 Oct 10:00 Dubai, 08:00 Stockholm ics=REQUEST');
    expect(toIbrahim).toContain('New briefing, 30 minutes. You host it.');
    expect(toBisma).toContain('to=bisma@itqanstudio.com');
    expect(toBisma).toContain('New briefing, 30 minutes. Ibrahim Shareef hosts it.');
    // The comma after the weekday depends on the ICU version, so match the stable part.
    expect(toBisma).toMatch(/Time: Monday,? 12 October 2026, 08:00 \(Europe\/Stockholm\)/);
    expect(toBisma).toContain('Catering requests; quotes by WhatsApp');
    expect(toBisma).toContain('Open in the CRM: https://portal.itqanstudio.com/calendar?booking=b3c1d2e4-0000-4000-8000-000000000001');
  });

  it('writes the date again in the subject only when the founders are on different days', () => {
    expect(shortWhen('2026-10-12T06:00:00.000Z')).toBe('Mon 12 Oct 10:00 Dubai, 08:00 Stockholm');
    // 01:00 Tuesday in Dubai is 23:00 Monday in Stockholm.
    expect(shortWhen('2026-10-12T21:00:00.000Z')).toBe('Tue 13 Oct 01:00 Dubai, Mon 12 Oct 23:00 Stockholm');
  });
});

describe('the founders cancel (METHOD:CANCEL)', () => {
  it('withdraws the same event: same UID, organizer and attendees, sequence 1, STATUS:CANCELLED', () => {
    const invite = lines(foundersIcs(booking, ORGANIZER));
    const cancel = lines(foundersIcs(booking, ORGANIZER, { by: 'host' }));
    expect(cancel).toContain('METHOD:CANCEL');
    expect(cancel).toContain('SEQUENCE:1');
    expect(cancel).toContain('STATUS:CANCELLED');
    const same = (l: string) => /^(UID|ORGANIZER|ATTENDEE|DTSTART|DTEND|SUMMARY)/.test(l);
    expect(cancel.filter(same)).toEqual(invite.filter(same));
  });

  it("carries the guest's reason when they gave one", async () => {
    const ics = unfold(foundersIcs(booking, ORGANIZER, { by: 'guest', reason: 'We chose another supplier, sorry.\nMaybe next year.' }));
    expect(ics).toContain('DESCRIPTION:Cancelled by the guest.\\nTheir reason: We chose another supplier\\, sorry.\\nMaybe next year.\\n\\nGuest: Sara Ahmed');
    await sendFounderCancellations(booking, { by: 'guest', reason: 'We chose another supplier, sorry.' });
    expect(printed).toHaveLength(2);
    expect(printed[0]).toContain('subject=[briefing cancelled by guest] Sara Ahmed');
    expect(printed[0]).toContain('ics=CANCEL');
    expect(printed[0]).toContain('The guest cancelled this briefing. You were hosting it.');
    expect(printed[1]).toContain('Ibrahim Shareef was hosting it.');
    expect(printed[1]).toContain('Their reason:\nWe chose another supplier, sorry.');
  });

  it('says a host cancel came from the CRM, with no reason line', async () => {
    await sendFounderCancellations(booking, { by: 'host' });
    expect(printed[0]).toContain('subject=[briefing cancelled] Sara Ahmed');
    expect(printed[0]).toContain('This briefing was cancelled from the CRM. You were hosting it.');
    expect(printed[0]).not.toContain('Their reason');
    expect(printed[0]).not.toContain('Video call:');
  });
});

describe('sending is best effort', () => {
  it('never uses a founder as organizer: no usable CONTACT_FROM_EMAIL in production sends nothing, and says so', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    expect(await sendFounderInvites(booking)).toEqual([
      { sent: false, reason: 'not_configured' },
      { sent: false, reason: 'not_configured' },
    ]);
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/CONTACT_FROM_EMAIL is missing/), booking.id);
  });

  it('prints with a placeholder organizer in development when CONTACT_FROM_EMAIL is not set', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    expect(await sendFounderInvites(booking)).toEqual([{ sent: true }, { sent: true }]);
  });

  it('warns when CONTACT_FROM_EMAIL is a founder address', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Ibrahim@itqanstudio.com');
    await sendFounderInvites(booking);
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/is a founder's address/), booking.id);
  });

  it('sends nothing for an empty team, and never throws', async () => {
    expect(await sendFounderInvites({ ...booking, team: [] })).toEqual([]);
    const broken = { ...booking, start: 'not a date' };
    expect(await sendFounderInvites(broken)).toEqual([
      { sent: false, reason: 'failed' },
      { sent: false, reason: 'failed' },
    ]);
  });

  it('reads CONTACT_FROM_EMAIL as a bare address only', () => {
    expect(senderAddress({ CONTACT_FROM_EMAIL: ' bookings@itqanstudio.com ' })).toBe('bookings@itqanstudio.com');
    expect(senderAddress({ CONTACT_FROM_EMAIL: 'Itqan <bookings@itqanstudio.com>' })).toBeNull();
    expect(senderAddress({ CONTACT_FROM_EMAIL: 'a@b.c\r\nBcc: x@y.z' })).toBeNull();
    expect(senderAddress({})).toBeNull();
  });

  it('logs only the count of founder emails that did not go, in the background too', async () => {
    logFounderSends('book', 'b1', [{ sent: true }, { sent: false, reason: 'failed' }]);
    expect(console.error).toHaveBeenCalledWith('[book] 1 of 2 founder calendar emails not sent for booking', 'b1');
    finishInBackground('x', 'b2', Promise.resolve([{ sent: false, reason: 'failed' }]));
    finishInBackground('y', 'b3', Promise.reject(new Error('boom')));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(console.error).toHaveBeenCalledWith('[x] 1 of 1 founder calendar emails not sent for booking', 'b2');
    expect(console.error).toHaveBeenCalledWith('[y] founder calendar emails failed for booking', 'b3', 'boom');
  });
});

describe('each founder gets one invite and one cancel per booking from this process (W5)', () => {
  it('does not repeat an invite or a cancel a founder already got, and still sends what is new', async () => {
    expect(await sendFounderInvites(booking)).toEqual([{ sent: true }, { sent: true }]);
    expect(await sendFounderInvites(booking)).toEqual([]);
    expect(printed).toHaveLength(2);
    // The cancel is a different email: it goes once.
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([{ sent: true }, { sent: true }]);
    expect(await sendFounderCancellations(booking, { by: 'guest', reason: 'Retry with other words.' })).toEqual([]);
    expect(printed).toHaveLength(4);
    expect(printed.join('')).not.toContain('Retry with other words.');
    // A founder the earlier sends did not reach still hears, and only they do.
    const third = { name: 'Third Founder', email: 'third@itqanstudio.com', isHost: false };
    expect(await sendFounderCancellations({ ...booking, team: [...booking.team, third] }, { by: 'host' })).toEqual([{ sent: true }]);
    expect(printed[4]).toContain('to=third@itqanstudio.com');
    // Another booking is its own event.
    expect(await sendFounderInvites({ ...booking, id: 'b3c1d2e4-0000-4000-8000-000000000002' })).toHaveLength(2);
  });

  it('counts an address once whatever its case', async () => {
    await sendFounderInvites(booking);
    const shouted = booking.team.map((t) => ({ ...t, email: t.email.toUpperCase() }));
    expect(await sendFounderInvites({ ...booking, team: shouted })).toEqual([]);
  });

  it('forgets a send that did not go, so the next call tries again', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    expect(await sendFounderInvites(booking)).toEqual([
      { sent: false, reason: 'not_configured' },
      { sent: false, reason: 'not_configured' },
    ]);
    const broken = { ...booking, start: 'not a date' };
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CONTACT_FROM_EMAIL', ORGANIZER);
    expect(await sendFounderInvites(broken)).toEqual([
      { sent: false, reason: 'failed' },
      { sent: false, reason: 'failed' },
    ]);
    expect(founderMemorySize()).toBe(0);
    expect(await sendFounderInvites(booking)).toEqual([{ sent: true }, { sent: true }]);
  });

  it('remembers a send for 24 hours, then lets it go again', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-11T08:00:00Z'));
    await sendFounderCancellations(booking, { by: 'host' });
    vi.setSystemTime(new Date('2026-10-12T07:59:59Z'));
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([]);
    vi.setSystemTime(new Date('2026-10-12T08:00:00Z'));
    expect(await sendFounderCancellations(booking, { by: 'host' })).toEqual([{ sent: true }, { sent: true }]);
  });

  it('stays bounded: when full, the oldest send is forgotten first', async () => {
    const one = { ...booking, team: [booking.team[0]] };
    const id = (n: number) => `b3c1d2e4-0000-4000-8000-${String(n).padStart(12, '0')}`;
    for (let n = 0; n < FOUNDER_MEMORY_MAX; n += 1) await sendFounderInvites({ ...one, id: id(n) });
    expect(founderMemorySize()).toBe(FOUNDER_MEMORY_MAX);
    await sendFounderInvites({ ...one, id: id(FOUNDER_MEMORY_MAX) });
    expect(founderMemorySize()).toBe(FOUNDER_MEMORY_MAX);
    printed = [];
    // The first one was pushed out and would go again; the newest are still remembered.
    expect(await sendFounderInvites({ ...one, id: id(0) })).toHaveLength(1);
    expect(await sendFounderInvites({ ...one, id: id(FOUNDER_MEMORY_MAX) })).toEqual([]);
  });
});
