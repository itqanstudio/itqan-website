import type { Metadata } from 'next';
import { Callout, PortalPageBody, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Positioning',
  description: 'Who Itqan Studio is for, what it does, and the things it deliberately refuses to be.',
};

export default function PositioningPage() {
  return (
    <PortalPageBody href="/brand/positioning"
      heroImage="/images/portfolio/mutqin/hero.webp"
      heroAlt="Mutqin, a founder-led product the studio positioned and built"
    >
      <Section title="In one line">
        <p className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold leading-snug">
          Your brand has potential.{' '}
          <em
            className="text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}
          >
            We give it direction.
          </em>
        </p>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
          The promise is direction, not decoration. Clients rarely lack
          ambition or material; they lack a decision about what the thing is and
          who it is for. That decision is the product.
        </p>
      </Section>

      <Section title="Who it is for">
        <SpecTable
          columns={['Audience', 'What they want', 'What they get']}
          rows={[
            ['Founders and CEOs', 'Certainty before committing', 'A defensible position, argued, before anything is designed'],
            ['Boards and investors', 'Evidence the brand supports the plan', 'Work tied to outcomes, with the reasoning shown'],
            ['Marketing leads', 'A system their team can run', 'A system with rules, not a set of one-off files'],
            ['Founder-led companies', 'Someone who takes the work seriously', 'A studio named after a standard, which is checkable'],
          ]}
        />
      </Section>

      <Section title="What it refuses to be">
        <ul className="space-y-3">
          {[
            'A logo shop. The mark is the last decision, not the first.',
            'A volume agency. Fewer clients, further in, is the model.',
            'A trend follower. What is designed here should still work in five years.',
            'A guarantee machine. The studio commits to a standard of work, never to a number.',
          ].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-[7px] h-1 w-4 shrink-0 rounded-full bg-[#e08d84]" />
              <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">{t}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Callout tone="warning" title="Never in copy">
        No guaranteed outcomes, no invented statistics, no client results that
        have not been agreed with that client. The whole positioning rests on
        being trustworthy about the work; one inflated number costs more than it
        buys.
      </Callout>
    </PortalPageBody>
  );
}
