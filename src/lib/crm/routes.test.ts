import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getSlots } from '@/app/api/book/slots/route';
import { POST as postBook } from '@/app/api/book/route';
import { POST as postCancel } from '@/app/api/book/cancel/route';
import { POST as postNotify } from '@/app/api/crm/notify/route';
import type { BookingForEmail } from './contract';
import { signatureHeader, verifySignature } from './hmac';
import { clearReplayMemory } from './replay';

/*
 * The public booking routes and the CRM callback, end to end inside the
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
};

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
});

describe('POST /api/book', () => {
  it('books through the CRM, emails guest and host, and answers with the host name', async () => {
    crm(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const res = await postBook(bookRequest({ ...form, with: 'ibrahim' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      ok: true,
      data: { id: booking.id, start: booking.start, end: booking.end, hostName: 'Ibrahim Shareef', emailed: true },
    });
    const sent = JSON.parse(String(crmCalls[0].init.body)) as Record<string, unknown>;
    expect(sent).toMatchObject({ start: booking.start, with: 'ibrahim', email: 'sara@example.com', locale: 'en', timezone: 'Asia/Dubai' });
    expect(sent.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(sent).not.toHaveProperty('leave_empty');
    const header = (crmCalls[0].init.headers as Record<string, string>)['x-itqan-signature'];
    expect(verifySignature({ secret: SECRET, header, method: 'POST', pathWithQuery: '/api/integrations/website/bookings', body: String(crmCalls[0].init.body) }).ok).toBe(true);
    expect(printed.some((m) => m.includes('to=sara@example.com'))).toBe(true);
    expect(printed.some((m) => m.includes('to=ibrahim@itqanstudio.com'))).toBe(true);
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
});

describe('POST /api/book/cancel', () => {
  const cancel = (token: string, origin = ORIGIN) =>
    postCancel(request('http://localhost/api/book/cancel', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ token }) }));

  it('cancels in the CRM and emails both sides', async () => {
    crm(200, { ok: true, data: { changed: true, booking } });
    const res = await cancel('A'.repeat(43));
    expect(await res.json()).toEqual({ ok: true, data: { changed: true, start: booking.start, timezone: 'Asia/Dubai' } });
    expect(JSON.parse(String(crmCalls[0].init.body))).toEqual({ token: 'A'.repeat(43) });
    expect(printed).toHaveLength(2);
  });

  it('sends nothing when it was already cancelled', async () => {
    crm(200, { ok: true, data: { changed: false, booking } });
    expect(((await (await cancel('A'.repeat(43))).json()) as { data: { changed: boolean } }).data.changed).toBe(false);
    expect(printed).toHaveLength(0);
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

  it('emails the guest when the signature is good and notifyGuest is true', async () => {
    const body = payload(true);
    const res = await notify(body, signatureHeader(SECRET, 'POST', path, body));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { emailed: true } });
    expect(printed).toHaveLength(1);
    expect(printed[0]).toContain('to=sara@example.com');
    expect(printed[0]).toContain('We had to cancel your briefing on');
  });

  it('sends nothing when notifyGuest is false', async () => {
    const body = payload(false);
    expect(await (await notify(body, signatureHeader(SECRET, 'POST', path, body))).json()).toEqual({ ok: true, data: { emailed: false } });
    expect(printed).toHaveLength(0);
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
    expect(printed).toHaveLength(1);
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
