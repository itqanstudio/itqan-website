import { describe, expect, it, vi } from 'vitest';
import { bookingCopy } from '@/content/v3/booking';
import { failureMessage, loadSlots, postBooking } from './booking-api';

function answer(status: number, body: unknown) {
  return vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }));
}

describe('loadSlots', () => {
  it('reads the widget shape and passes the host filter', async () => {
    const fetcher = answer(200, { ok: true, data: { slots: ['2026-10-12T06:00:00.000Z'], slotMinutes: 30, timezone: 'Asia/Dubai', hosts: [{ slug: 'bisma', name: 'Bisma Aslam' }] } });
    expect(await loadSlots('bisma', fetcher)).toEqual({ state: 'ready', slots: ['2026-10-12T06:00:00.000Z'], hosts: [{ slug: 'bisma', name: 'Bisma Aslam' }] });
    expect(fetcher).toHaveBeenCalledWith('/api/book/slots?with=bisma', { cache: 'no-store' });
  });
  it('tells paused from other failures', async () => {
    expect(await loadSlots(undefined, answer(503, { ok: false, error: 'paused' }))).toEqual({ state: 'paused' });
    expect(await loadSlots(undefined, answer(500, { ok: false, error: 'server' }))).toEqual({ state: 'error' });
    expect(await loadSlots(undefined, answer(200, '<html>'))).toEqual({ state: 'error' });
    expect(await loadSlots(undefined, answer(200, { ok: true, data: { slots: [1, 2] } }))).toEqual({ state: 'error' });
    expect(await loadSlots(undefined, vi.fn(async () => Promise.reject(new TypeError('offline'))))).toEqual({ state: 'error' });
  });
});

describe('postBooking', () => {
  const booked = { id: 'b1', start: '2026-10-12T06:00:00.000Z', end: '2026-10-12T06:30:00.000Z', hostName: 'Ibrahim Shareef', emailed: true };

  it('returns the booking', async () => {
    const fetcher = answer(201, { ok: true, data: booked });
    expect(await postBooking({ start: booked.start }, fetcher)).toEqual({ kind: 'booked', booked });
    expect(fetcher.mock.calls[0]).toEqual(['/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"start":"2026-10-12T06:00:00.000Z"}' }]);
  });
  it('maps every failure the route can give', async () => {
    expect(await postBooking({}, answer(409, { ok: false, error: 'taken' }))).toEqual({ kind: 'taken' });
    expect(await postBooking({}, answer(503, { ok: false, error: 'paused' }))).toEqual({ kind: 'failed', reason: 'paused' });
    expect(await postBooking({}, answer(429, { ok: false, error: 'limit' }))).toEqual({ kind: 'failed', reason: 'limit' });
    expect(await postBooking({}, answer(429, { ok: false, error: 'rate' }))).toEqual({ kind: 'failed', reason: 'rate' });
    expect(await postBooking({}, answer(400, { ok: false, error: 'invalid' }))).toEqual({ kind: 'failed', reason: 'invalid' });
    expect(await postBooking({}, answer(500, 'oops'))).toEqual({ kind: 'failed', reason: 'server' });
    expect(await postBooking({}, answer(201, { ok: true, data: { id: 1 } }))).toEqual({ kind: 'failed', reason: 'server' });
    expect(await postBooking({}, vi.fn(async () => Promise.reject(new TypeError('offline'))))).toEqual({ kind: 'failed', reason: 'network' });
  });
  it('keeps "may already be booked" apart from paused and server errors (SW-1)', async () => {
    expect(await postBooking({}, answer(504, { ok: false, error: 'unconfirmed' }))).toEqual({ kind: 'failed', reason: 'unconfirmed' });
    expect(await postBooking({}, answer(502, { ok: false, error: 'unconfirmed' }))).toEqual({ kind: 'failed', reason: 'unconfirmed' });
    expect(await postBooking({}, answer(504, 'Gateway Timeout'))).toEqual({ kind: 'failed', reason: 'server' });
  });
  it('has a message for each failure in both languages', () => {
    (['paused', 'limit', 'rate', 'invalid', 'server', 'network', 'unconfirmed'] as const).forEach((reason) => {
      expect(failureMessage(bookingCopy.en.errors, reason)).toBeTruthy();
      expect(failureMessage(bookingCopy.ar.errors, reason)).toBeTruthy();
    });
    expect(failureMessage(bookingCopy.en.errors, 'paused')).toContain('hello@itqanstudio.com');
  });
  it('tells the visitor plainly to check their email before booking again when the outcome is unknown', () => {
    const en = failureMessage(bookingCopy.en.errors, 'unconfirmed');
    expect(en).toContain('may already be booked');
    expect(en).toContain('Check your email before you try again');
    expect(en).toContain('hello@itqanstudio.com');
    expect(en).not.toMatch(/[–—]/);
    const ar = failureMessage(bookingCopy.ar.errors, 'unconfirmed');
    expect(ar).toContain('محجوزة بالفعل');
    expect(ar).toContain('بريدك');
    expect(ar).toContain('hello@itqanstudio.com');
    expect(ar).not.toMatch(/[–—]/);
  });
});
