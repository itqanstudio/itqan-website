import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PAIRINGS } from '@/data/brand-spec';
import { PageHead, Section } from '@/components/portal/primitives';

export const metadata: Metadata = portalMetadata({
  title: 'Pairings and contrast',
  description: 'Approved text and background combinations with measured contrast, and the banned ones.',
  path: '/brand/colour/pairings',
});

export default function PairingsPage() {
  return (
    <>
      <PageHead
        kicker="Identity · Colour"
        title="Pairings and contrast"
        lead="Measured with the WCAG 2.1 formula. Body text needs 4.5 to 1 or more. Anything marked no is not used for text at any size."
      />
      <Section title="Every pairing">
        <div className="pt-scroll">
          <table className="pt-table">
            <thead>
              <tr>
                <th scope="col">Sample</th>
                <th scope="col">Text on ground</th>
                <th scope="col">Contrast</th>
                <th scope="col">For text</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {PAIRINGS.map((p) => (
                <tr key={`${p.fg}-${p.bg}`}>
                  <td>
                    <span className="demo" style={{ color: p.fgHex, background: p.bgHex }}>
                      Itqan
                    </span>
                  </td>
                  <td>
                    {p.fg} on {p.bg}
                  </td>
                  <td>{p.ratio.toFixed(2)} : 1</td>
                  <td>{p.ok ? <span className="ok">Yes</span> : <span className="no">No</span>}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
