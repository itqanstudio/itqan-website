import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { AssetGrid, PageHead, Section } from '@/components/portal/primitives';
import { Bundles } from '@/components/portal/Bundles';

export const metadata: Metadata = portalMetadata({
  title: 'Logo library',
  description: 'Every approved Itqan logo file, ready to download.',
  path: '/brand/logo/library',
});

export default function LogoLibraryPage() {
  const logos = assetsFor('itqan-studio', ['logo']);
  return (
    <>
      <PageHead
        kicker="Identity · Logo"
        title="Logo library"
        lead="Every approved logo file. SVG for screens and print, PNG where a tool needs a picture. Pick the cut that matches your background: dusk or bone on dark grounds, ink on light ones."
      />
      <Section title="Download everything">
        <Bundles bundles={bundlesFor('itqan-studio', ['logo'])} />
      </Section>
      <Section title="Files">
        <AssetGrid assets={logos} />
      </Section>
    </>
  );
}
