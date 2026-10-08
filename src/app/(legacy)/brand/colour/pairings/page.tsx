import type { Metadata } from 'next';
import { PAIRINGS } from '@/data/brand-spec';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Pairings & contrast',
  description:
    'Approved Itqan Studio colour combinations with measured WCAG contrast ratios, and the two that are banned.',
};

const VERDICT = {
  aaa: { label: 'AAA', colour: '#d1c2a5' },
  aa: { label: 'AA', colour: '#cca4c2' },
  'large-only': { label: 'Large only', colour: '#e0b062' },
  never: { label: 'Never', colour: '#e08d84' },
} as const;

export default function PairingsPage() {
  return (
    <PortalPageBody href="/brand/colour/pairings">
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Every ratio below is measured with the WCAG relative-luminance
          formula, not estimated. Two pairings are banned outright, and both
          involve mauve meeting a light surface.
        </p>
      </Section>

      <Section title="Measured pairings">
        <ul className="space-y-3">
          {PAIRINGS.map((p) => {
            const v = VERDICT[p.verdict];
            return (
              <li key={p.label} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div
                  className="flex items-center justify-between gap-4 px-5 py-5"
                  style={{ backgroundColor: p.bg }}
                >
                  <span
                    className="font-[family-name:var(--font-display)] text-[1.125rem] font-semibold"
                    style={{ color: p.fg }}
                  >
                    {p.label}
                  </span>
                  <span
                    className="shrink-0 font-[family-name:var(--font-mono)] text-[0.8125rem]"
                    style={{ color: p.fg }}
                  >
                    {p.ratio.toFixed(2)}:1
                  </span>
                </div>
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className="mt-[3px] shrink-0 rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]"
                    style={{ color: v.colour, border: `1px solid ${v.colour}` }}
                  >
                    {v.label}
                  </span>
                  <p className="text-[0.875rem] leading-relaxed text-[var(--color-text-secondary)]">
                    {p.note}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Callout tone="note" title="The thresholds">
        WCAG AA needs 4.5:1 for body text and 3:1 for text at 24px, or 19px
        bold. AAA needs 7:1. Interface borders and icons that carry meaning need
        3:1. The two banned pairings sit at 2.11:1 — below every threshold there
        is.
      </Callout>
    </PortalPageBody>
  );
}
