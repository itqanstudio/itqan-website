import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Typography',
  description: 'Geist for Latin, Readex Pro for Arabic, Geist Mono for data.',
  path: '/brand/typography',
});

export default function TypographyPage() {
  return (
    <>
      <PageHead
        kicker="Identity"
        title={<Rich value={['Geist carries, ', 'Readex speaks Arabic.']} />}
        lead="Three families, each with one job. All three are free under the SIL Open Font License, so every partner and printer can use them."
      />
      <Section title="The families">
        <div className="pt-split">
          <div className="pt-stage ink" style={{ placeItems: 'start', alignContent: 'start', gap: 14 }}>
            <span className="pt-cap">Display and text</span>
            <span className="pt-glyphs">Geist</span>
            <span style={{ color: 'var(--mute)' }}>Headings at 600 with −0.055em tracking. Text at 400, 16 to 18 px.</span>
          </div>
          <div className="pt-stage ink" style={{ placeItems: 'start', alignContent: 'start', gap: 14 }}>
            <span className="pt-cap">Labels and data</span>
            <span className="pt-glyphs" style={{ fontFamily: 'var(--mono)', fontWeight: 400 }}>
              Geist Mono
            </span>
            <span style={{ color: 'var(--mute)' }}>Labels, prices, regions, model names. Uppercase, 0.08 to 0.14em tracking.</span>
          </div>
          <div className="pt-stage ink" style={{ placeItems: 'start', alignContent: 'start', gap: 14 }} lang="ar" dir="rtl">
            <span className="pt-cap" lang="en" dir="ltr">
              Arabic
            </span>
            <span className="pt-glyphs ts-arabic">ريدكس برو</span>
            <span style={{ color: 'var(--mute)' }} lang="en" dir="ltr">
              Readex Pro at 400 and 600, set at the same optical size as the Latin beside it.
            </span>
          </div>
        </div>
      </Section>
      <Section title="Rules">
        <Rules
          items={[
            { title: 'Tight display, open text', body: 'Display at −0.045 to −0.055em. Body text at normal tracking and 1.6 line height.' },
            { title: 'Arabic is never letter-spaced', body: 'Tracking breaks the joins. Arabic lines get 1.25 line height in headings.' },
            { title: 'One highlight per view', body: 'The gradient highlight works the same in both scripts.' },
            { title: 'Sentence case', body: 'Headings and buttons in sentence case. Uppercase only for mono labels.' },
          ]}
        />
      </Section>
      <Section title="Get the fonts">
        <p>
          Geist and Geist Mono: <a href="https://vercel.com/font">vercel.com/font</a> or Google Fonts. Readex Pro:{' '}
          <a href="https://fonts.google.com/specimen/Readex+Pro">fonts.google.com/specimen/Readex+Pro</a>.
        </p>
      </Section>
    </>
  );
}
