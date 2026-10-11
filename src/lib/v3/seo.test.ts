import { describe, expect, it } from 'vitest';
import { counterpartPath } from './seo';

describe('counterpartPath', () => {
  it('maps a bilingual English page to its Arabic twin and back', () => {
    expect(counterpartPath('/', 'en')).toBe('/ar');
    expect(counterpartPath('/book', 'en')).toBe('/ar/book');
    expect(counterpartPath('/ar/book', 'ar')).toBe('/book');
    expect(counterpartPath('/ar', 'ar')).toBe('/');
  });

  it('drops the query and the hash', () => {
    expect(counterpartPath('/book?topic=security#form', 'en')).toBe('/ar/book');
  });

  it.each(['/privacy', '/terms', '/cookies', '/feedback', '/support', '/thank-you'])(
    'sends the English-only page %s to the Arabic home page',
    (path) => {
      expect(counterpartPath(path, 'en')).toBe('/ar');
    },
  );

  it('treats every lead-magnet page as English only', () => {
    expect(counterpartPath('/magnet/founder-os-diagnostic', 'en')).toBe('/ar');
    expect(counterpartPath('/magnet/founder-os-diagnostic?utm_source=x', 'en')).toBe('/ar');
  });

  it('does not treat a path that only starts with an English-only name as English only', () => {
    expect(counterpartPath('/supporting', 'en')).toBe('/ar/supporting');
    expect(counterpartPath('/magnet', 'en')).toBe('/ar/magnet');
  });
});
