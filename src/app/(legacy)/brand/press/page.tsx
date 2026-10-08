import type { Metadata } from 'next';
import { AssetLibrary } from '@/components/brand/AssetLibrary';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { CopyBlock } from '@/components/brand/CopyBlock';
import { Callout, PortalPageBody, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Press & media',
  description: 'Everything a journalist, client or partner needs: boilerplate, logos and how to get in touch.',
};

const logos = assetsFor('itqan-studio', ['logo']);
const logoBundles = bundlesFor('itqan-studio', ['logo']);

export default function PressPage() {
  return (
    <PortalPageBody href="/brand/press"
      heroImage="/images/team/ibrahim-shareef.png"
      heroAlt="Ibrahim Shareef, founder"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          If you are writing about Itqan Studio, listing it as a partner, or
          putting the mark in a deck, everything you need is on this page. No
          form, no gate, no waiting on a reply to get started.
        </p>
      </Section>

      <Section title="Contact">
        <SpecTable
          columns={['Reason', 'Where', 'Response']}
          rows={[
            ['Press and interviews', 'info@itqanstudio.com', 'Within two working days'],
            ['Partnership and co-marketing', 'info@itqanstudio.com', 'Subject line: Partnership'],
            ['Asset or usage questions', 'info@itqanstudio.com', 'Include where it will appear'],
          ]}
        />
        <a
          href="mailto:info@itqanstudio.com?subject=Press%20enquiry"
          className="mt-6 inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[0.875rem] font-semibold text-[#2f1c2c] transition-colors duration-150 hover:bg-[var(--color-accent-hover)]"
        >
          Email info@itqanstudio.com
        </a>
      </Section>

      <Section title="Use this copy verbatim">
        <div className="space-y-3">
          <CopyBlock
            label="Name"
            meta="How to refer to the studio"
            text="Itqan Studio — a brand and design studio working with founder-led companies."
          />
          <CopyBlock
            label="Boilerplate"
            meta="End of a press release"
            text="Itqan Studio is a brand and design studio named after the Arabic word for excellence. It works with founder-led companies to decide what a brand is for, then builds the identity, the system and the site that carry that decision into the market."
          />
        </div>
        <p className="mt-4 text-[0.875rem] text-[var(--color-text-secondary)]">
          Longer versions are in the{' '}
          <a href="/brand/voice/library" className="text-[var(--color-accent)] underline underline-offset-2">
            copy library
          </a>
          .
        </p>
      </Section>

      <Section title="Logos" intro="Cleared for editorial, partner listings and event materials.">
        <AssetLibrary assets={logos} bundles={logoBundles} categories={['logo']} />
      </Section>

      <Callout tone="info" title="Usage terms">
        These assets may be used in editorial coverage, partner listings and
        event materials without asking first. They may not be used to imply
        endorsement of a product, altered beyond scaling, or used in
        advertising. The rules on{' '}
        <a href="/brand/logo" className="text-[var(--color-accent)] underline underline-offset-2">
          Logo
        </a>{' '}
        apply to press use too — in particular, pick the cut that matches your
        background.
      </Callout>
    </PortalPageBody>
  );
}
