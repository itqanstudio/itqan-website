import type { Metadata } from 'next';
import { AssetLibrary } from '@/components/brand/AssetLibrary';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { Callout, PortalPageBody, RuleGrid, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Stickers & merch',
  description: 'The Itqan Studio sticker programme: marks, badges, contour cuts and print-ready specs.',
};

const assets = assetsFor('itqan-studio', ['sticker']);
const bundles = bundlesFor('itqan-studio', ['sticker']);

export default function StickersPage() {
  return (
    <PortalPageBody href="/brand/assets/stickers"
      heroImage="/images/portfolio/ITQAN-CRM-MB-MKP.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Stickers are the cheapest way a brand travels, and the fastest way a
          premium one gets cheapened. The set is deliberately small: the mark,
          the wordmark, the Arabic, and a handful of lines worth repeating.
        </p>
      </Section>

      <Section title="Print specs">
        <SpecTable
          columns={['Spec', 'Value', 'Why']}
          rows={[
            ['Bleed', '3mm', 'Standard for die-cut vinyl.'],
            ['Safe area', '3mm inside the cut line', 'Nothing important closer to the edge.'],
            ['Minimum size', '35mm', 'Below this the wordmark closes up.'],
            ['Colour', 'Cream on plum, or plum on cream', 'Never mauve as a fill with light type on it.'],
            ['Finish', 'Matte', 'Gloss reads cheap and blows out under a flash.'],
          ]}
        />
      </Section>

      <AssetLibrary assets={assets} bundles={bundles} categories={['sticker']} />

      <Callout tone="warning" title="Restraint is the brand">
        A sheet of twelve different stickers says startup. Three or four, well
        printed on good stock, says studio. If in doubt, print fewer designs on
        better material.
      </Callout>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Keep every sticker monochrome, matching the logo rules.' },
            { kind: 'do', text: 'Use the vector cuts for anything under 35mm or cut from vinyl.' },
            { kind: 'dont', text: 'Do not add slogans that are not in the copy library.' },
            { kind: 'dont', text: 'Do not mix in stock icons or emoji. The set is drawn.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
