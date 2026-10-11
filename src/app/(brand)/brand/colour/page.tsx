import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { CORE_COLOURS, DUSK_COLOURS, GRADIENTS, UI_GREYS } from '@/data/brand-spec';
import { PageHead, Rules, Section, Swatches } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';
import { CopyButton } from '@/components/portal/CopyButton';

export const metadata: Metadata = portalMetadata({
  title: 'Colour',
  description: 'Ink and bone, Itqan Rose, and the dusk gradient.',
  path: '/brand/colour',
});

export default function ColourPage() {
  return (
    <>
      <PageHead
        kicker="Identity"
        title={<Rich value={['Ink and bone, ', 'lit at dusk.']} />}
        lead="Itqan Rose is the signal. The dusk gradient is the light: on the symbol, on one highlighted phrase per view, and as fields behind photography. Everything else stays ink and bone."
      />
      <Section title="Core">
        <Swatches items={CORE_COLOURS} />
      </Section>
      <Section title="The dusk run">
        <p>Five stops from the corner of the symbol outward. Use them as a gradient, not as separate flat colours in layouts.</p>
        <Swatches items={DUSK_COLOURS} />
      </Section>
      <Section title="Gradients">
        <div style={{ display: 'grid', gap: 22 }}>
          {GRADIENTS.map((g) => (
            <div key={g.name} className="pt-gradrow">
              <div className="pt-grad" style={{ background: g.css }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span>
                  <b>{g.name}</b> <span style={{ color: 'var(--mute)' }}>· {g.use}</span>
                </span>
                <CopyButton text={g.css} label="Copy CSS" />
              </div>
              <code>{g.css}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Interface greys">
        <Swatches items={UI_GREYS} />
      </Section>
      <Section title="Rules">
        <Rules
          items={[
            { title: 'Start dark', body: 'Pages, slides and covers start on ink. Bone is for documents and print.' },
            { title: 'One highlight per view', body: 'One phrase in the dusk gradient per screen or slide. The rest stays bone.' },
            { title: 'Rose is a signal, not a fill', body: 'Primary buttons, the dot, kickers. Never large rose backgrounds behind body text.' },
            { title: 'On light grounds', body: 'Use Rose Deep for rose text and ember instead of dusk, because sand disappears on bone.' },
          ]}
        />
      </Section>
    </>
  );
}
