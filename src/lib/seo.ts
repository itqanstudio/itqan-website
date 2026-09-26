/**
 * Centralized SEO + structured-data configuration.
 *
 * One source of truth for the canonical URL, business NAP (name / address /
 * phone-or-contact), social profiles, and the service taxonomy — consumed by
 * page metadata, the sitemap, robots, the web manifest, and every JSON-LD
 * entity node. Keeping these here guarantees NAP consistency (a real local-SEO
 * ranking factor) and a single connected entity graph for Google + LLMs.
 *
 * Schema note: schema.org deprecated `ProfessionalService` (confused with
 * `Service`). We model the studio as `Organization` + discrete `Service`
 * nodes, linked by stable `@id`, rather than the deprecated type.
 */
import type { CaseStudy } from '@/data/case-studies';

export const SITE_URL = 'https://itqanstudio.com';
export const SITE_NAME = 'Itqan Studio';
export const LEGAL_NAME = 'Itqan Studio FZ LLC';
export const SITE_TAGLINE = 'Your brand has potential. We give it direction.';

/** The head terms we target, plus brand. Reused in metadata keywords + llms.txt. */
export const TARGET_KEYWORDS: readonly string[] = [
  'design agency Dubai',
  'AI agency Dubai',
  'AI visibility agency Dubai',
  'GEO agency Dubai',
  'generative engine optimization Dubai',
  'SEO agency Dubai',
  'branding agency Dubai',
  'web design agency Dubai',
  'web development Dubai',
  'social media marketing Dubai',
  'content marketing Dubai',
  'web hosting Dubai',
  'UI UX design Dubai',
  'brand identity Dubai',
  'automation agency Dubai',
  'founder studio',
  'Itqan Studio',
];

export const BUSINESS = {
  legalName: LEGAL_NAME,
  name: SITE_NAME,
  email: 'info@itqanstudio.com',
  city: 'Dubai',
  region: 'Dubai',
  country: 'AE',
  countryName: 'United Arab Emirates',
  logo: `${SITE_URL}/images/brand/dark-logo.svg`,
  /** Real, live social profiles (must match the footer exactly for NAP consistency). */
  sameAs: [
    'https://www.instagram.com/madebyitqan/',
    'https://www.linkedin.com/company/110338926/',
  ],
  // Job titles match the on-page copy (Portrait + AboutHero + TeamSection) exactly —
  // entity consistency for E-E-A-T. The site was deliberately reframed off "solo founder".
  founder: {
    name: 'Ibrahim Shareef',
    jobTitle: 'CEO & Co-founder',
    /**
     * His own site and profiles. Without these, this Person node was a second,
     * unlinked "Ibrahim Shareef" beside the one shareefi.co defines
     * (https://shareefi.co/#person), and engines had nothing joining the two.
     */
    sameAs: [
      'https://shareefi.co',
      'https://shareefi.co/about',
      'https://www.linkedin.com/in/shareefibrahim/',
      'https://github.com/ibrahimshareef96-sys',
      'https://www.youtube.com/@shareefico',
    ],
  },
  cofounder: {
    name: 'Bisma Aslam',
    jobTitle: 'Head of Design & Co-founder',
  },
  /**
   * Dubai-based; the footer, hero and FAQ name the UAE and Sweden. Expressed as
   * areaServed, which must agree with that visible copy.
   */
  areaServed: ['Dubai', 'United Arab Emirates', 'Sweden', 'GCC', 'Worldwide'],
} as const;

/** Topics the org demonstrably knows about — feeds Organization.knowsAbout (entity understanding for Google + LLMs). */
export const KNOWS_ABOUT: readonly string[] = [
  'Brand strategy',
  'Brand identity design',
  'Creative direction',
  'UI/UX design',
  'Conversion-focused web design',
  'Web application development',
  'Search engine optimization',
  'Generative engine optimization',
  'AI visibility',
  'Content marketing',
  'Social media marketing',
  'Web hosting',
  'AI automation',
  'Agentic AI systems',
];

export interface ServiceDef {
  name: string;
  serviceType: string;
  description: string;
}

/** Keyword-bearing service taxonomy. Powers Service JSON-LD + the FAQ + (future) per-service pages. */
export const SERVICES: readonly ServiceDef[] = [
  {
    name: 'Brand Identity & Strategy',
    serviceType: 'Brand design',
    description:
      'Brand strategy, naming, positioning and a full visual identity system — the foundation every later asset compounds from.',
  },
  {
    name: 'Web Design & Development',
    serviceType: 'Web development',
    description:
      'Fast, clear websites built to turn a visit into a booked conversation. Design and engineering shipped as one system.',
  },
  {
    name: 'Content & Social Media Marketing',
    serviceType: 'Content marketing',
    description:
      'A content engine that ships every week in your voice — planned, produced and posted across the channels your buyers use.',
  },
  {
    name: 'SEO',
    serviceType: 'Search engine optimization',
    description:
      'We help the right buyers find you in search — with the structure, content and technical signals engines reward.',
  },
  {
    name: 'AI Visibility (GEO)',
    serviceType: 'Generative engine optimization',
    description:
      'We work to get your brand named when buyers ask ChatGPT, Claude and Gemini who to hire — and we track it.',
  },
  {
    name: 'Web Hosting & Infrastructure',
    serviceType: 'Web hosting',
    description:
      'We host and run what we build — one team owns your site from first idea to live, stable and maintained.',
  },
  {
    name: 'AI & Agentic Automation',
    serviceType: 'AI automation',
    description:
      'Agentic automation engines that run your operations — lead capture, content and reporting — with a human in control.',
  },
];

