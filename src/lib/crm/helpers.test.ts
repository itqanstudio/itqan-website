import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SIGNATURE_MAX_SKEW_SECONDS, type BookingForEmail, type SlotsData } from './contract';
import { computeV1, verifySignature } from './hmac';
import { clearInitialSlotsCache, initialSlots } from './initial-slots';
import { cachedSlots, peekSlots } from './slots-cache';
import { clearReplayMemory, firstUse, replayMemorySize, signatureExpiry } from './replay';
import { bookingForEmailSchema, cancelBookingDataSchema, notifyRequestSchema, slotsDataSchema } from './schemas';
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
  team: [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true },
    { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: false },
  ],
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

  it('never grows past its cap, and never forgets a live signature to make room (panel round 2)', () => {
    const key = (i: number) => i.toString(16).padStart(64, '0');
    for (let i = 0; i < 10_000; i += 1) expect(firstUse(key(i), 2_000_000_000, 0)).toBe(true);
    // Full of live signatures: a new one is refused, and the first is still remembered.
    expect(firstUse(key(10_000), 2_000_000_000, 0)).toBe(false);
    expect(firstUse(key(0), 2_000_000_000, 0)).toBe(false);
    expect(replayMemorySize()).toBe(10_000);
    // Once they expire, room comes back.
    expect(firstUse(key(10_001), 2_000_000_000, signatureExpiry(2_000_000_000))).toBe(true);
    expect(replayMemorySize()).toBe(1);
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
  it('reads the founders: a missing list means the host alone, a bad entry is left out, an address counts once', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { team: _team, ...older } = booking;
    const fromOlder = bookingForEmailSchema.safeParse(older);
    expect(fromOlder.success && fromOlder.data.team).toEqual([{ name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true }]);
    const mixed = bookingForEmailSchema.safeParse({
      ...booking,
      team: [
        ...booking.team,
        { name: 'Ibrahim again', email: 'IBRAHIM@itqanstudio.com', isHost: false },
        { name: 'Evil\r\nBcc: x@y.z', email: 'evil@example.com', isHost: false },
        { name: 'No flag', email: 'noflag@example.com' },
        'not an object',
      ],
    });
    expect(mixed.success && mixed.data.team).toEqual(booking.team);
    expect(bookingForEmailSchema.safeParse({ ...booking, team: 'all' }).success).toBe(false);
    expect(bookingForEmailSchema.safeParse({ ...booking, team: Array.from({ length: 21 }, () => booking.team[0]) }).success).toBe(false);
    vi.restoreAllMocks();
  });
  it('adds the host only for a CRM from before the team field; any list the CRM sends is taken as sent (code review M1)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const host = { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', isHost: true };
    const bisma = { name: 'Bisma Aslam', email: 'bisma@itqanstudio.com', isHost: false };
    const teamOf = (team: unknown) => {
      const parsed = bookingForEmailSchema.safeParse({ ...booking, team });
      return parsed.success ? parsed.data.team : 'refused';
    };
    // No field at all (an older CRM): the host alone, as the old host notice did.
    expect(teamOf(undefined)).toEqual([host]);
    // An empty list is the CRM's answer (a deactivated host and nobody else active): nobody.
    expect(teamOf([])).toEqual([]);
    // Every row refused: nobody is added back.
    expect(teamOf([{ name: 'Evil\r\nBcc: x@y.z', email: 'evil@example.com', isHost: true }, 'x'])).toEqual([]);
    // The host left out (the CRM never adds back a host it marks inactive): their address gets nothing.
    expect(teamOf([bisma])).toEqual([bisma]);
    // The host listed but not marked, or someone else marked: the host's address decides, in the team's order.
    expect(teamOf([{ ...bisma, isHost: true }, { ...host, name: 'Ibrahim', isHost: false }])).toEqual([bisma, { ...host, name: 'Ibrahim' }]);
    // The host's address in another case counts as the host, once.
    expect(teamOf([{ ...host, email: 'IBRAHIM@ItqanStudio.com', isHost: false }, bisma])).toEqual([
      { ...host, email: 'IBRAHIM@ItqanStudio.com' },
      bisma,
    ]);
    vi.restoreAllMocks();
  });
  it('refuses a null team cleanly: a parse failure, never a throw', () => {
    expect(() => bookingForEmailSchema.safeParse({ ...booking, team: null })).not.toThrow();
    expect(bookingForEmailSchema.safeParse({ ...booking, team: null }).success).toBe(false);
  });
  it("reads the CRM's stored cancel reason: kept as plain text, null when none, never failing the cancel over it", () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reasonOf = (data: Record<string, unknown>) => {
      const parsed = cancelBookingDataSchema.safeParse({ changed: false, booking, noticeOwed: true, ...data });
      return parsed.success ? parsed.data.cancelReason : 'refused';
    };
    expect(reasonOf({ cancelReason: 'We chose another supplier.\nThanks.' })).toBe('We chose another supplier.\nThanks.');
    expect(reasonOf({ cancelReason: null })).toBeNull();
    // A CRM from before the field: undefined, so the site can tell "none" from "not sent".
    expect(reasonOf({})).toBeUndefined();
    // Bidi overrides and control characters go; an empty result is none.
    const rlo = String.fromCodePoint(0x202e);
    expect(reasonOf({ cancelReason: `${rlo}moved\u0007 ` })).toBe('moved');
    expect(reasonOf({ cancelReason: `${rlo} ` })).toBeNull();
    // One the site cannot use is dropped (logged), not a failed cancel.
    expect(reasonOf({ cancelReason: 42 })).toBeNull();
    expect(reasonOf({ cancelReason: 'x'.repeat(501) })).toBeNull();
    vi.restoreAllMocks();
  });
  it('holds the stored reason to its edges: 500 after cleaning, 2,000 raw (review r2, tests seat)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reasonOf = (cancelReason: unknown) => {
      const parsed = cancelBookingDataSchema.safeParse({ changed: false, booking, noticeOwed: true, cancelReason });
      return parsed.success ? parsed.data.cancelReason : 'refused';
    };
    const bell = '\u0007';
    // Exactly the limit once cleaned is kept.
    expect(reasonOf('x'.repeat(500))).toBe('x'.repeat(500));
    // Exactly the raw maximum, cleaning down under the limit, is kept; one more raw character is dropped.
    expect(reasonOf(`${'x'.repeat(500)}${bell.repeat(1_500)}`)).toBe('x'.repeat(500));
    expect(reasonOf(`${'x'.repeat(10)}${bell.repeat(1_991)}`)).toBeNull();
    // Over the limit even after cleaning is dropped; so is anything that is not text.
    expect(reasonOf(`${'x'.repeat(501)}${bell}`)).toBeNull();
    expect(reasonOf({ text: 'moved' })).toBeNull();
    expect(reasonOf(['moved'])).toBeNull();
    expect(console.error).toHaveBeenCalledTimes(4);
    vi.restoreAllMocks();
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

