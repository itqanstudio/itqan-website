import type { MetadataRoute } from 'next';
import { caseStudies } from '@/data/case-studies';
import { PORTAL_PAGES } from '@/data/brand-portal';
import { SITE_URL } from '@/lib/seo';

/**
 * Data-driven sitemap. Case-study URLs are derived from src/data/case-studies.ts
 * (the same source generateStaticParams uses for /work/[id]) so the sitemap can
 * never drift out of sync again when a project is added or removed.
 */
/**
 * Last meaningful content change, bumped by hand with the content. It used to
 * be `new Date()`, which stamped every URL as changed on every deploy; Google
 * only honours lastmod when it is consistently accurate, so it learned to
 * ignore this site's.
 */
const CONTENT_UPDATED = '2026-09-26';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_UPDATED;

  const staticPages: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/work', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/support', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  ];

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...caseStudies.map((cs) => ({
      url: `${SITE_URL}/work/${cs.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    /*
     * Brand portal. Derived from PORTAL_PAGES — the same tree the sidebar and
     * search render from — so a page can never exist in the nav but be missing
     * from the sitemap. The old /brands hub is gone; middleware 308s it here.
     */
    ...PORTAL_PAGES.map((p) => ({
      url: `${SITE_URL}${p.href}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: p.href === '/brand' ? 0.6 : 0.4,
    })),
  ];
}
