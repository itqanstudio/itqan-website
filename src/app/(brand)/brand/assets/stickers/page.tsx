import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { AssetGrid, PageHead, Rules, Section } from '@/components/portal/primitives';
import { Bundles } from '@/components/portal/Bundles';

export const metadata: Metadata = portalMetadata({
  title: 'Stickers and merch',
  description: 'The v3 sticker set and how to print it.',
  path: '/brand/assets/stickers',
});

export default function StickersPage() {
  return (
    <>
      <PageHead
        kicker="Resources"
        title="Stickers and merch"
        lead="Die-cut stickers for laptops, packaging and events, from the symbol, the wordmark and the pixel icons. Transparent PNGs with a white border, ready for a die-cut printer."
      />
      <Section title="Download">
        <Bundles bundles={bundlesFor('itqan-studio', ['sticker'])} />
      </Section>
      <Section title="The set">
        <AssetGrid assets={assetsFor('itqan-studio', ['sticker'])} />
      </Section>
      <Section title="Printing">
        <Rules
          items={[
            { title: 'Size', body: 'At least 50 mm on the long side, so the symbol stays above the 10 mm print minimum.' },
            { title: 'Finish', body: 'Matte vinyl. Gloss turns the dusk gradient into a mirror under office lights.' },
            { title: 'Merch', body: 'The symbol in bone with a rose dot on ink fabric for embroidery; dusk on ink for print.' },
          ]}
        />
      </Section>
    </>
  );
}
