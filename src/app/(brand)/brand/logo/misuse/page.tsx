import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Symbol } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Misuse',
  description: 'The things never to do to the symbol and the wordmark.',
  path: '/brand/logo/misuse',
});

function Wrong({ caption, style, tone = 'dusk' }: { caption: string; style: React.CSSProperties; tone?: 'dusk' | 'bone' }) {
  return (
    <figure className="pt-stage ink" style={{ minHeight: 220 }}>
      <span className="pt-sym" style={{ width: 90, ...style }}>
        <Symbol gid={`mis-${caption.replace(/\W+/g, '-')}`} tone={tone} />
      </span>
      <figcaption style={{ color: 'var(--err)' }}>✕ {caption}</figcaption>
    </figure>
  );
}

export default function MisusePage() {
  return (
    <>
      <PageHead
        kicker="Identity · Logo"
        title="Never do this"
        lead="The symbol is a letter. Changing its direction, its dot or its pixels changes what it says."
      />
      <Section title="Examples">
        <div className="pt-split">
          <Wrong caption="Mirrored, also not in Arabic" style={{ transform: 'scaleX(-1)' }} />
          <Wrong caption="Rotated" style={{ transform: 'rotate(-12deg)' }} />
          <Wrong caption="Blurred or glowing" style={{ filter: 'blur(2px) drop-shadow(0 0 12px #EF3A78)' }} />
          <Wrong caption="Stretched" style={{ transform: 'scaleX(1.5)' }} />
        </div>
      </Section>
      <Section title="The full list">
        <Rules
          items={[
            { title: 'Never mirror it', body: 'Not even in right-to-left layouts. The Arabic lockup moves the symbol to the right; it does not flip it.', kind: 'no' },
            { title: 'Never drop or recolour the dot', body: 'The dot is always Itqan Rose, except the all-ink cut on rose or dusk grounds.', kind: 'no' },
            { title: 'No blur, glow or soft edges', body: 'Modules are square and crisp at every size.', kind: 'no' },
            { title: 'No other gradients', body: 'Dusk only, running from the bottom-left corner outward.', kind: 'no' },
            { title: 'No stretching, rotating or outlining', body: 'Scale the whole thing evenly or not at all.', kind: 'no' },
            { title: 'No retyping the wordmark', body: 'Use the files. The i of the wordmark is drawn, not a font character.', kind: 'no' },
            { title: 'No busy grounds', body: 'Over photography, put the logo on a calm area or on an ink panel.', kind: 'no' },
            { title: 'No old marks', body: 'The plum arc, the falcon and the mauve wordmark are retired since 7 Oct 2026.', kind: 'no' },
          ]}
        />
      </Section>
    </>
  );
}
