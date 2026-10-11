import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { COPY_LIBRARY } from '@/data/brand-spec';
import { CopyBlock, PageHead, Section } from '@/components/portal/primitives';

export const metadata: Metadata = portalMetadata({
  title: 'Copy library',
  description: 'Approved lines: the line, boilerplate, descriptions, Arabic.',
  path: '/brand/voice/library',
});

export default function CopyLibraryPage() {
  return (
    <>
      <PageHead kicker="Expression · Voice" title="Copy library" lead="Approved lines to copy as they are. If you need a version that is not here, write to ibrahim@itqanstudio.com rather than adapting one." />
      <Section title="Lines">
        <div>
          {COPY_LIBRARY.map((item) => (
            <CopyBlock key={item.label} item={item} />
          ))}
        </div>
      </Section>
    </>
  );
}
