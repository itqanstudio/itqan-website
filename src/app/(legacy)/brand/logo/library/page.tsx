import type { Metadata } from 'next';
import { AssetLibrary } from '@/components/brand/AssetLibrary';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Logo library',
  description: 'Every approved Itqan Studio mark, downloadable in each format.',
};

const assets = assetsFor('itqan-studio', ['logo']);
const bundles = bundlesFor('itqan-studio', ['logo']);

export default function LogoLibraryPage() {
  return (
    <PortalPageBody href="/brand/logo/library"
      heroImage="/images/portfolio/ITQAN-CRM-MKP-MCBK2.png"
      heroAlt="Design tokens laid out"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          All vector. Each tile previews the mark on the background it was drawn
          for, so you can see immediately whether you have the right cut.
        </p>
      </Section>

      <AssetLibrary assets={assets} bundles={bundles} categories={['logo']} />

      <Callout tone="tip" title="Prefer the SVG">
        The SVG is the master. It stays sharp at any size and recolours cleanly
        when a medium demands it. Ask for a PNG only when a tool refuses
        vectors.
      </Callout>
    </PortalPageBody>
  );
}
