import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { TYPE_ROLES } from '@/data/brand-spec';
import { PageHead, Section } from '@/components/portal/primitives';

export const metadata: Metadata = portalMetadata({
  title: 'Specimens',
  description: 'Live specimens of every role in the type scale.',
  path: '/brand/typography/specimens',
});

export default function SpecimensPage() {
  return (
    <>
      <PageHead kicker="Identity · Typography" title="Specimens" lead="Every role in the scale, set live in the fonts the site uses. Sizes are ranges because headings scale with the screen." />
      <Section title="The scale">
        <div className="ts">
          {TYPE_ROLES.map((r) => (
            <div key={r.role}>
              <div className="meta">
                <b>{r.role}</b>
                <span>{r.family}</span>
                <span>{r.spec}</span>
              </div>
              <p className={r.className} lang={r.role === 'Arabic' ? 'ar' : undefined}>
                {r.sample}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Characters">
        <div className="ts">
          <div>
            <div className="meta">
              <b>Geist 600</b>
            </div>
            <p className="pt-glyphs">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
          </div>
          <div>
            <div className="meta">
              <b>Geist Mono 400</b>
            </div>
            <p className="pt-glyphs" style={{ fontFamily: 'var(--mono)', fontWeight: 400, fontSize: 'clamp(20px, 3vw, 32px)' }}>
              0123456789 $ € £ % · AGENT REGION MODEL
            </p>
          </div>
          <div>
            <div className="meta">
              <b>Readex Pro 600</b>
            </div>
            <p className="pt-glyphs ts-arabic" lang="ar">
              أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
