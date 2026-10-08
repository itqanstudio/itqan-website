import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import type { Weekday } from './types';
import { WEEKDAYS } from './types';

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isHHMM(value: string): boolean {
  return HHMM.test(value);
}

export function minutesOf(hhmm: string): number {
  const m = HHMM.exec(hhmm);
  if (!m) throw new Error(`Invalid time: ${hhmm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

export function hhmmOf(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** A real calendar date in "YYYY-MM-DD" form (rejects 2026-02-30). */
export function isYmd(value: string): boolean {
  const m = YMD.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
}

/** The calendar date of an instant, as seen in a time zone. */
export function ymdInZone(instant: Date | number, tz: string): string {
  return formatInTimeZone(instant, tz, 'yyyy-MM-dd');
}

/** Calendar arithmetic on a "YYYY-MM-DD" date, independent of any time zone. */
export function addDaysYmd(ymd: string, days: number): string {
  const m = YMD.exec(ymd);
  if (!m) throw new Error(`Invalid date: ${ymd}`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(ymd: string): Weekday {
  const m = YMD.exec(ymd);
  if (!m) throw new Error(`Invalid date: ${ymd}`);
  const js = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
  return WEEKDAYS[(js + 6) % 7];
}

/**
 * The UTC instant of a wall-clock time in a zone, or null when that time does
 * not exist there (the hour skipped when clocks go forward). A round trip
 * catches the gap: a skipped time formats back as a different wall clock.
 */
export function zonedToUtc(ymd: string, hhmm: string, tz: string): Date | null {
  const utc = fromZonedTime(`${ymd}T${hhmm}:00`, tz);
  if (Number.isNaN(utc.getTime())) return null;
  return formatInTimeZone(utc, tz, "yyyy-MM-dd'T'HH:mm") === `${ymd}T${hhmm}` ? utc : null;
}
