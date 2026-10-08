import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDbForTests } from './db';
import {
  addBlockedDate,
  availableSlots,
  cancelBooking,
  createBooking,
  createLoginToken,
  findBookingByCancelToken,
  getAvailability,
  listBookings,
  purgeExpired,
  redeemLoginToken,
  saveAvailability,
  sessionEmail,
} from './repo';
import { DEFAULT_AVAILABILITY } from './config';
import type { BookingRequest } from './validation';
import type { Availability } from './types';

const dir = mkdtempSync(path.join(tmpdir(), 'itqan-db-'));
let n = 0;

const MONDAY_ONLY: Availability = {
  ...DEFAULT_AVAILABILITY,
  timezone: 'Asia/Dubai',
  bufferMinutes: 0,
  minNoticeHours: 0,
  horizonDays: 7,
  maxPerDay: 10,
  weekly: { mon: [{ start: '10:00', end: '11:00' }], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
};
const NOW = Date.parse('2026-10-11T04:00:00.000Z');
const SLOT = '2026-10-12T06:00:00.000Z';

function request(over: Partial<BookingRequest> = {}): BookingRequest {
  return {
    start: SLOT,
    name: 'Sara Ahmed',
    email: 'sara@example.com',
    company: 'Example Foods',
    role: 'COO',
    industry: 'fnb',
    message: '',
    topic: 'briefing',
    locale: 'en',
    timezone: 'Asia/Dubai',
    leave_empty: '',
    ...over,
  };
}

beforeEach(() => {
  closeDbForTests();
  n += 1;
  process.env.BOOKING_DB_PATH = path.join(dir, `t${n}.db`);
  saveAvailability(MONDAY_ONLY);
});

afterAll(() => {
  closeDbForTests();
  rmSync(dir, { recursive: true, force: true });
});

describe('availability settings', () => {
  it('falls back to the defaults when nothing is saved', () => {
    closeDbForTests();
    process.env.BOOKING_DB_PATH = path.join(dir, 'fresh.db');
    expect(getAvailability()).toEqual(DEFAULT_AVAILABILITY);
  });
  it('round-trips saved settings', () => {
    expect(getAvailability()).toEqual(MONDAY_ONLY);
  });
});

describe('bookings', () => {
  it('books a free slot and removes it from the free list', () => {
    expect(availableSlots(NOW).slots).toContain(SLOT);
    const res = createBooking(request(), NOW);
    expect(res.ok).toBe(true);
    expect(availableSlots(NOW).slots).not.toContain(SLOT);
    if (res.ok) {
      expect(res.booking.endUtc).toBe('2026-10-12T06:30:00.000Z');
      expect(findBookingByCancelToken(res.cancelToken)?.id).toBe(res.booking.id);
    }
  });

  it('refuses a second booking of the same slot', () => {
    expect(createBooking(request(), NOW).ok).toBe(true);
    expect(createBooking(request({ email: 'other@example.com' }), NOW)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('caps upcoming bookings per email and per connection', () => {
    expect(createBooking(request(), NOW, 'ip-a').ok).toBe(true);
    expect(createBooking(request({ start: '2026-10-12T06:30:00.000Z' }), NOW, 'ip-b')).toEqual({ ok: false, reason: 'limit' });
    expect(createBooking(request({ start: '2026-10-12T06:30:00.000Z', email: 'b@example.com' }), NOW, 'ip-a').ok).toBe(true);
    expect(createBooking(request({ start: '2026-10-19T06:00:00.000Z', email: 'c@example.com' }), NOW, 'ip-a')).toEqual({ ok: false, reason: 'limit' });
  });

  it('lets the same email book again once the earlier call is over or cancelled', () => {
    const first = createBooking(request(), NOW);
    if (!first.ok) throw new Error('setup');
    cancelBooking('guest', { token: first.cancelToken }, NOW);
    expect(createBooking(request({ start: '2026-10-12T06:30:00.000Z' }), NOW).ok).toBe(true);
  });

  it('refuses a time that is not a slot', () => {
    expect(createBooking(request({ start: '2026-10-12T06:10:00.000Z' }), NOW).ok).toBe(false);
    expect(createBooking(request({ start: '2026-10-13T06:00:00.000Z' }), NOW).ok).toBe(false);
  });

  it('refuses a slot on a blocked date', () => {
    addBlockedDate({ date: '2026-10-12', note: 'Eid' });
    expect(createBooking(request(), NOW).ok).toBe(false);
  });

  it('frees the slot again after a guest cancels, and cancelling twice is harmless', () => {
    const res = createBooking(request(), NOW);
    if (!res.ok) throw new Error('setup');
    const first = cancelBooking('guest', { token: res.cancelToken }, NOW);
    expect(first).toMatchObject({ ok: true, changed: true });
    const second = cancelBooking('guest', { token: res.cancelToken }, NOW);
    expect(second).toMatchObject({ ok: true, changed: false });
    expect(availableSlots(NOW).slots).toContain(SLOT);
    expect(createBooking(request({ email: 'next@example.com' }), NOW).ok).toBe(true);
  });

  it('does not let a guest cancel a call that already started', () => {
    const res = createBooking(request(), NOW);
    if (!res.ok) throw new Error('setup');
    expect(cancelBooking('guest', { token: res.cancelToken }, Date.parse(SLOT) + 60_000)).toEqual({ ok: false, reason: 'past' });
    expect(cancelBooking('admin', { id: res.booking.id }, Date.parse(SLOT) + 60_000)).toMatchObject({ ok: true, changed: true });
  });

  it('reports an unknown token as not found', () => {
    expect(cancelBooking('guest', { token: 'x'.repeat(43) }, NOW)).toEqual({ ok: false, reason: 'not_found' });
  });

  it('deletes bookings 12 months after the call', () => {
    const res = createBooking(request(), NOW);
    if (!res.ok) throw new Error('setup');
    purgeExpired(Date.parse(SLOT) + 364 * 86_400_000);
    expect(listBookings({ from: '2026-01-01T00:00:00.000Z', includeCancelled: true })).toHaveLength(1);
    purgeExpired(Date.parse(SLOT) + 366 * 86_400_000);
    expect(listBookings({ from: '2026-01-01T00:00:00.000Z', includeCancelled: true })).toHaveLength(0);
  });
});

describe('admin sign-in', () => {
  it('opens a session once per link', () => {
    const token = createLoginToken('ibrahim@itqanstudio.com', NOW);
    const session = redeemLoginToken(token, NOW + 60_000);
    expect(session?.email).toBe('ibrahim@itqanstudio.com');
    expect(redeemLoginToken(token, NOW + 120_000)).toBeNull();
    expect(sessionEmail(session?.sessionToken, NOW + 60_000)).toBe('ibrahim@itqanstudio.com');
  });

  it('replaces older unused links when a new one is requested', () => {
    const old = createLoginToken('ibrahim@itqanstudio.com', NOW);
    const fresh = createLoginToken('ibrahim@itqanstudio.com', NOW + 1000);
    expect(redeemLoginToken(old, NOW + 2000)).toBeNull();
    expect(redeemLoginToken(fresh, NOW + 2000)?.email).toBe('ibrahim@itqanstudio.com');
  });

  it('rejects an expired link', () => {
    const token = createLoginToken('ibrahim@itqanstudio.com', NOW);
    expect(redeemLoginToken(token, NOW + 16 * 60_000)).toBeNull();
  });

  it('ends sessions after 14 days and ignores junk tokens', () => {
    const token = createLoginToken('ibrahim@itqanstudio.com', NOW);
    const session = redeemLoginToken(token, NOW);
    expect(sessionEmail(session?.sessionToken, NOW + 15 * 86_400_000)).toBeNull();
    expect(sessionEmail('nope', NOW)).toBeNull();
    expect(sessionEmail(undefined, NOW)).toBeNull();
  });
});
