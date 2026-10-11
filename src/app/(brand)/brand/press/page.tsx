import type { Metadata } from 'next';
import Link from 'next/link';
import { portalMetadata } from '@/lib/page-metadata';
import { COPY_LIBRARY } from '@/data/brand-spec';
import { bundlesFor } from '@/data/brand-library';
import { CopyBlock, PageHead, Rules, Section } from '@/components/portal/primitives';
import { Bundles } from '@/components/portal/Bundles';

export const metadata: Metadata = portalMetadata({
  title: 'Press and media',
  description: 'Boilerplate, logos and how to reach Itqan.',
  path: '/brand/press',
});

const PRESS = COPY_LIBRARY.filter((c) => ['Short description', 'Boilerplate', 'Founders', 'Name'].includes(c.label));

export default function PressPage() {
  return (
    <>
      <PageHead
        kicker="Resources"
        title="Press and media"
        lead="Writing about Itqan, listing it as a partner, or putting the mark in a deck? Everything you need is on this page, with no form in the way."
      />
      <Section title="Contact">
        <p>
          Press, interviews, partnerships and asset questions: <a href="mailto:ibrahim@itqanstudio.com?subject=Press%20enquiry">ibrahim@itqanstudio.com</a>. Say where it will appear.
        </p>
      </Section>
      <Section title="Logos">
        <Bundles bundles={bundlesFor('itqan-studio', ['logo'])} />
        <p>
          Single files are in the <Link href="/brand/logo/library">logo library</Link>. Pick the cut that matches your background.
        </p>
      </Section>
      <Section title="Text">
        <div>
          {PRESS.map((item) => (
            <CopyBlock key={item.label} item={item} />
          ))}
        </div>
      </Section>
      <Section title="Use">
        <Rules
          items={[
            { title: 'Free to use', body: 'In editorial coverage, partner listings and event materials, without asking first.', kind: 'yes' },
            { title: 'Not for endorsement', body: 'Do not use the mark to suggest Itqan endorses a product, and do not use it in advertising.', kind: 'no' },
            { title: 'As supplied', body: 'Scale it, do not alter it. The rules on the logo pages apply to press use too.', kind: 'no' },
          ]}
        />
      </Section>
    </>
  );
}
