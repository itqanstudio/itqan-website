import type { Metadata } from 'next';
import { TYPE_ROLES } from '@/data/brand-spec';
import { Callout, PortalPageBody, RuleGrid, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Typography',
  description: 'Manrope carries everything. Playfair Display italic marks one phrase.',
};

const FACES = [
  {
    name: 'Manrope',
    role: 'Everything',
    where: 'next/font/google as --font-sans',
    note: 'Headlines, body, navigation, labels. One family across four weights does the whole job, and the restraint is the point.',
    sample: 'Excellence is a standard, not a slogan.',
    family: 'var(--font-sans)',
    weight: 700,
  },
  {
    name: 'Playfair Display Italic',
    role: 'One phrase',
    where: 'next/font/google as --font-serif — italic only',
    note: 'Loaded in italic alone. It marks a single phrase inside a headline and never runs longer than that.',
    sample: 'clarity, precision and results',
    family: 'var(--font-serif)',
    weight: 400,
    italic: true,
  },
];

export default function TypographyPage() {
  return (
    <PortalPageBody href="/brand/typography"
      heroImage="/images/portfolio/mutqin/brand.webp"
      heroAlt="Type in use across the Mutqin identity"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Two faces. Manrope does the work; Playfair appears once per headline
          to give a line an edge that a bold weight cannot. Most brands reach
          for a third typeface at exactly the point where they should be cutting
          words instead.
        </p>
      </Section>

      <Section title="The faces">
        <ul className="space-y-4">
          {FACES.map((f) => (
            <li key={f.name} className="rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-[family-name:var(--font-display)] text-[1.125rem] font-semibold">
                  {f.name}
                </h3>
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  {f.role}
                </span>
              </div>
              <p
                className="mt-5 text-[2rem] leading-[1.15] tracking-[-0.02em]"
                style={{
                  fontFamily: f.family,
                  fontWeight: f.weight,
                  fontStyle: f.italic ? 'italic' : 'normal',
                }}
              >
                {f.sample}
              </p>
              <p className="mt-5 text-[0.875rem] leading-relaxed text-[var(--color-text-secondary)]">
                {f.note}
              </p>
              <code className="mt-2 block font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-muted)]">
                {f.where}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The scale" intro="Six roles. If a piece of text is not one of these, it is body.">
        <SpecTable
          columns={['Role', 'Spec', 'Face and use']}
          rows={TYPE_ROLES.map((t) => [t.role, t.spec, `${t.face} — ${t.use}`])}
        />
      </Section>

      <Callout tone="warning" title="Never">
        Playfair is loaded in italic only. Setting it upright falls back to
        Georgia and quietly changes the brand. If a design calls for an upright
        serif, the answer is that it does not.
      </Callout>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'One hero-size headline per page. Everything under it steps down.' },
            { kind: 'do', text: 'Colour the italic phrase with the accent cut that matches its background.' },
            { kind: 'do', text: 'Keep labels to a few words at 0.18em tracking, uppercase.' },
            { kind: 'do', text: 'Let body text breathe at 1.7 line height and stop lines around 70 characters.' },
            { kind: 'dont', text: 'Do not italicise a whole sentence. One phrase, inside a headline.' },
            { kind: 'dont', text: 'Do not add a third typeface, including for a single asset.' },
            { kind: 'dont', text: 'Do not set body copy below 16px on a marketing page.' },
            { kind: 'dont', text: 'Do not use tight tracking on small text. It is for display sizes only.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
