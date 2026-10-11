import type { Metadata } from 'next';
import Link from 'next/link';
import { portalMetadata } from '@/lib/page-metadata';
import { PORTAL_NAV } from '@/data/brand-portal';
import { PageHead, Section } from '@/components/portal/primitives';
import { Lockup, Rich, Symbol } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Itqan brand',
  description: 'The Itqan brand system, v3: the signal i, colour, type, motion, voice and downloadable assets.',
  path: '/brand',
  absoluteTitle: true,
});

export default function BrandOverview() {
  return (
    <>
      <PageHead
        kicker="Brand v3 · October 2026"
        title={<Rich value={['An i that ', 'sends a signal.']} />}
        lead="This is the Itqan brand as anyone may use it: the symbol, the colours, the type, how things move, how we write, and every file you can download. If you are making something with our name on it, start here."
      />
      <div className="pt-split" style={{ marginBottom: 'clamp(40px, 6vw, 72px)' }}>
        <figure className="pt-stage glow">
          <span className="pt-sym">
            <Symbol gid="ov-sym" title="The Itqan symbol" />
          </span>
          <figcaption>The signal i · dusk on ink</figcaption>
        </figure>
        <figure className="pt-stage bone">
          <span className="pt-lockup" style={{ color: 'var(--ink)' }}>
            <Lockup gid="ov-lock" lang="en" />
          </span>
          <figcaption>Lockup · dusk on bone</figcaption>
        </figure>
      </div>
      {PORTAL_NAV.map((cat) => (
        <Section key={cat.label} title={cat.label}>
          <div className="pt-cards">
            {cat.items
              .filter((p) => p.href !== '/brand')
              .map((p) => (
                <Link key={p.href} href={p.href}>
                  <h3>{p.label}</h3>
                  <p>{p.summary}</p>
                </Link>
              ))}
          </div>
        </Section>
      ))}
      <Section title="Questions">
        <p>
          Something missing, or a use this portal does not cover? Write to{' '}
          <a href="mailto:ibrahim@itqanstudio.com?subject=Brand%20question">ibrahim@itqanstudio.com</a> and say where the mark will appear.
        </p>
      </Section>
    </>
  );
}