/** Resolve a path to an absolute URL on the canonical host. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// ────────────────────────────────────────────────────────────
// JSON-LD entity graph
// ────────────────────────────────────────────────────────────

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
/**
 * Ibrahim's canonical Person node is the one his own site defines. Reusing that
 * @id (instead of a separate /#founder node joined only by sameAs) means both
 * sites describe ONE Ibrahim Shareef, and shareefi.co already names this same
 * @id as founder of this Organization.
 */
const FOUNDER_ID = 'https://shareefi.co/#person';
const COFOUNDER_ID = `${SITE_URL}/#cofounder`;

type JsonLd = Record<string, unknown>;

/** The Organization node — the studio's stable identity, referenced by @id everywhere else. */
export function organizationNode(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: BUSINESS.logo,
    },
    image: `${SITE_URL}/opengraph-image`,
    description:
      'Itqan Studio is a Dubai-based design and AI agency. One partner for brand, websites that convert, content and social media, SEO, AI visibility (GEO), hosting and agentic automation — built and run by the same senior team. Co-founded by Ibrahim Shareef (CEO) and Bisma Aslam (Head of Design).',
    slogan: SITE_TAGLINE,
    email: BUSINESS.email,
    foundingLocation: {
      '@type': 'Place',
      name: 'Dubai, United Arab Emirates',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: BUSINESS.areaServed,
    knowsAbout: KNOWS_ABOUT,
    sameAs: BUSINESS.sameAs,
    founder: [{ '@id': FOUNDER_ID }, { '@id': COFOUNDER_ID }],
    contactPoint: {
      '@type': 'ContactPoint',
      email: BUSINESS.email,
      contactType: 'sales',
      areaServed: BUSINESS.areaServed,
      // Matches the visible copy: "work in English, Swedish and Arabic" (ServiceFAQ, WhoFor, contact).
      availableLanguage: ['English', 'Arabic', 'Swedish'],
    },
    makesOffer: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        serviceType: s.serviceType,
      },
    })),
  };
}

/** The WebSite node. No SearchAction — the site has no on-site search endpoint. */
export function websiteNode(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      'Dubai design and AI agency — brand, websites, content, SEO, AI visibility (GEO), hosting and automation from one senior team.',
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

/**
 * The founder Person node — E-E-A-T signal, referenced by Organization.founder.
 * Its @id and url are shareefi.co's, so one @id carries one url on both sites.
 */
export function founderNode(): JsonLd {
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: BUSINESS.founder.name,
    jobTitle: BUSINESS.founder.jobTitle,
    worksFor: { '@id': ORG_ID },
    url: 'https://shareefi.co',
    image: absoluteUrl('/images/team/ibrahim-shareef.png'),
    sameAs: BUSINESS.founder.sameAs,
  };
}

/** The co-founder Person node — second founder entity, referenced by Organization.founder. */
export function cofounderNode(): JsonLd {
  return {
    '@type': 'Person',
    '@id': COFOUNDER_ID,
    name: BUSINESS.cofounder.name,
    jobTitle: BUSINESS.cofounder.jobTitle,
    worksFor: { '@id': ORG_ID },
    url: `${SITE_URL}/about`,
    // The About team-card headshot (team.ts).
    image: absoluteUrl('/images/team/bisma-aslam.png'),
  };
}

/** Site-wide graph injected on every page (root layout): Organization + WebSite + both founder Persons. */
export function siteGraphLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode(), founderNode(), cofounderNode()],
  };
}

/** Discrete Service nodes (services page), each provided by the Organization. */
export function servicesGraphLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': SERVICES.map((s) => ({
      '@type': 'Service',
      name: s.name,
      serviceType: s.serviceType,
      description: s.description,
      provider: { '@id': ORG_ID },
      areaServed: BUSINESS.areaServed,
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList — still earns rich results; clarifies site structure for Google + LLMs. */
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

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage — Google deprecated FAQ rich results (May 2026) but still PARSES this
 * schema to understand the page, and it remains a strong GEO/LLM-citation signal.
 * We ship it for understanding + AI answers, not for a SERP snippet.
 */
export function faqLd(items: readonly FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface WorkItem {
  id: string;
  title: string;
}

/** The /work index as a CollectionPage with an ItemList of case studies. */
export function workCollectionLd(items: readonly WorkItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Our Work — Itqan Studio',
    description:
      'Selected brand, web, product and AI-automation case studies by Itqan Studio, a Dubai design and AI agency.',
    url: absoluteUrl('/work'),
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/work/${item.id}`),
        name: item.title,
      })),
    },
  };
}

/** A case study as a CreativeWork, authored + published by the Organization. */
export function caseStudyLd(cs: CaseStudy): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${cs.title} — ${cs.scope ?? cs.subtitle}`,
    headline: cs.title,
    description: cs.outcomeMetric ?? cs.result.slice(0, 200),
    url: absoluteUrl(`/work/${cs.id}`),
    image: absoluteUrl(cs.coverImage),
    about: cs.industry,
    keywords: cs.services.join(', '),
    inLanguage: 'en',
    creator: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
