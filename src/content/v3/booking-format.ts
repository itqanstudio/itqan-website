import type { Lang } from './types';

/*
 * Small helpers for the booking copy. Kept apart from the copy itself so the
 * client components can use them without bundling both languages' text.
 */

/** Arabic names of the hosts, as written on the Arabic site; anyone else keeps the CRM name. */
const HOST_NAMES_AR: ReadonlyMap<string, string> = new Map([
  ['ibrahim', 'إبراهيم شريف'],
  ['bisma', 'بسمة أسلم'],
]);

/** The host's name in the reader's language. */
export function localHostName(host: { slug: string; name: string }, lang: Lang): string {
  return (lang === 'ar' && HOST_NAMES_AR.get(host.slug)) || host.name;
}

/** Replaces `{key}` placeholders. A key with no value stays as written, so a gap is visible in review. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : whole));
}

/** Splits a template around one placeholder, for wrapping the value in an element. */
export function splitAt(template: string, key: string): readonly [string, string] {
  const marker = `{${key}}`;
  const at = template.indexOf(marker);
  return at < 0 ? [template, ''] : [template.slice(0, at), template.slice(at + marker.length)];
}

/** Long date and time of an instant in a zone, in the reader's language. */
export function formatWhen(iso: string, timezone: string, lang: Lang): string {
  const locale = lang === 'en' ? 'en-GB' : 'ar-u-nu-latn';
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(d);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(d);
  return `${date}${lang === 'ar' ? '،' : ','} ${time} (${timezone.replace(/_/g, ' ')})`;
}
