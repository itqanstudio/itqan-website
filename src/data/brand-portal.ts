/**
 * Portal information architecture, Itqan brand v3.
 *
 * Modelled on brand.uber.com (a Frontify STYLEGUIDE): a three-level tree —
 * CATEGORY → section → page — where every topic owns a URL instead of being an
 * anchor in one long scroll. The sidebar, the search index and the sitemap all
 * derive from this one structure, so they can never disagree.
 *
 * Structurally identical to the Shareefico portal in shareefico-website. The
 * two differ only in this file (the tree and the chrome) and in the token
 * bindings under `.brand-portal` in globals.css.
 */

export interface PortalPage {
  href: string;
  label: string;
  /** One line describing the page — used by search and by section indexes. */
  summary: string;
  children?: PortalPage[];
}

export interface PortalCategory {
  label: string;
  items: PortalPage[];
}

/**
 * Chrome shown in the portal top bar. The one place the two portals diverge.
 *
 * The mark is named by SLUG, not by path. The asset pipeline reuses an existing
 * public/ URL whenever the bytes already ship with the site, so a hardcoded
 * /brand/... path silently 404s the moment a file is deduped — which is exactly
 * what happened to this mark. The manifest is the only thing that knows where
 * an asset actually lives.
 */
export const PORTAL_BRAND = {
  brand: 'itqan-studio',
  markSlug: 'itqan-symbol-dusk',
  siteUrl: 'https://itqanstudio.com',
  siteLabel: 'itqanstudio.com',
} as const;

export const PORTAL_NAV: PortalCategory[] = [
  {
    label: 'Foundations',
    items: [
      { href: '/brand', label: 'Overview', summary: 'What the Itqan brand is, and how to use this portal.' },
      { href: '/brand/story', label: 'Story & principles', summary: 'What itqan means, and the idea behind the signal i.' },
      { href: '/brand/positioning', label: 'Positioning', summary: 'Who Itqan builds AI for, and the line we say it in.' },
    ],
  },
  {
    label: 'Identity',
    items: [
      {
        href: '/brand/logo',
        label: 'Logo',
        summary: 'The signal i, the wordmark and the lockups: which version goes where.',
        children: [
          { href: '/brand/logo/library', label: 'Logo library', summary: 'Every approved mark, downloadable in each format.' },
          { href: '/brand/logo/clear-space', label: 'Clear space & sizing', summary: 'Minimum sizes and the space the mark needs.' },
          { href: '/brand/logo/misuse', label: 'Misuse', summary: 'The things never to do to the mark.' },
        ],
      },
      {
        href: '/brand/colour',
        label: 'Colour',
        summary: 'Ink and bone, Itqan Rose, and the dusk gradient.',
        children: [
          { href: '/brand/colour/pairings', label: 'Pairings & contrast', summary: 'Approved combinations with measured contrast, and the banned ones.' },
        ],
      },
      {
        href: '/brand/typography',
        label: 'Typography',
        summary: 'Geist for Latin, Readex Pro for Arabic, Geist Mono for data.',
        children: [
          { href: '/brand/typography/specimens', label: 'Specimens', summary: 'Live specimens of every role in the scale.' },
        ],
      },
    ],
  },
  {
    label: 'Expression',
    items: [
      { href: '/brand/composition', label: 'Composition', summary: 'Dark grounds, cell-ruled grids and one highlight per view.' },
      { href: '/brand/imagery', label: 'Imagery', summary: 'Rose gel light, pixel bokeh, and the pixel icon set.' },
      { href: '/brand/motion', label: 'Motion', summary: 'How things move, and the specs that keep it consistent.' },
      {
        href: '/brand/voice',
        label: 'Voice',
        summary: 'Plain sentences with a fact in each. How Itqan writes.',
        children: [
          { href: '/brand/voice/library', label: 'Copy library', summary: 'Approved lines: the line, boilerplate, descriptions, Arabic.' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/brand/assets', label: 'Asset library', summary: 'Every downloadable asset, filterable by type and format.' },
      { href: '/brand/assets/stickers', label: 'Stickers & merch', summary: 'The sticker programme and print-ready sheets.' },
      { href: '/brand/assets/signatures', label: 'Email signatures', summary: 'Hosted signature templates for the team.' },
      { href: '/brand/press', label: 'Press & media', summary: 'Boilerplate, logos and how to reach us.' },
      { href: '/brand/updates', label: 'Brand updates', summary: 'What changed in the brand system, and when.' },
    ],
  },
];

/** Flattened, in sidebar order — the canonical page list. */
export const PORTAL_PAGES: PortalPage[] = PORTAL_NAV.flatMap((c) =>
  c.items.flatMap((p) => [p, ...(p.children ?? [])]),
);

export function portalPage(href: string): PortalPage | undefined {
  return PORTAL_PAGES.find((p) => p.href === href);
}

export function portalCategoryOf(href: string): string | undefined {
  return PORTAL_NAV.find((c) =>
    c.items.some((p) => p.href === href || p.children?.some((k) => k.href === href)),
  )?.label;
}
