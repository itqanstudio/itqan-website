/** Client-side helpers for showing UTC slots in the visitor's time zone. */

export interface DayGroup {
  ymd: string;
  slots: string[];
}

const ymdFormatters = new Map<string, Intl.DateTimeFormat>();

export function ymdIn(iso: string, tz: string): string {
  let f = ymdFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    ymdFormatters.set(tz, f);
  }
  return f.format(new Date(iso));
}

/** Slots grouped by the visitor's local date, days in ascending order. */
export function groupByDay(slots: readonly string[], tz: string): DayGroup[] {
  const map = new Map<string, string[]>();
  slots.forEach((s) => {
    const key = ymdIn(s, tz);
    map.set(key, [...(map.get(key) ?? []), s]);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ymd, list]) => ({ ymd, slots: list.sort() }));
}

function locale(lang: 'en' | 'ar'): string {
  return lang === 'en' ? 'en-GB' : 'ar-u-nu-latn';
}

export function dayLabel(ymd: string, lang: 'en' | 'ar'): { weekday: string; day: string; month: string } {
  // Noon UTC keeps the calendar date stable in every zone for display.
  const d = new Date(`${ymd}T12:00:00Z`);
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale(lang), { ...o, timeZone: 'UTC' }).format(d);
  return { weekday: fmt({ weekday: 'short' }), day: fmt({ day: 'numeric' }), month: fmt({ month: 'short' }) };
}

export function timeLabel(iso: string, tz: string, lang: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale(lang), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date(iso));
}

export function longLabel(iso: string, tz: string, lang: 'en' | 'ar'): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(locale(lang), { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }).format(d);
  return `${date}, ${timeLabel(iso, tz, lang)}`;
}

export const COMMON_ZONES = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Asia/Kuwait',
  'Asia/Bahrain',
  'Asia/Muscat',
  'Africa/Cairo',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'America/New_York',
  'UTC',
] as const;

export function detectZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
