import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Lockup, Rich, Symbol } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Logo',
  description: 'The signal i, the wordmark and the lockups: which version goes where.',
  path: '/brand/logo',
});

export default function LogoPage() {
  return (
    <>
      <PageHead
        kicker="Identity"
        title={<Rich value={['A letter, a signal, ', 'one pixel.']} />}
        lead="The Itqan logo has two parts: the symbol, 54 pixel modules on a 10 by 12 grid that forms the i of itqan, and the lowercase wordmark itqan with a square rose dot on its i. Together they make the lockup."
      />
      <Section title="The lockups">
        <div className="pt-split">
          <figure className="pt-stage glow">
            <span className="pt-lockup" style={{ color: 'var(--bone)' }}>
              <Lockup gid="lg-1" lang="en" />
            </span>
            <figcaption>Primary · dusk on ink</figcaption>
          </figure>
          <figure className="pt-stage bone">
            <span className="pt-lockup" style={{ color: 'var(--ink)' }}>
              <Lockup gid="lg-2" lang="en" />
            </span>
            <figcaption>Light · dusk on bone</figcaption>
          </figure>
          <figure className="pt-stage rose">
            <span className="pt-lockup" style={{ color: 'var(--ink)' }}>
              <Lockup gid="lg-3" lang="en" tone="ink-mono" />
            </span>
            <figcaption>Signal · ink on rose</figcaption>
          </figure>
          <figure className="pt-stage dusk">
            <span className="pt-lockup" style={{ color: 'var(--ink)' }}>
              <Lockup gid="lg-4" lang="en" tone="ink-mono" />
            </span>
            <figcaption>On the dusk gradient · ink only</figcaption>
          </figure>
          <figure className="pt-stage ink" dir="rtl" lang="ar">
            <span className="pt-lockup" style={{ color: 'var(--bone)' }}>
              <Lockup gid="lg-5" lang="ar" />
            </span>
            <figcaption lang="en" dir="ltr">
              Arabic lockup · symbol on the right
            </figcaption>
          </figure>
          <figure className="pt-stage ink">
            <span className="pt-sym" style={{ width: 'clamp(70px, 10vw, 110px)' }}>
              <Symbol gid="lg-6" tone="bone" title="The Itqan symbol in bone with a rose dot" />
            </span>
            <figcaption>Single colour · bone, rose dot</figcaption>
          </figure>
        </div>
      </Section>
      <Section title="Which one to use">
        <Rules
          items={[
            { title: 'Dusk on ink', body: 'The default, everywhere the ground is dark: the site, slides, social, signage.' },
            { title: 'Dusk on bone or white', body: 'Documents, proposals, invoices and print on light paper.' },
            { title: 'Ink on rose or dusk', body: 'When the ground itself is brand colour. The dot goes ink too, or it disappears.' },
            { title: 'The symbol alone', body: 'Where the name is already present or space is square: app icons, avatars, favicons, merch.' },
            { title: 'Arabic lockup', body: 'إتقان with the symbol on its right, for Arabic layouts. The symbol is not mirrored.' },
            { title: 'Bone with a rose dot', body: 'One-colour reproduction on dark: embroidery, engraving, foil.' },
          ]}
        />
      </Section>
    </>
  );
}
