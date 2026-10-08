import { describe, expect, it } from 'vitest';
import { generateSlots } from './slots';
import { addDaysYmd, weekdayOf, ymdInZone, zonedToUtc, isYmd } from './time';
import type { Availability } from './types';

const base: Availability = {
  timezone: 'Asia/Dubai',
  slotMinutes: 30,
  bufferMinutes: 0,
  minNoticeHours: 0,
  horizonDays: 7,
  maxPerDay: 10,
  weekly: { mon: [{ start: '10:00', end: '12:00' }], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
};

// Sunday 11 Oct 2026, 08:00 Dubai (04:00 UTC).
const SUNDAY = Date.parse('2026-10-11T04:00:00.000Z');

describe('time helpers', () => {
  it('knows the weekday of a date', () => {
    expect(weekdayOf('2026-10-12')).toBe('mon');
    expect(weekdayOf('2026-10-18')).toBe('sun');
  });
  it('adds calendar days across month ends', () => {
    expect(addDaysYmd('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDaysYmd('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('rejects impossible dates', () => {
    expect(isYmd('2026-02-30')).toBe(false);
    expect(isYmd('2026-02-28')).toBe(true);
    expect(isYmd('2026-2-1')).toBe(false);
  });
  it('reads the date of an instant in a zone', () => {
    expect(ymdInZone(Date.parse('2026-10-11T21:30:00Z'), 'Asia/Dubai')).toBe('2026-10-12');
    expect(ymdInZone(Date.parse('2026-10-11T21:30:00Z'), 'Europe/Stockholm')).toBe('2026-10-11');
  });
  it('returns null for a wall-clock time skipped by daylight saving', () => {
    // Stockholm jumps from 02:00 to 03:00 on 29 March 2026.
    expect(zonedToUtc('2026-03-29', '02:30', 'Europe/Stockholm')).toBeNull();
    expect(zonedToUtc('2026-03-29', '03:30', 'Europe/Stockholm')?.toISOString()).toBe('2026-03-29T01:30:00.000Z');
  });
});

describe('generateSlots', () => {
  it('generates the weekly windows in the studio zone', () => {
    const slots = generateSlots({ availability: base, blocked: new Set(), busy: [], now: SUNDAY });
    // Monday 12 Oct 10:00 to 12:00 Dubai = 06:00 to 08:00 UTC, four 30-minute slots.
    expect(slots).toEqual([
      '2026-10-12T06:00:00.000Z',
      '2026-10-12T06:30:00.000Z',
      '2026-10-12T07:00:00.000Z',
      '2026-10-12T07:30:00.000Z',
    ]);
  });

  it('drops slots inside the notice period', () => {
    const slots = generateSlots({ availability: { ...base, minNoticeHours: 23 }, blocked: new Set(), busy: [], now: SUNDAY });
    // now + 23 h = Monday 07:00 Dubai is before 10:00, so all stay; at 27 h (11:00 Dubai) the first two go.
    expect(slots).toHaveLength(4);
    const later = generateSlots({ availability: { ...base, minNoticeHours: 27 }, blocked: new Set(), busy: [], now: SUNDAY });
    expect(later[0]).toBe('2026-10-12T07:00:00.000Z');
  });

  it('skips blocked dates', () => {
    expect(generateSlots({ availability: base, blocked: new Set(['2026-10-12']), busy: [], now: SUNDAY })).toEqual([]);
  });

  it('keeps the buffer around booked calls', () => {
    const busy = [{ start: Date.parse('2026-10-12T06:30:00Z'), end: Date.parse('2026-10-12T07:00:00Z') }];
    const none = generateSlots({ availability: base, blocked: new Set(), busy, now: SUNDAY });
    expect(none).toEqual(['2026-10-12T06:00:00.000Z', '2026-10-12T07:00:00.000Z', '2026-10-12T07:30:00.000Z']);
    const padded = generateSlots({ availability: { ...base, bufferMinutes: 15 }, blocked: new Set(), busy, now: SUNDAY });
    expect(padded).toEqual(['2026-10-12T07:30:00.000Z']);
  });

  it('closes a day that reached its cap', () => {
    const busy = [{ start: Date.parse('2026-10-12T06:00:00Z'), end: Date.parse('2026-10-12T06:30:00Z') }];
    expect(generateSlots({ availability: { ...base, maxPerDay: 1 }, blocked: new Set(), busy, now: SUNDAY })).toEqual([]);
  });

  it('stops at the horizon, counted in studio dates', () => {
    const a = { ...base, horizonDays: 1 };
    expect(generateSlots({ availability: a, blocked: new Set(), busy: [], now: SUNDAY })).toEqual([]);
    expect(generateSlots({ availability: { ...a, horizonDays: 2 }, blocked: new Set(), busy: [], now: SUNDAY })).toHaveLength(4);
  });

  it('follows daylight saving in a zone that has it', () => {
    const sthlm: Availability = { ...base, timezone: 'Europe/Stockholm', horizonDays: 14, weekly: { ...base.weekly, mon: [{ start: '09:00', end: '09:30' }] } };
    // Clocks go back on Sunday 25 Oct 2026: Monday 19 Oct is CEST (UTC+2), Monday 26 Oct is CET (UTC+1).
    const slots = generateSlots({ availability: sthlm, blocked: new Set(), busy: [], now: Date.parse('2026-10-18T00:00:00Z') });
    expect(slots).toEqual(['2026-10-19T07:00:00.000Z', '2026-10-26T08:00:00.000Z']);
  });

  it('never returns a slot that overruns its window', () => {
    const a = { ...base, slotMinutes: 45 };
    const slots = generateSlots({ availability: a, blocked: new Set(), busy: [], now: SUNDAY });
    expect(slots).toEqual(['2026-10-12T06:00:00.000Z', '2026-10-12T06:45:00.000Z']);
  });
});
