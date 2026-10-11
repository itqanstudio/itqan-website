import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelCrmBooking,
  createCrmBooking,
  crmOrigin,
  fetchSlots,
  interpret,
  isCrmDown,
  isOutcomeUnknown,
  isPrivateHost,
  CRM_BOOKING_TIMEOUT_MS,
  CRM_TIMEOUT_MS,
  DEFAULT_CRM_ORIGIN,
} from './client';
import type { CreateBookingRequest } from './contract';
import { verifySignature } from './hmac';
import { slotsDataSchema } from './schemas';

const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';

const booking = {
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
  host: { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', meetingUrl: 'https://meet.google.com/abc-defg-hij' },
};

const request: CreateBookingRequest = {
  start: booking.start,
  name: 'Sara Ahmed',
  email: 'sara@example.com',
  company: 'Example Foods',
  role: 'COO',
  industry: 'fnb',
  message: '',
  topic: 'briefing',
  locale: 'en',
  timezone: 'Asia/Dubai',
  ipHash: 'a'.repeat(64),
};

interface Captured {
  url: string;
  init: RequestInit;
}

let calls: Captured[] = [];

function respond(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    }),
  );
}

beforeEach(() => {
  calls = [];
  vi.stubEnv('ITQAN_BOOKING_SECRET', SECRET);
  vi.stubEnv('CRM_API_ORIGIN', '');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('crmOrigin', () => {
  it('defaults to the production portal and accepts an http(s) override', () => {
    expect(crmOrigin({})).toBe(DEFAULT_CRM_ORIGIN);
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://localhost:3999/' })).toBe('http://localhost:3999');
    expect(crmOrigin({ CRM_API_ORIGIN: 'https://portal.example.com/some/path' })).toBe('https://portal.example.com');
  });
  it('refuses anything that is not a plain http(s) origin', () => {
    expect(crmOrigin({ CRM_API_ORIGIN: 'ftp://x.example' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'not a url' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'https://user:pass@x.example' })).toBeNull();
  });
  it('allows plain http only on loopback or the private network', () => {
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://itqan-crm:3000' })).toBe('http://itqan-crm:3000');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://127.0.0.1:3999' })).toBe('http://127.0.0.1:3999');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://[::1]:3999' })).toBe('http://[::1]:3999');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://10.0.1.5:3000' })).toBe('http://10.0.1.5:3000');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://172.20.0.4:3000' })).toBe('http://172.20.0.4:3000');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://portal.itqanstudio.com' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://52.212.71.212:3000' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://172.32.0.1' })).toBeNull();
  });
  it('compares IP literals exactly, so a DNS name that starts like a private address needs https (SW-2)', () => {
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://10.evil.example.com' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://127.0.0.1.nip.io:3000' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://192.168.attacker.net' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://172.16.example.org' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'https://10.evil.example.com' })).toBe('https://10.evil.example.com');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://192.168.1.20:3000' })).toBe('http://192.168.1.20:3000');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://172.31.255.255' })).toBe('http://172.31.255.255');
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://172.15.0.1' })).toBeNull();
    expect(crmOrigin({ CRM_API_ORIGIN: 'http://10.0.0.256' })).toBeNull();
  });
  it('reads only a whole dotted quad as an address when given a raw host name', () => {
    expect(isPrivateHost('10.0.0.1')).toBe(true);
    expect(isPrivateHost('127.10.20.30')).toBe(true);
    expect(isPrivateHost('[::1]')).toBe(true);
    expect(isPrivateHost('LOCALHOST')).toBe(true);
    expect(isPrivateHost('itqan-crm')).toBe(true);
    expect(isPrivateHost('10.0.0')).toBe(false);
    expect(isPrivateHost('10.0.0.1.')).toBe(false);
    expect(isPrivateHost('010.0.0.1')).toBe(false);
    expect(isPrivateHost('10.0.0.999')).toBe(false);
    expect(isPrivateHost('10.evil.example.com')).toBe(false);
    // An all-digit host is an IPv4 address in number form (134744072 is 8.8.8.8), not a service name.
    expect(isPrivateHost('134744072')).toBe(false);
  });
});

describe('signed requests', () => {
  it('signs a GET with the path and query, and sends no body', async () => {
    respond(200, { ok: true, data: { slotMinutes: 30, timezone: 'Asia/Dubai', hosts: [], slots: [] } });
    const result = await fetchSlots('bisma');
    expect(result).toEqual({ ok: true, data: { slotMinutes: 30, timezone: 'Asia/Dubai', hosts: [], slots: [] } });
    const { url, init } = calls[0];
    expect(url).toBe('https://portal.itqanstudio.com/api/integrations/website/slots?with=bisma');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.redirect).toBe('error');
    const header = (init.headers as Record<string, string>)['x-itqan-signature'];
    expect(
      verifySignature({ secret: SECRET, header, method: 'GET', pathWithQuery: '/api/integrations/website/slots?with=bisma', body: '' }).ok,
    ).toBe(true);
  });

  it('signs the exact JSON body of a POST', async () => {
    vi.stubEnv('CRM_API_ORIGIN', 'http://localhost:3999');
    respond(201, { ok: true, data: { booking, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    const result = await createCrmBooking(request);
    expect(result.ok).toBe(true);
    const { url, init } = calls[0];
    expect(url).toBe('http://localhost:3999/api/integrations/website/bookings');
    expect(JSON.parse(String(init.body))).toEqual(request);
    const headers = init.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
    expect(
      verifySignature({ secret: SECRET, header: headers['x-itqan-signature'], method: 'POST', pathWithQuery: '/api/integrations/website/bookings', body: String(init.body) }).ok,
    ).toBe(true);
  });

  it('omits the query when no host is named', async () => {
    respond(200, { ok: true, data: { slotMinutes: 30, timezone: 'Asia/Dubai', hosts: [], slots: [] } });
    await fetchSlots();
    expect(calls[0].url).toBe('https://portal.itqanstudio.com/api/integrations/website/slots');
  });

  it('fails closed without a usable secret: no request at all', async () => {
    vi.stubEnv('ITQAN_BOOKING_SECRET', 'short');
    respond(200, {});
    expect(await fetchSlots()).toEqual({ ok: false, error: 'unauthorized', status: 0, message: 'no_secret' });
    expect(calls).toHaveLength(0);
  });

  it('refuses a broken CRM_API_ORIGIN without calling out', async () => {
    vi.stubEnv('CRM_API_ORIGIN', 'javascript:alert(1)');
    respond(200, {});
    expect(await cancelCrmBooking('x'.repeat(43))).toMatchObject({ ok: false, error: 'server', status: 0 });
    expect(calls).toHaveLength(0);
  });
});

describe('answers', () => {
  it('passes business errors through with their status', async () => {
    respond(409, { ok: false, error: 'unavailable' });
    const taken = await createCrmBooking(request);
    expect(taken).toEqual({ ok: false, error: 'unavailable', status: 409 });
    if (!taken.ok) expect(isCrmDown(taken)).toBe(false);

    respond(429, { ok: false, error: 'limit', message: 'one upcoming booking per email' });
    expect(await createCrmBooking(request)).toEqual({ ok: false, error: 'limit', status: 429, message: 'one upcoming booking per email' });

    respond(404, { ok: false, error: 'not_found' });
    expect(await cancelCrmBooking('x'.repeat(43))).toMatchObject({ ok: false, error: 'not_found', status: 404 });

    respond(409, { ok: false, error: 'past' });
    expect(await cancelCrmBooking('x'.repeat(43))).toMatchObject({ ok: false, error: 'past', status: 409 });
  });

  it("sends the guest's reason only when there is one", async () => {
    respond(404, { ok: false, error: 'not_found' });
    await cancelCrmBooking('x'.repeat(43), 'Plans changed.');
    await cancelCrmBooking('x'.repeat(43));
    await cancelCrmBooking('x'.repeat(43), '');
    expect(calls.map((c) => JSON.parse(String(c.init.body)))).toEqual([
      { token: 'x'.repeat(43), reason: 'Plans changed.' },
      { token: 'x'.repeat(43) },
      { token: 'x'.repeat(43) },
    ]);
  });

  it('treats 5xx, 401, HTML pages and wrong shapes as the CRM being down', async () => {
    respond(503, { ok: false, error: 'unavailable' });
    const down = await fetchSlots();
    expect(down.ok === false && isCrmDown(down)).toBe(true);

    respond(401, { ok: false, error: 'unauthorized' });
    const unauth = await fetchSlots();
    expect(unauth.ok === false && isCrmDown(unauth)).toBe(true);

    respond(404, '<html>Not found</html>');
    const html = await cancelCrmBooking('x'.repeat(43));
    expect(html).toMatchObject({ ok: false, error: 'server', status: 404 });

    respond(200, { ok: true, data: { slotMinutes: 'thirty' } });
    expect(await fetchSlots()).toMatchObject({ ok: false, error: 'server', message: 'bad_shape' });

    respond(201, { ok: true, data: { booking: { ...booking, host: { ...booking.host, meetingUrl: 'http://insecure.example' } }, cancelToken: 'tok_abcdefghijklmnopqrstuvwxyz' } });
    expect(await createCrmBooking(request)).toMatchObject({ ok: false, error: 'server' });
  });

  it('returns a failure, never a throw, when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    expect(await fetchSlots()).toEqual({ ok: false, error: 'server', status: 0, message: 'fetch failed' });
  });

  it('gives up after the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
          }),
      ),
    );
    const pending = fetchSlots(undefined, { timeoutMs: 8_000 });
    await vi.advanceTimersByTimeAsync(8_000);
    expect(await pending).toEqual({ ok: false, error: 'server', status: 0, message: 'timeout' });
  });

  it('gives the booking POST 15 seconds and every other call 8, so the CRM can finish its Google check (SW-1)', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
          }),
      ),
    );
    expect(CRM_BOOKING_TIMEOUT_MS).toBe(15_000);
    expect(CRM_TIMEOUT_MS).toBe(8_000);
    const settled: string[] = [];
    void createCrmBooking(request).then(() => settled.push('booking'));
    void fetchSlots().then(() => settled.push('slots'));
    void cancelCrmBooking('x'.repeat(43)).then(() => settled.push('cancel'));
    await vi.advanceTimersByTimeAsync(CRM_TIMEOUT_MS);
    expect([...settled].sort()).toEqual(['cancel', 'slots']);
    await vi.advanceTimersByTimeAsync(CRM_BOOKING_TIMEOUT_MS - CRM_TIMEOUT_MS - 1);
    expect(settled).not.toContain('booking');
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toContain('booking');
  });

  it('tells "the CRM may have booked" apart from "the CRM is down" (SW-1)', () => {
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 0, message: 'timeout' })).toBe(true);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 201, message: 'bad_shape' })).toBe(true);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 200, message: 'not_json' })).toBe(true);
    // A dropped connection after the request went out may have booked; only one that never opened did not.
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 0, message: 'fetch failed' })).toBe(true);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 0, message: 'unreachable' })).toBe(false);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 0, message: 'bad_origin' })).toBe(false);
    expect(isOutcomeUnknown({ ok: false, error: 'unauthorized', status: 0, message: 'no_secret' })).toBe(false);
    // A server error after the request went out may follow a committed booking (panel round 2).
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 503 })).toBe(true);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 500, message: 'unexpected_answer' })).toBe(true);
    // The CRM saying it certainly did not book (its database refused the call) is "paused", not "unconfirmed".
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 503, message: 'not_booked' })).toBe(false);
    expect(isCrmDown({ ok: false, error: 'server', status: 503, message: 'not_booked' })).toBe(true);
    // The CRM refusing the signature, or a 4xx business answer, means nothing was booked.
    expect(isOutcomeUnknown({ ok: false, error: 'unauthorized', status: 401 })).toBe(false);
    expect(isOutcomeUnknown({ ok: false, error: 'server', status: 404, message: 'not_json' })).toBe(false);
    expect(isOutcomeUnknown({ ok: false, error: 'unavailable', status: 409 })).toBe(false);
    expect(isOutcomeUnknown({ ok: false, error: 'limit', status: 200 })).toBe(false);
  });

  it('refuses an answer bigger than the cap', async () => {
    const huge = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 2100; i += 1) controller.enqueue(new Uint8Array(1024));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(huge, { status: 200 })));
    expect(await fetchSlots()).toMatchObject({ ok: false, error: 'server', status: 200, message: 'response_too_large' });
  });

  it('keeps the 2xx status when the answer breaks off, so a booking reads as "may exist" (panel run 4)', async () => {
    const broken = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"ok":true,'));
        controller.error(new Error('socket reset'));
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(broken, { status: 201 })));
    const result = await createCrmBooking(request);
    expect(result).toMatchObject({ ok: false, error: 'server', status: 201, message: 'socket reset' });
    expect(!result.ok && isOutcomeUnknown(result)).toBe(true);
  });

  it('reads a connection that never opened as "nothing sent" and any other network failure as "may have acted"', async () => {
    const refused = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('connect'), { code: 'ECONNREFUSED' }) });
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(refused)));
    const notSent = await createCrmBooking(request);
    expect(notSent).toMatchObject({ ok: false, status: 0, message: 'unreachable' });
    expect(!notSent.ok && isOutcomeUnknown(notSent)).toBe(false);
    expect(!notSent.ok && isCrmDown(notSent)).toBe(true);

    const inAggregate = Object.assign(new TypeError('fetch failed'), { cause: { errors: [{ code: 'ENOTFOUND' }] } });
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(inAggregate)));
    expect(await createCrmBooking(request)).toMatchObject({ message: 'unreachable' });

    const reset = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('other side closed'), { code: 'UND_ERR_SOCKET' }) });
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(reset)));
    const maybe = await createCrmBooking(request);
    expect(maybe).toMatchObject({ ok: false, status: 0, message: 'fetch failed' });
    expect(!maybe.ok && isOutcomeUnknown(maybe)).toBe(true);
  });
});

describe('interpret', () => {
  it('rejects non-objects and unknown error codes', () => {
    expect(interpret(200, '[]', slotsDataSchema)).toMatchObject({ ok: false, message: 'not_an_object' });
    expect(interpret(400, '{"ok":false,"error":"weird"}', slotsDataSchema)).toMatchObject({ ok: false, error: 'server', message: 'unexpected_answer' });
    expect(interpret(500, '{"ok":true,"data":{}}', slotsDataSchema)).toMatchObject({ ok: false, error: 'server' });
  });
});
