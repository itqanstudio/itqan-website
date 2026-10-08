import type { Availability, Busy } from './types';
import { addDaysYmd, minutesOf, hhmmOf, weekdayOf, ymdInZone, zonedToUtc } from './time';

export interface SlotInput {
  availability: Availability;
  /** Studio dates ("YYYY-MM-DD") with no bookings at all. */
  blocked: ReadonlySet<string>;
  /** Confirmed bookings. */
  busy: readonly Busy[];
  now: number;
}

const MINUTE = 60_000;

/**
 * Every bookable start time, as UTC ISO strings in ascending order.
 *
 * Slots are generated per studio date (calendar arithmetic, so a day is a day
 * across daylight-saving changes), step by the slot length inside each weekly
 * range, and are dropped when they: fall on a blocked date, start inside the
 * notice period, overlap a booking padded by the buffer, sit on a day that has
 * reached its booking cap, or fall in a skipped daylight-saving hour.
 */
export function generateSlots({ availability: a, blocked, busy, now }: SlotInput): string[] {
  const slotMs = a.slotMinutes * MINUTE;
  const bufferMs = a.bufferMinutes * MINUTE;
  const earliest = now + a.minNoticeHours * 60 * MINUTE;
  const today = ymdInZone(now, a.timezone);
  const perDay = countPerDay(busy, a.timezone);
  const out: string[] = [];

  for (let d = 0; d < a.horizonDays; d += 1) {
    const date = addDaysYmd(today, d);
    if (blocked.has(date) || (perDay.get(date) ?? 0) >= a.maxPerDay) continue;
    for (const range of a.weekly[weekdayOf(date)] ?? []) {
      const end = minutesOf(range.end);
      for (let m = minutesOf(range.start); m + a.slotMinutes <= end; m += a.slotMinutes) {
        const start = zonedToUtc(date, hhmmOf(m), a.timezone);
        if (!start) continue;
        const s = start.getTime();
        if (s < earliest) continue;
        const e = s + slotMs;
        if (busy.some((b) => s < b.end + bufferMs && e > b.start - bufferMs)) continue;
        out.push(start.toISOString());
      }
    }
  }
  return Array.from(new Set(out)).sort();
}

function countPerDay(busy: readonly Busy[], tz: string): Map<string, number> {
  const counts = new Map<string, number>();
  busy.forEach((b) => {
    const day = ymdInZone(b.start, tz);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return counts;
}
