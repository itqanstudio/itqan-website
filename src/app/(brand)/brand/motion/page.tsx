import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { MOTION_RULES, MOTION_SPECS } from '@/data/brand-spec';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';
import { PixelField } from '@/components/v3/PixelField';

export const metadata: Metadata = portalMetadata({
  title: 'Motion',
  description: 'Scatter and resolve: how things move, with the spring specs.',
  path: '/brand/motion',
});

export default function MotionPage() {
  return (
    <>
      <PageHead
        kicker="Expression"
        title={<Rich value={['Scatter, then ', 'resolve.']} />}
        lead="Modules scatter and spring home in gradient colour, and the rose dot lands last. Move your pointer through the field: the pixels take your speed and settle from wherever they are."
      />
      <Section title="The signature move">
        <div className="pt-motion">
          <PixelField label="The Itqan symbol assembling from scattered pixels" hint="Move through the pixels" />
        </div>
      </Section>
      <Section title="Specs">
        <div className="pt-scroll">
          <table className="pt-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Spec</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_SPECS.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.spec}</td>
                  <td>{m.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Rules">
        <Rules items={MOTION_RULES.map((r, i) => ({ title: `Rule ${i + 1}`, body: r }))} />
      </Section>
    </>
  );
}