describe('cachedSlots (final review fixes)', () => {
  beforeEach(() => clearInitialSlotsCache());
  const ok = (data: SlotsData) => async () => ({ ok: true as const, data });

  it('never caches a filter that names no host, so made-up filters cannot push the real entries out', async () => {
    await cachedSlots(undefined, ok(slotsData), 1_000);
    for (let i = 0; i < 60; i += 1) await cachedSlots(`nobody-${i}`, ok({ ...slotsData, hosts: [], slots: [] }), 1_000);
    expect(peekSlots(undefined, 1_000)).not.toBeNull();
    expect(peekSlots('nobody-0', 1_000)).toBeNull();
  });

  it('drops the oldest entry when full, not all of them', async () => {
    await cachedSlots(undefined, ok(slotsData), 1_000);
    for (let i = 0; i < 50; i += 1) await cachedSlots(`host-${i}`, ok(slotsData), 1_000);
    expect(peekSlots(undefined, 1_000)).toBeNull();
    expect(peekSlots('host-49', 1_000)).not.toBeNull();
    expect(peekSlots('host-1', 1_000)).not.toBeNull();
  });

  it('keeps callers with different time limits on separate calls', async () => {
    let calls = 0;
    const slow = () =>
      new Promise<{ ok: true; data: SlotsData }>((resolve) => {
        calls += 1;
        setTimeout(() => resolve({ ok: true, data: slotsData }), 0);
      });
    await Promise.all([cachedSlots(undefined, slow, 1_000, 'page'), cachedSlots(undefined, slow, 1_000, 'widget')]);
    expect(calls).toBe(2);
    clearInitialSlotsCache();
    calls = 0;
    await Promise.all([cachedSlots(undefined, slow, 1_000), cachedSlots(undefined, slow, 1_000)]);
    expect(calls).toBe(1);
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
