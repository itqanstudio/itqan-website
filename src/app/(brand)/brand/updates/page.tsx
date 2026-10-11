import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { BRAND_UPDATES } from '@/data/brand-spec';
import { PageHead, Section } from '@/components/portal/primitives';

export const metadata: Metadata = portalMetadata({
  title: 'Brand updates',
  description: 'What changed in the Itqan brand system, and when.',
  path: '/brand/updates',
});

export default function UpdatesPage() {
  return (
    <>
      <PageHead kicker="Resources" title="Brand updates" lead="Every change to the brand system, newest first. Anything not listed here has not changed." />
      <Section title="Log">
        <ol className="pt-log">
          {BRAND_UPDATES.map((u) => (
            <li key={u.date + u.title}>
              <time>{u.date}</time>
              <div>
                <b>{u.title}</b>
                <p>{u.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
