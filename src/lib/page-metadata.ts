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
  /** og:type. Case studies are articles; everything else is a website page. */
  ogType?: 'website' | 'article';
}

/** The dynamic OG image rendered by src/app/opengraph-image.tsx (1200x630). */
const DEFAULT_OG_IMAGE = '/opengraph-image';

/**
 * Suffix the brand-portal layout's title template appends. Shared so a portal
 * page's og:title / twitter:title always equal its rendered <title>.
 */
export const PORTAL_TITLE_SUFFIX = ' — Itqan Studio Brand';

interface ShareInput {
  path: string;
  /** The title as it renders in the tab, suffix included. */
  fullTitle: string;
  description: string;
  image?: string;
  ogType?: 'website' | 'article';
}

/**
 * Canonical + Open Graph + Twitter for one page.
 *
 * The canonical is RELATIVE on purpose: it resolves against the root layout's
 * metadataBase (https://itqanstudio.com), so a page reached through another
 * host (brand.itqanstudio.com) still names the apex URL as canonical.
 */
function shareMetadata({
  path,
  fullTitle,
  description,
  image = DEFAULT_OG_IMAGE,
  ogType = 'website',
}: ShareInput): Pick<Metadata, 'alternates' | 'openGraph' | 'twitter'> {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  // Only the default image is known to be 1200x630. A custom image (a
  // case-study cover) has its own size, so no dimensions are declared for it.
  const ogImage =
    image === DEFAULT_OG_IMAGE
      ? { url: imageUrl, width: 1200, height: 630, alt: fullTitle }
      : { url: imageUrl, alt: fullTitle };
  return {
    alternates: { canonical: path },
    openGraph: {
      type: ogType,
      url,
      siteName: SITE_NAME,
      locale: 'en_AE',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

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
  image,
  ogType,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    ...shareMetadata({
      path,
      fullTitle: `${title} | ${SITE_NAME}`,
      description,
      image,
      ogType,
    }),
  };
}

interface PortalMetadataInput {
  /** Page title without the suffix; the portal layout's template appends it. */
  title: string;
  description: string;
  /** The page's /brand path. Becomes the canonical and og:url. */
  path: string;
  /**
   * Use `title` as the whole title. Needed on /brand itself: a layout's
   * title.template applies to CHILD segments, not to the page in its own
   * segment, so a bare title there would fall through to the site template.
   */
  absoluteTitle?: boolean;
}

/**
 * Brand-portal metadata. Same job as pageMetadata(), with the portal's title
 * suffix.
 *
 * Every portal page is reachable on two hosts: itqanstudio.com/brand/... and
 * brand.itqanstudio.com (whose root is rewritten to /brand and whose /brand/*
 * paths pass through; see lib/brand-routing.ts). The relative canonical
 * resolves against metadataBase, so both hosts name the apex URL, which is the
 * one the sitemap lists.
 */
export function portalMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PortalMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title}${PORTAL_TITLE_SUFFIX}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...shareMetadata({ path, fullTitle, description }),
  };
}
