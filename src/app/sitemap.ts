import type { MetadataRoute } from 'next';
import { PORTAL_PAGES } from '@/data/brand-portal';
import { SITE_URL } from '@/lib/v3/seo';
import { CASE_SLUGS } from '@/components/v3/CasePage';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Last meaningful content change, bumped by hand with the content. It used to
 * be `new Date()`, which stamped every URL as changed on every deploy; Google
 * only honours lastmod when it is consistently accurate.
 */
const CONTENT_UPDATED = '2026-10-08';

/** A page that exists in English and Arabic, listed once per language with hreflang alternates. */
function bilingual(enPath: string, priority: number, changeFrequency: Entry['changeFrequency'], lastModified: string): Entry[] {
  const arPath = enPath === '/' ? '/ar' : `/ar${enPath}`;
  const languages = { en: `${SITE_URL}${enPath === '/' ? '' : enPath}`, ar: `${SITE_URL}${arPath}` };
  return [
    { url: languages.en, lastModified, changeFrequency, priority, alternates: { languages } },
    { url: languages.ar, lastModified, changeFrequency, priority, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_UPDATED;
  return [
    ...bilingual('/', 1.0, 'weekly', lastModified),
    ...bilingual('/book', 0.9, 'monthly', lastModified),
    ...CASE_SLUGS.flatMap((slug) => bilingual(`/work/${slug}`, 0.7, 'monthly', lastModified)),
    ...['/privacy', '/terms', '/cookies'].map((p) => ({ url: `${SITE_URL}${p}`, lastModified, changeFrequency: 'yearly' as const, priority: 0.2 })),
    { url: `${SITE_URL}/support`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    /*
     * Brand portal, served at /brand and at brand.itqanstudio.com.
     * Derived from PORTAL_PAGES, the same tree the portal sidebar renders from.
     */
    ...PORTAL_PAGES.map((p) => ({
      url: `${SITE_URL}${p.href}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: p.href === '/brand' ? 0.4 : 0.3,
    })),
  ];
}
