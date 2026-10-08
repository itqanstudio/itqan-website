import type { Metadata } from 'next';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Story & principles',
  description: 'What itqan means, and the four principles the brand protects.',
};

const PRINCIPLES = [
  {
    n: '01',
    title: 'Excellence in craftmanship',
    body: 'Itqan is the Arabic word for doing something properly — with care, to completion. It is a standard applied to the work itself, not a claim made about it. In practice that means the detail nobody was going to check gets done anyway.',
  },
  {
    n: '02',
    title: 'Precision over volume',
    body: 'One clear message beats five competing ones. The palette has two accents, the type has two faces, and a page has one headline. Everything the brand does is a subtraction argument.',
  },
  {
    n: '03',
    title: 'Function first',
    body: 'A brand exists to move a business. Every design decision here answers to whether it helps someone understand, trust, or decide. Beauty that costs clarity is not a trade this studio makes.',
  },
  {
    n: '04',
    title: 'Direction, not decoration',
    body: 'Clients arrive with potential and no direction. The work is the direction: the positioning, the system, the reasons. The visuals are how that becomes visible, not the product itself.',
  },
];

export default function StoryPage() {
  return (
    <PortalPageBody href="/brand/story"
      heroImage="/images/about/excellence.webp"
      heroAlt="Detail of studio work in progress"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Itqan Studio is named after a standard rather than a person or a
          place. Itqan means excellence in Arabic — the kind that comes from
          doing a thing thoroughly rather than fast. Naming the studio after it
          is a commitment that is easy to check: the work either meets it or it
          does not.
        </p>
      </Section>

      <Section title="Four principles">
        <ol className="space-y-8">
          {PRINCIPLES.map((p) => (
            <li key={p.n} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
              <span className="font-[family-name:var(--font-mono)] text-[0.875rem] text-[var(--color-accent)]">
                {p.n}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-[1.125rem] font-semibold">
                  {p.title}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Callout tone="note" title="How to use these">
        When a design decision is genuinely close, the principle breaks the tie.
        If an option is more impressive but a principle says clarity, clarity
        wins — even when impressive would photograph better.
      </Callout>
    </PortalPageBody>
  );
}
