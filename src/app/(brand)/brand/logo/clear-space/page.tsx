import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { SYMBOL_RECTS } from '@/lib/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Clear space and sizing',
  description: 'The grid behind the symbol, the space it needs and its smallest sizes.',
  path: '/brand/logo/clear-space',
});

/** The symbol on its 10 x 12 grid, with two modules of clear space drawn around it. */
function ConstructionGrid() {
  const pad = 2;
  const w = 10 + pad * 2;
  const h = 12 + pad * 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: 'min(100%, 340px)', height: 'auto' }} shapeRendering="crispEdges" role="img" aria-label="The symbol on its 10 by 12 module grid with two modules of clear space">
      <rect x={0} y={0} width={w} height={h} fill="rgba(239,58,120,0.08)" />
      <rect x={pad} y={pad} width={10} height={12} fill="#0B0A0D" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={pad + i} y1={pad} x2={pad + i} y2={pad + 12} stroke="#2A2630" strokeWidth={0.04} />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`h${i}`} x1={pad} y1={pad + i} x2={pad + 10} y2={pad + i} stroke="#2A2630" strokeWidth={0.04} />
      ))}
      {SYMBOL_RECTS.map(([x, y, rw], i) => (
        <rect key={`${x}-${y}`} x={pad + x + 0.06} y={pad + y + 0.06} width={rw - 0.12} height={0.88} fill={i === 0 ? '#EF3A78' : '#F89A5B'} />
      ))}
      <rect x={0.02} y={0.02} width={w - 0.04} height={h - 0.04} fill="none" stroke="#EF3A78" strokeWidth={0.06} strokeDasharray="0.3 0.2" />
    </svg>
  );
}

export default function ClearSpacePage() {
  return (
    <>
      <PageHead
        kicker="Identity · Logo"
        title="Clear space and sizing"
        lead="Everything about the symbol is measured in modules: one module is one tenth of the symbol’s width. The grid is 10 modules wide and 12 high, with 56 modules filled."
      />
      <Section title="Construction">
        <figure className="pt-stage ink">
          <ConstructionGrid />
          <figcaption>Dashed line · minimum clear space, two modules on every side</figcaption>
        </figure>
      </Section>
      <Section title="Rules">
        <Rules
          items={[
            { title: 'Clear space: two modules', body: 'Keep two modules of empty space around the symbol and the lockup on every side. No text, edges or other logos inside it.' },
            { title: 'Smallest symbol on screen: 24 px tall', body: 'Each module is then 2 px, so every edge stays crisp. Below that, use the app icon.' },
            { title: 'Smallest lockup on screen: 96 px wide', body: 'Below this the tittle on the wordmark stops reading as a square.' },
            { title: 'Smallest in print: 10 mm tall symbol', body: 'For business cards, stickers and labels.' },
            { title: 'Whole modules only', body: 'When scaling for pixel screens, pick a size where one module is a whole number of pixels.' },
            { title: 'The lockup gap', body: 'The space between the symbol and the wordmark is fixed at 0.3 of the type size. Do not tighten or loosen it.' },
          ]}
        />
      </Section>
    </>
  );
}
