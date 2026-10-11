import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SIGNATURE_MAX_SKEW_SECONDS, type BookingForEmail, type SlotsData } from './contract';
import { computeV1, verifySignature } from './hmac';
import { clearInitialSlotsCache, initialSlots } from './initial-slots';
import { clearReplayMemory, firstUse, replayMemorySize, signatureExpiry } from './replay';
import { bookingForEmailSchema, notifyRequestSchema, slotsDataSchema } from './schemas';
import { parseHostSlug } from './slug';
import { toWidgetSlots } from './widget-slots';

const slotsData: SlotsData = {
  slotMinutes: 30,
  timezone: 'Asia/Dubai',
  hosts: [
    { slug: 'ibrahim', name: 'Ibrahim Shareef' },
    { slug: 'bisma', name: 'Bisma Aslam' },
  ],
  slots: [
    { start: '2026-10-12T07:00:00.000Z', hosts: ['bisma'] },
    { start: '2026-10-12T06:00:00.000Z', hosts: ['ibrahim', 'bisma'] },
    { start: '2026-10-12T06:00:00.000Z', hosts: ['ibrahim'] },
  ],
};

const booking: BookingForEmail = {
  id: '4f9a2b1c-0000-4000-8000-000000000001',
  start: '2026-10-12T06:00:00.000Z',
  end: '2026-10-12T06:30:00.000Z',
  guestName: 'Sara Ahmed',
  guestEmail: 'sara@example.com',
  company: 'Example Foods',
  role: '',
  industry: 'fnb',
  message: 'Line one\nLine two',
  topic: 'briefing',
  locale: 'ar',
  guestTimezone: 'Asia/Riyadh',
  host: { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', meetingUrl: null },
};

describe('parseHostSlug', () => {
  it('accepts slugs only, taking the first of repeated params', () => {
    expect(parseHostSlug('bisma')).toBe('bisma');
    expect(parseHostSlug(['ibrahim', 'bisma'])).toBe('ibrahim');
    [undefined, null, '', 'B', 'bisma!', 'a', '9lives', 'x'.repeat(32), 42, ['Bad']].forEach((v) => expect(parseHostSlug(v)).toBeUndefined());
  });
});

describe('firstUse', () => {
  const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
  beforeEach(() => clearReplayMemory());
  it('accepts a signature once inside its window and again after it', () => {
    expect(firstUse('a'.repeat(64), 0, 0)).toBe(true);
    expect(firstUse('a'.repeat(64), 0, 1000)).toBe(false);
    expect(firstUse('b'.repeat(64), 0, 1000)).toBe(true);
    expect(firstUse('a'.repeat(64), 0, signatureExpiry(0))).toBe(true);
  });

  it('remembers a signature through the last second verification still accepts (panel run 4)', () => {
    const t = 1000;
    const v1 = 'c'.repeat(64);
    // First seen at the earliest instant it verifies: 300 seconds before its stamp.
    expect(firstUse(v1, t, (t - SIGNATURE_MAX_SKEW_SECONDS) * 1000)).toBe(true);
    // Whole-second verification still accepts it anywhere in second t + 300.
    const lastAccepted = (t + SIGNATURE_MAX_SKEW_SECONDS) * 1000 + 999;
    expect(verifySignature({ secret: SECRET, header: `t=${t},v1=${computeV1(SECRET, t, 'POST', '/x', '')}`, method: 'POST', pathWithQuery: '/x', body: '', now: Math.floor(lastAccepted / 1000) }).ok).toBe(true);
    expect(firstUse(v1, t, lastAccepted)).toBe(false);
    expect(signatureExpiry(t)).toBe(lastAccepted + 1);
  });

  it('never grows past its cap', () => {
    for (let i = 0; i < 10_005; i += 1) firstUse(i.toString(16).padStart(64, '0'), 2_000_000_000, 0);
    expect(replayMemorySize()).toBe(10_000);
  });
});

describe('toWidgetSlots', () => {
  it('keeps the widget shape: sorted unique starts, length, zone and hosts', () => {
    expect(toWidgetSlots(slotsData)).toEqual({
      slots: ['2026-10-12T06:00:00.000Z', '2026-10-12T07:00:00.000Z'],
      slotMinutes: 30,
      timezone: 'Asia/Dubai',
      hosts: slotsData.hosts,
    });
  });
});

describe('schemas', () => {
  it('accepts a good booking and refuses unsafe fields', () => {
    expect(bookingForEmailSchema.safeParse(booking).success).toBe(true);
    const bad: unknown[] = [
      { ...booking, id: 'x\r\nBcc: a@b.c' },
      { ...booking, guestEmail: 'a@b.c\r\nBcc: x@y.z' },
      { ...booking, company: 'Evil\r\nSubject: hi' },
      { ...booking, guestTimezone: 'Mars/Olympus' },
      { ...booking, end: booking.start },
      { ...booking, start: '2026-10-12 06:00' },
      { ...booking, locale: 'fr' },
      { ...booking, host: { ...booking.host, slug: 'Bad Slug' } },
      { ...booking, host: { ...booking.host, meetingUrl: 'http://meet.example' } },
      { ...booking, host: { ...booking.host, email: 'not an email' } },
    ];
    bad.forEach((b) => expect(bookingForEmailSchema.safeParse(b).success).toBe(false));
  });
  it('checks the notify request exactly', () => {
    expect(notifyRequestSchema.safeParse({ type: 'booking.cancelled', by: 'host', notifyGuest: true, booking }).success).toBe(true);
    expect(notifyRequestSchema.safeParse({ type: 'booking.created', by: 'host', notifyGuest: true, booking }).success).toBe(false);
    expect(notifyRequestSchema.safeParse({ type: 'booking.cancelled', by: 'guest', notifyGuest: true, booking }).success).toBe(false);
    expect(notifyRequestSchema.safeParse({ type: 'booking.cancelled', by: 'host', notifyGuest: 'yes', booking }).success).toBe(false);
  });
  it('bounds the slot list', () => {
    expect(slotsDataSchema.safeParse(slotsData).success).toBe(true);
    expect(slotsDataSchema.safeParse({ ...slotsData, slotMinutes: 0 }).success).toBe(false);
    expect(slotsDataSchema.safeParse({ ...slotsData, slots: [{ start: 'tomorrow', hosts: [] }] }).success).toBe(false);
  });
});

describe('initialSlots', () => {
  beforeEach(() => {
    clearInitialSlotsCache();
    vi.stubEnv('ITQAN_BOOKING_SECRET', 'test-secret-0123456789abcdef0123456789abcdef');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches once with a short timeout and serves the cache for 20 seconds per host filter', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true, data: slotsData }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const first = await initialSlots(undefined, 'ip-1', 1_000);
    expect(first?.slotMinutes).toBe(30);
    await initialSlots(undefined, 'ip-1', 20_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await initialSlots('bisma', 'ip-1', 20_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await initialSlots(undefined, 'ip-1', 21_001);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns null when the CRM fails, and caches nothing', async () => {
    const fetchMock = vi.fn(async () => new Response('{"ok":false,"error":"unavailable"}', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await initialSlots(undefined, 'ip-2', 1_000)).toBeNull();
    expect(await initialSlots(undefined, 'ip-2', 1_001)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops calling the CRM for one connection that reloads too often', async () => {
    const fetchMock = vi.fn(async () => new Response('{"ok":false,"error":"unavailable"}', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    for (let i = 0; i < 25; i += 1) await initialSlots(undefined, 'ip-3', 1_000 + i);
    expect(fetchMock).toHaveBeenCalledTimes(20);
  });
});
