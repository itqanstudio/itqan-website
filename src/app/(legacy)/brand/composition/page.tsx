import type { Metadata } from 'next';
import { RADII } from '@/data/brand-spec';
import { Callout, PortalPageBody, RuleGrid, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Composition',
  description: 'How an Itqan Studio page is built: alternating grounds, generous space, one idea per section.',
};

export default function CompositionPage() {
  return (
    <PortalPageBody href="/brand/composition"
      heroImage="/images/portfolio/project-you/landing-dark.webp"
      heroAlt="A page built on the alternating rhythm"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Pages alternate: a plum section, a cream section, plum again. That
          rhythm does the work a divider or a border would otherwise be asked to
          do, and it keeps a long page from reading as one undifferentiated
          scroll.
        </p>
      </Section>

      <Section title="The alternating rhythm">
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          {[
            { bg: '#2f1c2c', fg: '#fffbf5', accent: '#cca4c2', label: 'Hero', note: 'Dark. Mauve accent.' },
            { bg: '#fffbf5', fg: '#1a1a1a', accent: '#6d4a66', label: 'Services', note: 'Light. Deep Mauve accent.' },
            { bg: '#2f1c2c', fg: '#fffbf5', accent: '#cca4c2', label: 'Benefits', note: 'Dark. Mauve accent.' },
            { bg: '#fffbf5', fg: '#1a1a1a', accent: '#6d4a66', label: 'Work', note: 'Light. Deep Mauve accent.' },
            { bg: '#2f1c2c', fg: '#fffbf5', accent: '#cca4c2', label: 'Call to action', note: 'Dark. Mauve accent.' },
          ].map((s) => (
            <div key={s.label} className="px-6 py-5" style={{ backgroundColor: s.bg, color: s.fg }}>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: s.accent }}>
                {s.label}
              </p>
              <p className="mt-1 text-[0.875rem]">{s.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[0.875rem] text-[var(--color-text-secondary)]">
          Notice the accent changes cut with the ground. That is not a style
          choice — mauve on cream measures 2.11:1.
        </p>
      </Section>

      <Section title="Measure and rhythm">
        <SpecTable
          columns={['Element', 'Value', 'Why']}
          rows={[
            ['Reading measure', '~70 characters', 'Longer and the eye loses the line return.'],
            ['Section padding', '96px+ vertical', 'The work needs air. Crowding reads as cheap.'],
            ['Block gap inside a section', '24px', 'Related things stay visibly related.'],
            ['Grid', '3 columns desktop, 1 mobile', 'Services, values and portfolio all use it.'],
            ['Card radius', '8 to 12px', 'Subtle. A large radius reads consumer, not studio.'],
          ]}
        />
        <div className="mt-8">
          <SpecTable columns={['Radius', 'Value', 'Utility']} rows={RADII.map(([n, v, t]) => [n, v, t])} />
        </div>
      </Section>

      <Callout tone="tip" title="A test that works">
        Squint at the page. You should see alternating bands with one accent
        mark in each. If two things in a band are competing for the accent, one
        of them is wrong.
      </Callout>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Alternate dark and light sections down the page.' },
            { kind: 'do', text: 'Give each section one idea and one heading.' },
            { kind: 'do', text: 'Use whitespace as the separator before reaching for a border.' },
            { kind: 'do', text: 'Switch the accent cut whenever the ground changes.' },
            { kind: 'dont', text: 'Do not run two dark sections back to back without a reason.' },
            { kind: 'dont', text: 'Do not centre long-form text. Centre a headline at most.' },
            { kind: 'dont', text: 'Do not fill space because it is there. Empty space is doing work.' },
            { kind: 'dont', text: 'Do not box everything. A border should mean something is genuinely separate.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
