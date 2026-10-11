import { createHash, createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getSlots } from '@/app/api/book/slots/route';
import { POST as postBook } from '@/app/api/book/route';
import { POST as postCancel } from '@/app/api/book/cancel/route';
import { POST as postNotify } from '@/app/api/crm/notify/route';
import { bookingIcs } from '@/lib/scheduling/mail';
import type { BookingForEmail } from './contract';
import { signatureHeader, verifySignature } from './hmac';
import { clearReplayMemory } from './replay';
import { forgetSlots } from './slots-cache';

/*
 * The public booking routes and the CRM callback, whole requests inside the
 * process: the CRM is a stubbed fetch, mail prints to the log (development
 * mode without SMTP). Every test uses its own client IP so the in-memory rate
 * limits do not leak between tests.
 */

const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
const ORIGIN = 'https://itqanstudio.com';

const booking: BookingForEmail = {
  id: '4f9a2b1c-0000-4000-8000-000000000001',
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
  guestTimezone: 'Asia/Dubai',
  host: { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', meetingUrl: null },
  team: [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true },
    { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: false },
  ],
};

/** The printed emails to one address. */
const to = (address: string) => printed.filter((m) => m.includes(`to=${address} `));

const form = {
  start: booking.start,
  name: 'Sara Ahmed',
  email: 'Sara@Example.com',
  company: 'Example Foods',
  role: 'COO',
  industry: 'fnb',
  message: '',
  locale: 'en',
  timezone: 'Asia/Dubai',
  topic: 'briefing',
  leave_empty: '',
};

let ipCounter = 0;
let printed: string[] = [];
let crmCalls: Array<{ url: string; init: RequestInit }> = [];

function nextIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function crm(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      crmCalls.push({ url, init });
      return new Response(JSON.stringify(body), { status });
    }),
  );
}

function request(url: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}): NextRequest {
  const options = { method: init.method ?? 'GET', headers: { 'x-forwarded-for': nextIp(), ...init.headers }, body: init.body, duplex: 'half' };
  return new NextRequest(url, options as ConstructorParameters<typeof NextRequest>[1]);
}

