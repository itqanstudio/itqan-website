import type { Metadata } from 'next';
import { ALL_ASSETS } from '@/data/brand-library';
import { PORTAL_PAGES } from '@/data/brand-portal';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Brand updates',
  description: 'What changed in the Itqan Studio brand system, and when.',
};

interface Entry {
  date: string;
  title: string;
  body: string;
  kind: 'added' | 'changed' | 'fixed';
}

/**
 * A changelog, not a blog. Every entry answers one question: if I saved an
 * asset or memorised a rule before this date, is it still right?
 */
const ENTRIES: Entry[] = [
  {
    date: '2026-08-13',
    kind: 'added',
    title: 'The brand portal',
    body: `This site. ${PORTAL_PAGES.length} pages and ${ALL_ASSETS.filter((a) => a.src).length} downloadable assets, generated from the live design system rather than written by hand. It replaces the single scrolling brands page, which could not deep-link to a specific rule.`,
  },
  {
    date: '2026-08-13',
    kind: 'fixed',
    title: 'Type specimens were rendering in the wrong face',
    body: 'The old brands page set its specimens with var(--font-manrope) and var(--font-playfair) — two custom properties that are not defined anywhere in the codebase. An undefined var() makes the whole font-family declaration invalid at computed-value time, so the property was inherited instead: the Playfair Display specimens were rendering in Manrope. They now use the real variables, --font-sans and --font-serif.',
  },
  {
    date: '2026-08-13',
    kind: 'changed',
    title: 'Contrast rules are now measured, not asserted',
    body: 'Every approved pairing carries a real WCAG ratio. Two are now formally banned: mauve on cream and cream on mauve, both at 2.11:1. This is the numeric backing for the dual-accent rule that was previously stated without evidence.',
  },
  {
    date: '2026-08-13',
    kind: 'changed',
    title: 'Shareefico moved out',
    body: 'The Shareefico brand system used to live on this domain, which meant it was rendered in Itqan’s fonts and could not show its own type accurately. It now has its own portal at brands.shareefi.co, built from the Shareefico codebase.',
  },
];

const KIND = {
  added: { label: 'Added', colour: '#cca4c2' },
  changed: { label: 'Changed', colour: '#d1c2a5' },
  fixed: { label: 'Fixed', colour: '#8fc7a8' },
} as const;

export default function UpdatesPage() {
  return (
    <PortalPageBody href="/brand/updates"
      heroImage="/images/portfolio/mutqin/journey.webp"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Brand systems drift quietly. This is the record of what moved, so an
          asset saved six months ago can be checked against what is true now.
        </p>
      </Section>

      <ol className="space-y-8">
        {ENTRIES.map((e) => (
          <li key={`${e.date}-${e.title}`} className="border-l border-[var(--color-border)] pl-6">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <time
                dateTime={e.date}
                className="font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--color-muted)]"
              >
                {e.date}
              </time>
              <span
                className="rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]"
                style={{ color: KIND[e.kind].colour, border: `1px solid ${KIND[e.kind].colour}` }}
              >
                {KIND[e.kind].label}
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold">
              {e.title}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
              {e.body}
            </p>
          </li>
        ))}
      </ol>

      <Callout tone="note" title="Adding an entry">
        Log anything that would make a previously-correct decision wrong: a
        retired asset, a changed hex, a new rule. Cosmetic edits to this portal
        do not belong here.
      </Callout>
    </PortalPageBody>
  );
}
