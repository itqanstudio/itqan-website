import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Composition',
  description: 'Dark grounds, cell-ruled grids and one highlight per view.',
  path: '/brand/composition',
});

export default function CompositionPage() {
  return (
    <>
      <PageHead
        kicker="Expression"
        title={<Rich value={['Ruled cells, ', 'one light.']} />}
        lead="Layouts are built from cells divided by one-pixel lines, on ink. Light enters from the bottom-left corner, the same corner the symbol grows from."
      />
      <Section title="A section, built the Itqan way">
        <div className="pt-stage glow" style={{ placeItems: 'start', alignContent: 'start', gap: 18, padding: 'clamp(24px, 4vw, 48px)' }}>
          <span className="k">
            <b>Security</b>
          </span>
          <span className="ts-h2" style={{ maxWidth: '16ch' }}>
            Your data stays <span className="g">in your account.</span>
          </span>
          <div className="pt-cards" style={{ width: '100%' }}>
            {['Your cloud account', 'Your region', 'A person approves'].map((t) => (
              <div key={t}>
                <h3>{t}</h3>
                <p>One fact per cell, in one or two plain sentences.</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section title="Rules">
        <Rules
          items={[
            { title: 'Kicker, heading, lead', body: 'Every section opens with a mono kicker in rose, a heading with one highlighted phrase, and an optional lead in Mute.' },
            { title: 'Cells, not cards', body: 'Content sits in cells separated by 1 px Line rules. Corners are square; radius is for buttons only, 6 px.' },
            { title: 'Light from one corner', body: 'The rose glow rises from the bottom-left. Never a centred spotlight, never two glows on one screen.' },
            { title: 'Measure', body: '1240 px content width on the web, text columns no wider than 72 characters.' },
            { title: 'Logical layout', body: 'Arabic mirrors the whole layout from right to left. The symbol is the one thing that never flips.' },
            { title: 'Room', body: 'Sections get 72 to 140 px of vertical space. Crowding is the first sign something is off-brand.' },
          ]}
        />
      </Section>
    </>
  );
}
