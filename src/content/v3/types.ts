/**
 * Copy shape for the v3 site. English and Arabic implement the same type, so a
 * missing Arabic string is a type error instead of a blank on the page.
 *
 * A `Heading` is [before, highlighted, after]: the middle part renders in the
 * dusk gradient. One highlighted phrase per view (brand rule).
 */
export type Lang = 'en' | 'ar';

export type Heading = readonly [string, string, string?];

export interface Industry {
  key: 'manufacturing' | 'retail' | 'fnb';
  icon: 'buildings' | 'store' | 'coffee';
  focus: boolean;
  title: string;
  sub: string;
  items: readonly string[];
  first: string;
}

export interface RunStep {
  time: string;
  verb: string;
  text: string;
  /** The last step of a run is the hand-off to a person. */
  waits?: boolean;
}

export interface Run {
  key: Industry['key'];
  tab: string;
  title: string;
  steps: readonly RunStep[];
}

export interface Tile {
  icon: string;
  title: string;
  body: string;
}

export interface Step {
  n: string;
  title: string;
  body: string;
  meta: string;
}

export interface Stat {
  value: string;
  label: string;
  gradient?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

export interface CaseSummary {
  slug: 'millow' | 'nexilink';
  kicker: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  stats: readonly Stat[];
  quote?: { text: string; by: string };
  external?: { href: string; label: string };
}

export interface CaseDetail {
  slug: CaseSummary['slug'];
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: Heading;
  lead: string;
  facts: readonly { label: string; value: string }[];
  heroImage: string;
  heroAlt: string;
  briefTitle: string;
  brief: readonly string[];
  didTitle: string;
  did: readonly string[];
  gallery: readonly { src: string; alt: string }[];
  resultTitle: string;
  stats: readonly Stat[];
  quote?: { text: string; by: string };
  whyTitle: string;
  why: string;
  external?: { href: string; label: string };
}

export interface SiteDict {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  meta: { title: string; description: string };
  nav: {
    home: string;
    links: readonly { href: string; label: string }[];
    cta: string;
    menu: string;
    close: string;
    switchTo: string;
    switchLabel: string;
    skip: string;
  };
  hero: {
    kicker: string;
    title: Heading;
    lead: string;
    primary: string;
    secondary: string;
    meta: readonly string[];
    hint: string;
    canvasLabel: string;
  };
  strip: { label: string; items: readonly string[] };
  industries: { kicker: string; title: Heading; lead: string; focus: string; items: readonly Industry[] };
  run: {
    kicker: string;
    title: Heading;
    lead: string;
    note: string;
    replay: string;
    waiting: string;
    runs: readonly Run[];
  };
  build: { kicker: string; title: Heading; tiles: readonly Tile[] };
  security: {
    kicker: string;
    title: Heading;
    lead: string;
    flow: {
      systems: { title: string; chips: readonly string[] };
      core: { title: string; chips: readonly string[]; note: string };
      people: { title: string; chips: readonly string[] };
      label: string;
    };
    controls: readonly Tile[];
    review: string;
    reviewCta: string;
  };
  how: { kicker: string; title: Heading; steps: readonly Step[] };
  work: {
    kicker: string;
    title: Heading;
    lead: string;
    read: string;
    cases: readonly CaseSummary[];
    inHouse: { label: string; text: string };
    alsoLabel: string;
    also: readonly { name: string; note?: string }[];
  };
  faq: { kicker: string; title: Heading; items: readonly Faq[] };
  company: {
    kicker: string;
    title: Heading;
    portraitAlt: string;
    quote: string;
    quoteBy: string;
    people: readonly { name: string; role: string }[];
    offices: readonly { city: string; note: string }[];
  };
  cta: { title: Heading; lead: string; button: string; or: string };
  footer: {
    line: string;
    cols: readonly { title: string; links: readonly { href: string; label: string; external?: boolean }[] }[];
    legal: string;
    rights: string;
  };
  cases: Record<CaseSummary['slug'], CaseDetail>;
  caseNav: { back: string; next: string; cta: string };
}
