import type { Metadata } from 'next';
import Link from 'next/link';
import { portalMetadata } from '@/lib/page-metadata';
import { assetsFor, bundlesFor, categoriesFor } from '@/data/brand-library';
import { AssetGrid, PageHead, Section } from '@/components/portal/primitives';
import { Bundles } from '@/components/portal/Bundles';

export const metadata: Metadata = portalMetadata({
  title: 'Asset library',
  description: 'Every downloadable Itqan brand file: logos, stickers and the signature kit.',
  path: '/brand/assets',
});

const TITLES: Record<string, string> = { logo: 'Logos', sticker: 'Stickers', signature: 'Signature kit' };

export default function AssetsPage({ searchParams }: { searchParams: { type?: string } }) {
  const categories = categoriesFor('itqan-studio');
  const active = searchParams.type && categories.includes(searchParams.type) ? searchParams.type : undefined;
  const shown = active ? [active] : categories;
  return (
    <>
      <PageHead
        kicker="Resources"
        title="Asset library"
        lead="Every file the brand ships, exactly as it is served. Download one file or a whole pack. Layered sources are available on request."
      />
      <Section title="Packs">
        <Bundles bundles={bundlesFor('itqan-studio')} />
      </Section>
      <nav className="pt-filter" aria-label="Filter by type" style={{ marginBottom: 32 }}>
        <Link href="/brand/assets" aria-current={!active ? 'true' : undefined}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c} href={`/brand/assets?type=${c}`} aria-current={active === c ? 'true' : undefined}>
            {TITLES[c] ?? c}
          </Link>
        ))}
      </nav>
      {shown.map((c) => (
        <Section key={c} title={TITLES[c] ?? c}>
          <AssetGrid assets={assetsFor('itqan-studio', [c])} />
        </Section>
      ))}
    </>
  );
}
