import { describe, expect, it } from 'vitest';
import { bookingRequestSchema, cancelRequestSchema, firstIssue } from './validation';
import { buildIcs, escapeText, foldLine } from './ics';
import { isValidTimeZone } from './time';
import { counterpartPath } from '@/lib/v3/seo';

const good = {
  start: '2026-10-12T06:00:00.000Z',
  name: '  Sara Ahmed ',
  email: ' Sara@Example.com ',
  company: 'Example Foods',
  industry: 'fnb',
  locale: 'ar',
  timezone: 'Asia/Dubai',
};

describe('bookingRequestSchema', () => {
  it('accepts a normal request and normalises it', () => {
    const r = bookingRequestSchema.parse(good);
    expect(r.name).toBe('Sara Ahmed');
    expect(r.email).toBe('sara@example.com');
    expect(r.topic).toBe('briefing');
    expect(r.role).toBe('');
  });
  it('strips line breaks from single-line fields (no header injection)', () => {
    const r = bookingRequestSchema.parse({ ...good, company: 'Evil\r\nBcc: x@y.z' });
    expect(r.company).not.toMatch(/[\r\n]/);
  });
  it('rejects bad input', () => {
    expect(bookingRequestSchema.safeParse({ ...good, email: 'not-an-email' }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...good, timezone: 'Mars/Olympus' }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...good, start: '2026-10-12 10:00' }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...good, name: 'A' }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...good, industry: 'oil' }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...good, message: 'x'.repeat(2001) }).success).toBe(false);
  });
  it('takes an optional host slug and nothing that is not one', () => {
    expect(bookingRequestSchema.parse({ ...good, with: 'bisma' }).with).toBe('bisma');
    expect(bookingRequestSchema.parse(good).with).toBeUndefined();
    ['Bisma', 'b', '1abc', 'a'.repeat(40), 'bisma?x=1', ''].forEach((w) => expect(bookingRequestSchema.safeParse({ ...good, with: w }).success).toBe(false));
  });
  it('names the first failing field', () => {
    const parsed = bookingRequestSchema.safeParse({ ...good, email: 'nope' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(firstIssue(parsed.error)).toMatch(/^email: /);
  });
});

describe('cancelRequestSchema and time zones', () => {
  it('accepts a url-safe token only', () => {
    expect(cancelRequestSchema.safeParse({ token: 'A'.repeat(43) }).success).toBe(true);
    expect(cancelRequestSchema.safeParse({ token: 'short' }).success).toBe(false);
    expect(cancelRequestSchema.safeParse({ token: `${'A'.repeat(40)}/..` }).success).toBe(false);
  });
  it('knows real time zones', () => {
    expect(isValidTimeZone('Europe/Stockholm')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});

describe('ics', () => {
  it('escapes text and folds long lines at 75 octets', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const folded = foldLine(`DESCRIPTION:${'إتقان '.repeat(30)}`);
    folded.split('\r\n').forEach((l) => expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75));
  });
  it('builds a cancel event with the same UID', () => {
    const ics = buildIcs({
      uid: 'abc@itqanstudio.com',
      start: new Date('2026-10-12T06:00:00Z'),
      end: new Date('2026-10-12T06:30:00Z'),
      summary: 'Briefing',
      description: 'Hello',
      organizerEmail: 'ibrahim@itqanstudio.com',
      method: 'CANCEL',
      sequence: 1,
      now: new Date('2026-10-11T00:00:00Z'),
    });
    expect(ics).toContain('METHOD:CANCEL');
    expect(ics).toContain('UID:abc@itqanstudio.com');
    expect(ics).toContain('DTSTART:20261012T060000Z');
    expect(ics).toContain('STATUS:CANCELLED');
  });
});

describe('counterpartPath', () => {
  it('maps pages between languages', () => {
    expect(counterpartPath('/', 'en')).toBe('/ar');
    expect(counterpartPath('/work/millow', 'en')).toBe('/ar/work/millow');
    expect(counterpartPath('/privacy', 'en')).toBe('/ar');
    expect(counterpartPath('/ar', 'ar')).toBe('/');
    expect(counterpartPath('/ar/book?topic=security', 'ar')).toBe('/book');
    expect(counterpartPath('/ar/work/nexilink', 'ar')).toBe('/work/nexilink');
  });
});
