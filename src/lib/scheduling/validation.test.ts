import { describe, expect, it } from 'vitest';
import { availabilitySchema, bookingRequestSchema, blockedDateSchema } from './validation';
import { DEFAULT_AVAILABILITY } from './config';
import { buildIcs, escapeText, foldLine } from './ics';
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
});

describe('availabilitySchema', () => {
  it('accepts the defaults', () => {
    expect(availabilitySchema.safeParse(DEFAULT_AVAILABILITY).success).toBe(true);
  });
  it('rejects overlapping or backwards windows', () => {
    const overlap = { ...DEFAULT_AVAILABILITY, weekly: { ...DEFAULT_AVAILABILITY.weekly, mon: [{ start: '10:00', end: '12:00' }, { start: '11:00', end: '13:00' }] } };
    const backwards = { ...DEFAULT_AVAILABILITY, weekly: { ...DEFAULT_AVAILABILITY.weekly, mon: [{ start: '12:00', end: '10:00' }] } };
    expect(availabilitySchema.safeParse(overlap).success).toBe(false);
    expect(availabilitySchema.safeParse(backwards).success).toBe(false);
  });
  it('rejects values out of range', () => {
    expect(availabilitySchema.safeParse({ ...DEFAULT_AVAILABILITY, slotMinutes: 7 }).success).toBe(false);
    expect(availabilitySchema.safeParse({ ...DEFAULT_AVAILABILITY, horizonDays: 0 }).success).toBe(false);
    expect(availabilitySchema.safeParse({ ...DEFAULT_AVAILABILITY, timezone: 'Nowhere' }).success).toBe(false);
  });
  it('validates blocked dates', () => {
    expect(blockedDateSchema.safeParse({ date: '2026-02-30' }).success).toBe(false);
    expect(blockedDateSchema.parse({ date: '2026-12-02' }).note).toBe('');
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
