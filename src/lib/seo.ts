/**
 * Canonical host and the small helpers the portal, legal pages, robots and
 * middleware share. The site's entity graph (Organization JSON-LD) lives in
 * src/lib/v3/seo.ts and describes the v3 AI studio; the pre-v3 graph that
 * used to sit here was removed on 11 Oct 2026.
 */
export const SITE_URL = 'https://itqanstudio.com';
/** Matches openGraph.siteName in src/lib/v3/seo.ts. */
export const SITE_NAME = 'Itqan';

/** Resolve a path to an absolute URL on the canonical host. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

type JsonLd = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList, which clarifies site structure for search engines and AI assistants. */
export function breadcrumbLd(items: readonly BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