function bookRequest(body: unknown, headers: Record<string, string> = { origin: ORIGIN }): NextRequest {
  return request('http://localhost/api/book', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
}

beforeEach(() => {
  printed = [];
  crmCalls = [];
  clearReplayMemory();
  forgetSlots();
  vi.stubEnv('ITQAN_BOOKING_SECRET', SECRET);
  vi.stubEnv('CRM_API_ORIGIN', 'http://localhost:3999');
  vi.stubEnv('NODE_ENV', 'development');
  ['SES_SMTP_HOST', 'SES_SMTP_PORT', 'SES_SMTP_USERNAME', 'SES_SMTP_PASSWORD', 'CONTACT_FROM_EMAIL'].forEach((k) => vi.stubEnv(k, ''));
  vi.spyOn(console, 'info').mockImplementation((msg: string) => {
    printed.push(msg);
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET /api/book/slots', () => {
  const slots = { slotMinutes: 30, timezone: 'Asia/Dubai', hosts: [{ slug: 'bisma', name: 'Bisma Aslam' }], slots: [{ start: booking.start, hosts: ['bisma'] }] };

  it('keeps the widget shape and passes ?with= to the CRM', async () => {
    crm(200, { ok: true, data: slots });
    const res = await getSlots(request('http://localhost/api/book/slots?with=bisma'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { slots: [booking.start], slotMinutes: 30, timezone: 'Asia/Dubai', hosts: slots.hosts } });
    expect(crmCalls[0].url).toBe('http://localhost:3999/api/integrations/website/slots?with=bisma');
  });

  it('refuses a bad ?with= without calling the CRM', async () => {
    crm(200, { ok: true, data: slots });
    const res = await getSlots(request('http://localhost/api/book/slots?with=Robert%27);'));
    expect(res.status).toBe(400);
    expect(crmCalls).toHaveLength(0);
  });

  it('answers 503 paused when the CRM is down or the secret is missing', async () => {
    crm(500, { ok: false, error: 'server' });
    expect((await getSlots(request('http://localhost/api/book/slots'))).status).toBe(503);
    vi.stubEnv('ITQAN_BOOKING_SECRET', '');
    const res = await getSlots(request('http://localhost/api/book/slots'));
    expect(await res.json()).toEqual({ ok: false, error: 'paused' });
  });

  it('serves many visitors from one CRM call per host filter, and asks again after a booking (panel run 4)', async () => {
    crm(200, { ok: true, data: slots });
    const visitors = ['10.0.0.1', '10.0.0.2', '10.0.0.3'].map((ip) =>
      getSlots(request('http://localhost/api/book/slots', { headers: { 'x-forwarded-for': ip } })),
    );
    expect((await Promise.all(visitors)).map((r) => r.status)).toEqual([200, 200, 200]);
    expect(crmCalls).toHaveLength(1);
    await getSlots(request('http://localhost/api/book/slots?with=bisma'));
    expect(crmCalls).toHaveLength(2);

    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    await postBook(bookRequest({ ...form, email: 'cache@example.com' }, { origin: ORIGIN, 'x-forwarded-for': '10.0.0.9' }));
    crm(200, { ok: true, data: slots });
    await getSlots(request('http://localhost/api/book/slots'));
    expect(crmCalls.filter((c) => c.url.endsWith('/slots'))).toHaveLength(2);
  });
});

describe('POST /api/book', () => {
  it('counts one mailbox once against the email limit, however it is typed (panel round 2)', async () => {
    crm(409, { ok: false, error: 'unavailable' });
    const spellings = ['Case@Example.com', 'case@example.com', ' CASE@example.COM', 'case@EXAMPLE.com'];
    const statuses: number[] = [];
    for (const email of spellings) {
      // A fresh client IP each time, so only the email limit (3 per 10 minutes) can stop the fourth.
      statuses.push((await postBook(bookRequest({ ...form, email }, { origin: ORIGIN, 'x-forwarded-for': nextIp() }))).status);
    }
    expect(statuses).toEqual([409, 409, 409, 429]);
  });

  it('books through the CRM, emails the guest and invites both founders, and answers with the host name', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, with: 'ibrahim' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      ok: true,
      data: { id: booking.id, start: booking.start, end: booking.end, hostName: 'Ibrahim Shareef', emailed: true, ics: expect.any(String) },
    });
    const sent = JSON.parse(String(crmCalls[0].init.body)) as Record<string, unknown>;
    expect(sent).toMatchObject({ start: booking.start, with: 'ibrahim', email: 'sara@example.com', locale: 'en', timezone: 'Asia/Dubai' });
    expect(sent.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(sent).not.toHaveProperty('leave_empty');
    const header = (crmCalls[0].init.headers as Record<string, string>)['x-itqan-signature'];
    expect(verifySignature({ secret: SECRET, header, method: 'POST', pathWithQuery: '/api/integrations/website/bookings', body: String(crmCalls[0].init.body) }).ok).toBe(true);
    expect(to('sara@example.com')).toHaveLength(1);
    expect(to('sara@example.com')[0]).toContain('ics=PUBLISH');
    expect(to('ibrahim@itqanstudio.com')).toHaveLength(1);
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('ics=REQUEST');
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('You host it.');
    expect(to('bisma@itqanstudio.com')).toHaveLength(1);
    expect(to('bisma@itqanstudio.com')[0]).toContain('ics=REQUEST');
    expect(to('bisma@itqanstudio.com')[0]).toContain('Ibrahim Shareef hosts it.');
  });

  it('invites the host alone when the CRM is from before the team field', async () => {
    const { team: _team, ...older } = booking;
    crm(201, { ok: true, data: { booking: older, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, email: 'older-crm@example.com' }));
    expect(res.status).toBe(201);
    expect(to('ibrahim@itqanstudio.com')).toHaveLength(1);
    expect(to('bisma@itqanstudio.com')).toHaveLength(0);
  });

  it('keeps the booking when a founder on the team does not pass the checks, and invites the rest', async () => {
    const team = [...booking.team, { name: 'Bad\r\nBcc: x@y.z', email: 'bad@itqanstudio.com', isHost: false }, { name: 'No email', email: 'nope', isHost: false }];
    crm(201, { ok: true, data: { booking: { ...booking, team }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, email: 'odd-team@example.com' }));
    expect(res.status).toBe(201);
    expect(to('bisma@itqanstudio.com')).toHaveLength(1);
    expect(to('bad@itqanstudio.com')).toHaveLength(0);
  });

  it('invites the host even when the team leaves them out or every row fails the checks (W1)', async () => {
    crm(201, { ok: true, data: { booking: { ...booking, team: [booking.team[1]] }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    expect((await postBook(bookRequest({ ...form, email: 'no-host@example.com' }))).status).toBe(201);
    expect(to('ibrahim@itqanstudio.com')).toHaveLength(1);
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('You host it.');
    expect(to('bisma@itqanstudio.com')).toHaveLength(1);
    printed = [];
    const refused = [{ name: 'Bad\r\nBcc: x@y.z', email: 'bad@itqanstudio.com', isHost: true }];
    crm(201, { ok: true, data: { booking: { ...booking, id: '4f9a2b1c-0000-4000-8000-000000000002', team: refused }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    expect((await postBook(bookRequest({ ...form, email: 'bad-team@example.com' }))).status).toBe(201);
    expect(to('ibrahim@itqanstudio.com')).toHaveLength(1);
    expect(to('bad@itqanstudio.com')).toHaveLength(0);
  });

  it('hands the widget the same calendar file the guest email attaches: full text, host as organizer (SW-3)', async () => {
    const withLink = { ...booking, host: { ...booking.host, meetingUrl: 'https://meet.google.com/abc-defg-hij' } };
    crm(201, { ok: true, data: { booking: withLink, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, email: 'ics@example.com' }));
    const { ics } = ((await res.json()) as { data: { ics: string } }).data;
    const withoutStamp = (s: string) => s.replace(/^DTSTAMP:.*$/m, '');
    expect(withoutStamp(ics)).toBe(withoutStamp(bookingIcs(withLink, 'PUBLISH')));
    expect(ics).not.toContain('ATTENDEE');
    expect(ics).toContain(`UID:${booking.id}@itqanstudio.com`);
    expect(ics).toContain('SEQUENCE:0');
    expect(ics).toContain('ORGANIZER;CN="Ibrahim Shareef":mailto:ibrahim@itqanstudio.com');
    expect(ics).toContain('DESCRIPTION:Your 30-minute briefing with Itqan is booked.');
    expect(ics).toContain('LOCATION:https://meet.google.com/abc-defg-hij');
    expect(ics).not.toContain('We sent the details');
    expect(ics).not.toContain('hello@itqanstudio.com');
  });

  it('still hands over the full calendar file when the confirmation email fails, in the guest language', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    crm(201, { ok: true, data: { booking: { ...booking, locale: 'ar' }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, locale: 'ar', email: 'nomail@example.com' }));
    const { data } = (await res.json()) as { data: { emailed: boolean; ics: string } };
    expect(data.emailed).toBe(false);
    // Long lines are folded at 75 octets (RFC 5545); read the file unfolded.
    const unfolded = data.ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('ORGANIZER;CN="إبراهيم شريف":mailto:ibrahim@itqanstudio.com');
    expect(unfolded).toContain('ومدتها 30 دقيقة');
  });

  it('sends the CRM an address hash keyed with the shared secret, never one anyone can recompute (SW-4)', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    // Own email per test: the per-email limit (3 in 10 minutes) is shared across this file.
    await postBook(bookRequest({ ...form, email: 'hash@example.com' }, { origin: ORIGIN, 'x-forwarded-for': '198.51.100.40' }));
    const sent = JSON.parse(String(crmCalls[0].init.body)) as { ipHash: string };
    expect(sent.ipHash).toBe(createHmac('sha256', SECRET).update('itqan-booking-ip:198.51.100.40').digest('hex'));
    expect(sent.ipHash).not.toBe(createHash('sha256').update('itqan-booking:198.51.100.40').digest('hex'));
  });

  it('fails closed without the secret: paused, and no call to the CRM', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    vi.stubEnv('ITQAN_BOOKING_SECRET', 'short');
    const res = await postBook(bookRequest({ ...form, email: 'nosecret@example.com' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: 'paused' });
    expect(crmCalls).toHaveLength(0);
    expect(printed).toHaveLength(0);
  });

  it('names the host in Arabic for an Arabic booking', async () => {
    crm(201, { ok: true, data: { booking: { ...booking, locale: 'ar' }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, locale: 'ar' }));
    expect(((await res.json()) as { data: { hostName: string } }).data.hostName).toBe('إبراهيم شريف');
  });

  it('keeps every guard in front of the CRM', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    expect((await postBook(bookRequest(form, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await postBook(bookRequest({ ...form, leave_empty: 'bot' }))).status).toBe(400);
    expect((await postBook(bookRequest({ ...form, email: 'nope' }))).status).toBe(400);
    expect((await postBook(bookRequest({ ...form, with: 'Not A Slug' }))).status).toBe(400);
    const big = request('http://localhost/api/book', { method: 'POST', headers: { origin: ORIGIN }, body: JSON.stringify({ ...form, message: 'x'.repeat(17_000) }) });
    expect((await postBook(big)).status).toBe(400);
    expect(crmCalls).toHaveLength(0);
  });

  it('rate limits one connection', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const headers = { origin: ORIGIN, 'x-forwarded-for': '198.51.100.77' };
    const codes: number[] = [];
    for (let i = 0; i < 6; i += 1) codes.push((await postBook(bookRequest({ ...form, email: `p${i}@example.com` }, headers))).status);
    expect(codes).toEqual([201, 201, 201, 201, 201, 429]);
  });

  it('maps CRM answers: taken 409, limit 429, invalid 400, down 503 paused', async () => {
    crm(409, { ok: false, error: 'unavailable' });
    expect(await (await postBook(bookRequest(form))).json()).toEqual({ ok: false, error: 'taken' });
    crm(429, { ok: false, error: 'limit' });
    expect(await (await postBook(bookRequest({ ...form, email: 'b@example.com' }))).json()).toEqual({ ok: false, error: 'limit' });
    crm(400, { ok: false, error: 'invalid' });
    expect((await postBook(bookRequest({ ...form, email: 'c@example.com' }))).status).toBe(400);
    crm(503, { ok: false, error: 'unavailable' });
    const down = await postBook(bookRequest({ ...form, email: 'd@example.com' }));
    expect(down.status).toBe(503);
    expect(await down.json()).toEqual({ ok: false, error: 'paused' });
    expect(printed).toHaveLength(0);
  });

  it('when the CRM answer times out, says the booking may exist instead of "paused" (SW-1)', async () => {
    // The client's 15 second abort, as the route sees it (the timing itself is tested in client.test.ts).
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        crmCalls.push({ url, init });
        throw Object.assign(new Error('This operation was aborted'), { name: 'AbortError' });
      }),
    );
    const res = await postBook(bookRequest({ ...form, email: 'slow@example.com' }));
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ ok: false, error: 'unconfirmed' });
    expect(crmCalls).toHaveLength(1);
    expect(printed).toHaveLength(0);
  });

  it('a success status with an answer the site cannot read is unconfirmed too, not paused', async () => {
    crm(201, { ok: true, data: { booking: { id: 'x' } } });
    const res = await postBook(bookRequest({ ...form, email: 'garbled@example.com' }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'unconfirmed' });
    expect(printed).toHaveLength(0);
  });

  it('a CRM server error after the request went out is unconfirmed, and the cached times are dropped (panel round 2)', async () => {
    crm(500, { ok: false, error: 'server' });
    const res = await postBook(bookRequest({ ...form, email: 'server-error@example.com' }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'unconfirmed' });
  });

  it('a CRM that says it certainly did not book answers paused, and keeps the cached times (code review M1)', async () => {
    crm(503, { ok: false, error: 'server', message: 'not_booked' });
    const res = await postBook(bookRequest({ ...form, email: 'not-booked@example.com' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: 'paused' });
  });

  it('a refused connection (nothing reached the CRM) is still paused', async () => {
    const refused = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('connect'), { code: 'ECONNREFUSED' }) });
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(refused)));
    const res = await postBook(bookRequest({ ...form, email: 'refused@example.com' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: 'paused' });
  });

  it('a connection that drops after the request went out is unconfirmed, not paused (panel run 4)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    const res = await postBook(bookRequest({ ...form, email: 'dropped@example.com' }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'unconfirmed' });
  });
});

