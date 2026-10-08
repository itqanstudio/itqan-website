import type { Metadata, Viewport } from 'next';
import type { Lang } from '@/content/v3/types';

export const SITE_URL = 'https://itqanstudio.com';
export const STUDIO_EMAIL = 'ibrahim@itqanstudio.com';
export const OG_IMAGE: Record<Lang, string> = { en: '/v3/og-en.png', ar: '/v3/og-ar.png' };

/** Pages that exist in English only (legal text). The language switch sends Arabic readers to /ar. */
const EN_ONLY = new Set(['/privacy', '/terms', '/cookies']);

/** The same page in the other language. Paths are site-relative, without a hash. */
export function counterpartPath(path: string, from: Lang): string {
  const clean = path.split(/[?#]/)[0] || '/';
  if (from === 'en') {
    if (EN_ONLY.has(clean)) return '/ar';
    return clean === '/' ? '/ar' : `/ar${clean}`;
  }
  const rest = clean.replace(/^\/ar(?=\/|$)/, '');
  return rest === '' ? '/' : rest;
}

/** Canonical plus hreflang alternates for a page that exists in both languages. */
export function bilingualAlternates(enPath: string, lang: Lang): Metadata['alternates'] {
  const arPath = counterpartPath(enPath, 'en');
  return {
    canonical: lang === 'en' ? enPath : arPath,
    languages: { en: enPath, ar: arPath, 'x-default': enPath },
  };
}

interface PageMetaInput {
  lang: Lang;
  title: string;
  description: string;
  /** English path of the page; the Arabic one is derived. */
  enPath: string;
  bilingual?: boolean;
  /** Use the title as is, without the " · Itqan" template. */
  absoluteTitle?: boolean;
}

export function pageMeta({ lang, title, description, enPath, bilingual = true, absoluteTitle = false }: PageMetaInput): Metadata {
  const path = lang === 'en' ? enPath : counterpartPath(enPath, 'en');
  const image = OG_IMAGE[lang];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: bilingual ? bilingualAlternates(enPath, lang) : { canonical: path },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      siteName: 'Itqan',
      locale: lang === 'en' ? 'en_AE' : 'ar_AE',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export const v3Viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0A0D',
  colorScheme: 'dark',
};

export function baseMetadata(lang: Lang): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'Itqan', template: lang === 'en' ? '%s · Itqan' : '%s · إتقان' },
    applicationName: 'Itqan',
    creator: 'Itqan Studio FZ-LLC',
    publisher: 'Itqan Studio FZ-LLC',
    icons: { icon: [{ url: '/v3/icon.svg', type: 'image/svg+xml' }], apple: '/v3/apple-touch-icon.png' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  };
}

/** Organization JSON-LD for the v3 site. Facts only: names, places and public profiles. */
export function organizationLd(lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: lang === 'en' ? 'Itqan' : 'إتقان',
    alternateName: ['Itqan Studio', 'إتقان'],
    legalName: 'Itqan Studio FZ-LLC',
    url: SITE_URL,
    logo: `${SITE_URL}/v3/icon.svg`,
    email: STUDIO_EMAIL,
    description:
      'Itqan builds AI agents for operations, supply chain and customer teams in manufacturing, retail and food and beverage, and runs them inside the client’s own cloud account.',
    address: { '@type': 'PostalAddress', addressLocality: 'Ras Al Khaimah', addressCountry: 'AE' },
    location: [
      { '@type': 'Place', name: 'Dubai, United Arab Emirates' },
      { '@type': 'Place', name: 'Gothenburg, Sweden' },
    ],
    founder: [
      { '@type': 'Person', name: 'Ibrahim Shareef', jobTitle: 'Founder and CEO' },
      { '@type': 'Person', name: 'Bisma Aslam', jobTitle: 'Co-founder' },
    ],
    knowsLanguage: ['ar', 'en', 'sv'],
    sameAs: ['https://www.linkedin.com/company/110338926/', 'https://www.instagram.com/madebyitqan/'],
  };
}

/** Escape a JSON-LD payload for safe inlining in a script tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
