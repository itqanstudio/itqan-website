import type { Metadata } from 'next';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Specimens',
  description: 'Live specimens of every role in the Itqan Studio type scale, rendered in the real faces.',
};

/**
 * Rendered live rather than as images: a specimen that is a screenshot cannot
 * tell you the font failed to load, which is the exact failure this page is
 * meant to catch.
 */
const SPECIMENS = [
  {
    role: 'Hero',
    note: 'Manrope 700 · 64px · -0.02em · one per page',
    text: 'Your brand has potential.',
    style: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(2.25rem,7vw,4rem)', letterSpacing: '-0.02em', lineHeight: 1.05 },
  },
  {
    role: 'Section heading',
    note: 'Manrope 700 · 40 to 44px',
    text: 'We give it direction',
    style: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(1.75rem,4.5vw,2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.12 },
  },
  {
    role: 'Editorial accent',
    note: 'Playfair Display 400 italic · inside a heading, never alone',
    text: 'clarity, precision and results',
    style: { fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic' as const, fontSize: '2rem', lineHeight: 1.2 },
  },
  {
    role: 'Body',
    note: 'Manrope 400 · 16px · 1.7 line height',
    text: 'Every headline promises a result, not a process. The work is shown, the reasoning is shown, and the client decides. Nothing here needs a superlative to stand up.',
    style: { fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '1rem', lineHeight: 1.7 },
  },
  {
    role: 'UI & navigation',
    note: 'Manrope 500 · 14 to 16px',
    text: 'Start a conversation',
    style: { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '1rem' },
  },
  {
    role: 'Label',
    note: 'Manrope 700 · 10 to 12px · 0.18em · uppercase',
    text: 'Selected work',
    style: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const },
  },
];

export default function SpecimensPage() {
  return (
    <PortalPageBody href="/brand/typography/specimens"
      heroImage="/images/portfolio/oud-closet/desert-still.webp"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Everything below is set in the live webfonts, not exported as images.
          If a specimen looks wrong on your machine, the font failed to load —
          and that is worth knowing.
        </p>
      </Section>

      <ul className="space-y-10">
        {SPECIMENS.map((s) => (
          <li key={s.role} className="border-b border-[var(--color-border)] pb-10 last:border-0">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="t-eyebrow">{s.role}</span>
              <code className="font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-muted)]">
                {s.note}
              </code>
            </div>
            <p style={s.style}>{s.text}</p>
          </li>
        ))}
      </ul>

      <Callout tone="tip" title="Mixing the italic in">
        The italic phrase sits inline inside a Manrope headline, at the same
        size, so the two faces share a baseline. It reads as emphasis, not as a
        second headline.
      </Callout>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem,4vw,2.25rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          Built for{' '}
          <em
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}
            className="text-[var(--color-accent)]"
          >
            clarity, precision and results
          </em>
        </p>
      </div>
    </PortalPageBody>
  );
}
