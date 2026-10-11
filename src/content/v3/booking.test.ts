import { describe, expect, it } from 'vitest';
import { bookingCopy, type BookingCopy } from './booking';
import { fill, formatWhen, localHostName, splitAt } from './booking-format';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const BANNED = ['elevate', 'empower', 'seamless', 'end-to-end', 'cutting-edge', 'leverage', 'unlock', 'journey', 'solutions'];

describe('booking copy rules', () => {
  (['en', 'ar'] as const).forEach((lang) => {
    it(`${lang}: no em or en dashes and no banned words`, () => {
      strings(bookingCopy[lang]).forEach((s) => {
        expect(s).not.toMatch(/[–—]/);
        BANNED.forEach((word) => expect(s.toLowerCase()).not.toContain(word));
      });
    });
  });

  it('keeps the same placeholders in both languages', () => {
    const placeholders = (c: BookingCopy) => strings(c).flatMap((s) => s.match(/\{\w+\}/g) ?? []).sort();
    expect(placeholders(bookingCopy.ar)).toEqual(placeholders(bookingCopy.en));
  });

  it('says who the call is with and how long it is', () => {
    expect(bookingCopy.en.lead).toContain('Ibrahim or Bisma, the founders');
    expect(fill(bookingCopy.en.title[1], { n: 45 })).toBe('45‑minute briefing.');
    expect(fill(bookingCopy.ar.pointLength, { n: 30 })).toBe('مجانية، 30 دقيقة، عبر الفيديو');
    expect(bookingCopy.en.paused).toBe('Booking is paused for a moment. Email hello@itqanstudio.com and we will find a time.');
    expect(bookingCopy.ar.paused).toContain('hello@itqanstudio.com');
  });
});

describe('fill and splitAt', () => {
  it('replaces known keys and leaves unknown ones visible', () => {
    expect(fill('{n} minutes with {host}', { n: 30, host: 'Bisma' })).toBe('30 minutes with Bisma');
    expect(fill('{missing} stays', {})).toBe('{missing} stays');
    expect(fill('{constructor}', {})).toBe('{constructor}');
  });
  it('splits around one placeholder', () => {
    expect(splitAt('Your call is with {host}.', 'host')).toEqual(['Your call is with ', '.']);
    expect(splitAt('No placeholder', 'host')).toEqual(['No placeholder', '']);
  });
});

describe('localHostName', () => {
  it('uses the Arabic site names for known hosts in Arabic only', () => {
    expect(localHostName({ slug: 'ibrahim', name: 'Ibrahim Shareef' }, 'ar')).toBe('إبراهيم شريف');
    expect(localHostName({ slug: 'bisma', name: 'Bisma Aslam' }, 'en')).toBe('Bisma Aslam');
    expect(localHostName({ slug: 'constructor', name: 'New Host' }, 'ar')).toBe('New Host');
  });
});

describe('formatWhen', () => {
  it('formats in the zone and language given', () => {
    // The comma after the weekday depends on the ICU version, so match the stable part.
    expect(formatWhen('2026-10-12T06:00:00.000Z', 'Asia/Dubai', 'en')).toMatch(/^Monday,? 12 October 2026, 10:00 \(Asia\/Dubai\)$/);
    expect(formatWhen('2026-10-12T06:00:00.000Z', 'Asia/Dubai', 'ar')).toContain('10:00 (Asia/Dubai)');
  });
});
