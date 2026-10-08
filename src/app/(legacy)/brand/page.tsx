import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PORTAL_NAV } from '@/data/brand-portal';
import { EntryCards } from '@/components/brand/EntryCards';
import { ALL_ASSETS, assetBySlug } from '@/data/brand-library';
import {
  Bleed,
  Callout,
  Figure,
  PortalPageBody,
  Prose,
  PullQuote,
  Section,
  Wide,
} from '@/components/brand/primitives';

export const metadata: Metadata = {
  /*
   * Absolute, not 'Overview'. A layout's title.template applies to CHILD
   * segments, not to the page in its own segment, so a bare title here would
   * fall through to the site-wide template.
   */
  title: { absolute: 'Itqan Studio Brand Portal' },
  description:
    'The Itqan Studio brand portal: logo, colour, typography, motion, voice and every downloadable asset.',
};

const shippable = ALL_ASSETS.filter((a) => a.src).length;
const mark = assetBySlug('itqan-studio', 'white-logo');

export default function BrandOverviewPage() {
  return (
    <PortalPageBody
      href="/brand"
      title="The Itqan Studio brand"
      lede="Itqan is the Arabic word for excellence — the kind that comes from doing a thing properly rather than quickly. This is the standard, written down."
      heroImage="/images/about/excellence.webp"
      heroAlt=""
    >
      <Section>
        <Prose>
          A brand portal usually exists so a team stops asking which blue is the
          real blue. This one has a second job: the studio is named after a
          standard, and a standard nobody can check is just a claim. So
          everything here is specific enough to be held to.
        </Prose>
        <Prose>
          Every colour carries a measured contrast ratio. Every asset comes
          straight from the working library rather than a list someone
          maintains by hand. If a page here disagrees with the product, the page
          is the bug.
        </Prose>
      </Section>

      {mark?.src && (
        <Bleed className="mb-24 md:mb-32">
          <div className="py-24 md:py-32" style={{ backgroundColor: '#2f1c2c' }}>
            <div className="portal-inset-block">
              <Image
                src={mark.src}
                alt="The Itqan Studio lockup"
                width={mark.width ?? 400}
                height={mark.height ?? 120}
                className="h-auto w-[min(420px,70%)]"
                priority
              />
            </div>
          </div>
        </Bleed>
      )}

      <Section title="Start here">
        <Wide>
          <EntryCards markSrc={mark?.src ?? ''} assetCount={shippable} />
        </Wide>
      </Section>

      <PullQuote attribution="The promise the whole brand is built to keep">
        Your brand has potential. We give it direction.
      </PullQuote>

      <Section title="The work this comes from">
        <Prose>
          None of this was designed in the abstract. The palette, the type scale
          and the motion rules were all settled while building real things for
          real clients, and they are documented here in the form they survived
          in.
        </Prose>
        <Figure
          src="/images/portfolio/mutqin/hero-landing.webp"
          alt="The Mutqin landing page, showing the plum ground with a single mauve accent"
          caption="Mutqin. The alternating dark and light rhythm, and exactly one accent element per view."
        />
      </Section>

      <Callout tone="tip" title="Looking for one thing">
        Search covers every page and every asset by name. Press{' '}
        <kbd className="rounded border border-[var(--color-border)] px-1 font-[family-name:var(--font-mono)] text-[0.75rem]">
          ⌘K
        </kbd>{' '}
        from anywhere in the portal.
      </Callout>

      <Section title="What is in here">
        <dl className="space-y-8">
          {PORTAL_NAV.map((cat) => (
            <div key={cat.label}>
              <dt className="t-eyebrow mb-2.5">{cat.label}</dt>
              <dd className="text-[0.9375rem] leading-[1.7] text-[var(--color-text-secondary)]">
                {cat.items.map((s) => s.label).join(' · ')}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </PortalPageBody>
  );
}
