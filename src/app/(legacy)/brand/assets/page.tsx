import type { Metadata } from 'next';
import { AssetLibrary } from '@/components/brand/AssetLibrary';
import { assetsFor, bundlesFor, categoriesFor } from '@/data/brand-library';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Asset library',
  description:
    'Every downloadable Itqan Studio asset — logos, stickers, signatures and call backgrounds — filterable by type and format.',
};

const assets = assetsFor('itqan-studio');
const bundles = bundlesFor('itqan-studio');
const categories = categoriesFor('itqan-studio');

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <PortalPageBody href="/brand/assets"
      heroImage="/images/itqan-crm.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          {assets.filter((a) => a.src).length} files, generated straight from the
          working library — so this page cannot go stale relative to what
          actually exists. Click any tile to inspect it, then download the single
          file, or take a whole category as a zip.
        </p>
      </Section>

      <AssetLibrary assets={assets} bundles={bundles} categories={categories} initialQuery={q ?? ''} />

      <Callout tone="note" title="Need something that is not here">
        Source files, a format that is missing, or a one-off lockup for a
        specific placement: email info@itqanstudio.com rather than
        reconstructing it.
      </Callout>
    </PortalPageBody>
  );
}