describe('POST /api/book/cancel', () => {
  const cancel = (token: string, origin = ORIGIN, extra: Record<string, unknown> = {}) =>
    postCancel(
      request('http://localhost/api/book/cancel', {
        method: 'POST',
        headers: { origin, 'content-type': 'application/json' },
        body: JSON.stringify({ token, ...extra }),
      }),
    );

  /** The CRM by path: the cancel answer, then the notice-sent record. */
  function crmCancel(cancelData: unknown, recorded = true): void {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        crmCalls.push({ url, init });
        const data = url.endsWith('/bookings/notice-sent') ? { recorded } : cancelData;
        return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
      }),
    );
  }

  it('cancels in the CRM, emails the guest, sends both founders the calendar cancel, then records the send', async () => {
    crmCancel({ changed: true, booking, noticeOwed: true });
    const res = await cancel('A'.repeat(43));
    expect(await res.json()).toEqual({ ok: true, data: { changed: true, start: booking.start, timezone: 'Asia/Dubai' } });
    expect(JSON.parse(String(crmCalls[0].init.body))).toEqual({ token: 'A'.repeat(43) });
    expect(printed).toHaveLength(3);
    expect(to('sara@example.com')[0]).toContain('You cancelled your briefing on');
    for (const founder of ['ibrahim@itqanstudio.com', 'bisma@itqanstudio.com']) {
      expect(to(founder)).toHaveLength(1);
      expect(to(founder)[0]).toContain('[briefing cancelled by guest]');
      expect(to(founder)[0]).toContain('ics=CANCEL');
    }
    expect(crmCalls[1].url).toBe('http://localhost:3999/api/integrations/website/bookings/notice-sent');
    expect(JSON.parse(String(crmCalls[1].init.body))).toEqual({ token: 'A'.repeat(43) });
  });

  it("passes the guest's reason to the CRM and to the founders, as plain text", async () => {
    crmCancel({ changed: true, booking, noticeOwed: true });
    // A right-to-left override built from its code point, so the source file holds no invisible character.
    const res = await cancel('A'.repeat(43), ORIGIN, { reason: `  We found another supplier.\r\nThank you.${String.fromCodePoint(0x202e)}  ` });
    expect(res.status).toBe(200);
    expect(JSON.parse(String(crmCalls[0].init.body))).toEqual({ token: 'A'.repeat(43), reason: 'We found another supplier.\nThank you.' });
    expect(to('bisma@itqanstudio.com')[0]).toContain('Their reason:\nWe found another supplier.\nThank you.');
    // The guest's own email never repeats what they typed.
    expect(to('sara@example.com')[0]).not.toContain('supplier');
  });

  it('sends no reason when the box was left empty or holds only spaces', async () => {
    crmCancel({ changed: true, booking, noticeOwed: true });
    await cancel('A'.repeat(43), ORIGIN, { reason: ' \n\t ' });
    expect(JSON.parse(String(crmCalls[0].init.body))).toEqual({ token: 'A'.repeat(43) });
    expect(to('bisma@itqanstudio.com')[0]).not.toContain('Their reason');
  });

  it('refuses a reason over 500 characters or an unknown field without calling the CRM, and takes 500 Arabic letters', async () => {
    crmCancel({ changed: true, booking, noticeOwed: true });
    expect((await cancel('A'.repeat(43), ORIGIN, { reason: 'x'.repeat(501) })).status).toBe(400);
    expect((await cancel('A'.repeat(43), ORIGIN, { reason: 42 })).status).toBe(400);
    expect((await cancel('A'.repeat(43), ORIGIN, { extra: true })).status).toBe(400);
    expect(crmCalls).toHaveLength(0);
    expect((await cancel('A'.repeat(43), ORIGIN, { reason: 'ب'.repeat(500) })).status).toBe(200);
    expect(JSON.parse(String(crmCalls[0].init.body)).reason).toHaveLength(500);
  });

  it('records the send because of the guest email, and an empty team still sends the host the calendar cancel (W1)', async () => {
    crmCancel({ changed: true, booking: { ...booking, team: [] }, noticeOwed: true });
    await cancel('A'.repeat(43));
    expect(printed).toHaveLength(2);
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('ics=CANCEL');
    expect(to('bisma@itqanstudio.com')).toHaveLength(0);
    expect(crmCalls.map((c) => c.url.split('/').pop())).toEqual(['cancel', 'notice-sent']);
  });

  it('a retry after a lost answer still sends the owed emails (panel run 4)', async () => {
    crmCancel({ changed: false, booking, noticeOwed: true });
    expect(((await (await cancel('A'.repeat(43))).json()) as { data: { changed: boolean } }).data.changed).toBe(false);
    expect(printed).toHaveLength(3);
    expect(crmCalls).toHaveLength(2);
  });

  it('sends nothing once the emails are recorded, or for a host cancel', async () => {
    crmCancel({ changed: false, booking, noticeOwed: false });
    expect(((await (await cancel('A'.repeat(43))).json()) as { data: { changed: boolean } }).data.changed).toBe(false);
    expect(printed).toHaveLength(0);
    expect(crmCalls).toHaveLength(1);
  });

  it('keeps the guest answer when the record call fails (a later retry may send again)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        crmCalls.push({ url, init });
        if (url.endsWith('/bookings/notice-sent')) return new Response('{"ok":false,"error":"server"}', { status: 500 });
        return new Response(JSON.stringify({ ok: true, data: { changed: true, booking, noticeOwed: true } }), { status: 200 });
      }),
    );
    const res = await cancel('A'.repeat(43));
    expect(res.status).toBe(200);
    expect(printed).toHaveLength(3);
    expect(console.error).toHaveBeenCalledWith('[book/cancel] could not record the sent notice for booking', booking.id, 'server');
  });

  it('maps a CRM rate limit to 429, not to "link not found" (panel round 2)', async () => {
    crm(429, { ok: false, error: 'limit' });
    const res = await cancel('A'.repeat(43));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate' });
  });

  it('maps not found, past and down, and refuses a bad origin or token', async () => {
    crm(404, { ok: false, error: 'not_found' });
    expect((await cancel('A'.repeat(43))).status).toBe(404);
    crm(409, { ok: false, error: 'past' });
    expect(await (await cancel('A'.repeat(43))).json()).toEqual({ ok: false, error: 'past' });
    crm(502, { ok: false, error: 'server' });
    expect(await (await cancel('A'.repeat(43))).json()).toEqual({ ok: false, error: 'paused' });
    const calls = crmCalls.length;
    expect((await cancel('A'.repeat(43), 'https://evil.example')).status).toBe(403);
    expect((await cancel('short')).status).toBe(404);
    expect(crmCalls).toHaveLength(calls);
  });
});

