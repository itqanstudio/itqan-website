import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from './seo';

interface PageMetadataInput {
  /** Page title without the site name; the root template appends " | Itqan Studio". */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/services". Becomes the canonical and og:url. */
  path: string;
  /**
   * Optional site-relative image path. Defaults to the site-wide dynamic
   * `/opengraph-image` route, because a segment that declares its own
   * `openGraph` block REPLACES the parent's block wholesale (Next does not merge
   * it), so the root's file-based image would otherwise be lost on that page.
   */
  image?: string;
}

/** The dynamic OG image rendered by src/app/opengraph-image.tsx (1200x630). */
const DEFAULT_OG_IMAGE = '/opengraph-image';

/**
 * Per-page metadata with matching Open Graph and Twitter fields.
 *
 * Next.js does not deep-merge nested metadata objects from the root layout, so a
 * page that sets only `title` and `description` inherits the HOME page's
 * `openGraph` (including og:url) and `twitter` blocks. Every indexable page
 * should build its metadata through this helper so shares and previews point at
 * the page itself and always carry an image.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const imageUrl = absoluteUrl(image);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      locale: 'en_AE',
      title: fullTitle,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