describe('POST /api/crm/notify', () => {
  const path = '/api/crm/notify';
  const payload = (notifyGuest: boolean) => JSON.stringify({ type: 'booking.cancelled', by: 'host', notifyGuest, booking });
  const notify = (body: string, header?: string) =>
    postNotify(request(`http://localhost${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(header ? { 'x-itqan-signature': header } : {}) }, body }));

  it('emails the guest when the signature is good and notifyGuest is true, and sends both founders the calendar cancel', async () => {
    const body = payload(true);
    const res = await notify(body, signatureHeader(SECRET, 'POST', path, body));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { emailed: true } });
    expect(printed).toHaveLength(3);
    expect(to('sara@example.com')[0]).toContain('We had to cancel your briefing on');
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('[briefing cancelled]');
    expect(to('bisma@itqanstudio.com')[0]).toContain('ics=CANCEL');
  });

  it('with notifyGuest false sends the guest nothing, and still sends the founders the calendar cancel', async () => {
    const body = payload(false);
    expect(await (await notify(body, signatureHeader(SECRET, 'POST', path, body))).json()).toEqual({ ok: true, data: { emailed: false } });
    expect(to('sara@example.com')).toHaveLength(0);
    expect(to('ibrahim@itqanstudio.com')).toHaveLength(1);
    expect(to('bisma@itqanstudio.com')).toHaveLength(1);
  });

  it('answers emailed from the guest email alone, and an empty team still sends the host the calendar cancel (W1)', async () => {
    const body = JSON.stringify({ type: 'booking.cancelled', by: 'host', notifyGuest: true, booking: { ...booking, team: [] } });
    expect(await (await notify(body, signatureHeader(SECRET, 'POST', path, body))).json()).toEqual({ ok: true, data: { emailed: true } });
    expect(printed).toHaveLength(2);
    expect(to('ibrahim@itqanstudio.com')[0]).toContain('ics=CANCEL');
  });

  it('refuses a missing, wrong, stale or replayed signature', async () => {
    const body = payload(true);
    expect((await notify(body)).status).toBe(401);
    expect((await notify(body, signatureHeader(`${SECRET}-other`, 'POST', path, body))).status).toBe(401);
    expect((await notify(body, signatureHeader(SECRET, 'POST', path, body, Math.floor(Date.now() / 1000) - 301))).status).toBe(401);
    expect((await notify(`${body} `, signatureHeader(SECRET, 'POST', path, body))).status).toBe(401);
    const good = signatureHeader(SECRET, 'POST', path, body);
    expect((await notify(body, good)).status).toBe(200);
    expect((await notify(body, good)).status).toBe(401);
    // One accepted call: the guest's email and the two founders' cancels.
    expect(printed).toHaveLength(3);
  });

  it('fails closed without the secret, and checks the body after the signature', async () => {
    const body = payload(true);
    const header = signatureHeader(SECRET, 'POST', path, body);
    vi.stubEnv('ITQAN_BOOKING_SECRET', 'short');
    expect((await notify(body, header)).status).toBe(401);
    vi.stubEnv('ITQAN_BOOKING_SECRET', SECRET);
    const wrong = JSON.stringify({ type: 'booking.cancelled', by: 'host', notifyGuest: true, booking: { ...booking, guestEmail: 'x' } });
    expect((await notify(wrong, signatureHeader(SECRET, 'POST', path, wrong))).status).toBe(400);
    const notJson = 'not json';
    expect((await notify(notJson, signatureHeader(SECRET, 'POST', path, notJson))).status).toBe(400);
    expect(printed).toHaveLength(0);
  });
});
