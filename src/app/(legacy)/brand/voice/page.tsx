import Link from 'next/link';
import type { Metadata } from 'next';
import { Callout, PortalPageBody, RuleGrid, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Voice',
  description: 'How Itqan Studio writes: professional, confident, premium — never corporate or stiff.',
};

const CONTRASTS = [
  {
    instead: 'We leverage a holistic, data-driven approach to unlock brand equity.',
    write: 'We decide what your brand is for, then build everything from that.',
    why: 'Says the actual method in words a client would use.',
  },
  {
    instead: 'Our world-class team delivers unparalleled creative excellence.',
    write: 'Three people. We take fewer projects and go further into each one.',
    why: 'A specific, checkable claim beats a superlative nobody believes.',
  },
  {
    instead: 'Elevate your brand to the next level!',
    write: 'Your brand has potential. We give it direction.',
    why: 'Names the gap and the fix. No exclamation mark required.',
  },
  {
    instead: 'We guarantee a 300% increase in engagement.',
    write: 'Here is what we did for them, and what happened after.',
    why: 'The studio never promises an outcome. It shows one.',
  },
];

export default function VoicePage() {
  return (
    <PortalPageBody href="/brand/voice"
      heroImage="/images/content-creation.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Professional, confident, premium — and never corporate. The test is
          whether a sentence could appear on any agency site in the world. If it
          could, it is not ours yet.
        </p>
      </Section>

      <Section title="Instead of / write">
        <ul className="space-y-4">
          {CONTRASTS.map((c) => (
            <li key={c.write} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <p className="border-b border-[var(--color-border)] px-5 py-4 text-[0.9375rem] text-[var(--color-text-secondary)] line-through decoration-[#e08d84]/60">
                {c.instead}
              </p>
              <p className="px-5 py-4 text-[0.9375rem]">{c.write}</p>
              <p className="border-t border-[var(--color-border)] px-5 py-2.5 text-[0.75rem] text-[var(--color-muted)]">
                {c.why}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Callout tone="warning" title="Never">
        No guarantees. No invented statistics. No client result that has not
        been agreed with that client. No urgency that is not real. The
        positioning rests entirely on being trustworthy about the work.
      </Callout>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Write at an eighth-grade reading level for anything public-facing.' },
            { kind: 'do', text: 'Lead with the result, then explain the method.' },
            { kind: 'do', text: 'Use the specific number, name or timeframe rather than a vague claim.' },
            { kind: 'do', text: 'Keep sentences short. Confidence reads as brevity.' },
            { kind: 'dont', text: 'Do not stack adjectives. One does the job three cannot.' },
            { kind: 'dont', text: 'Do not use "solutions", "synergy", "leverage" or "unlock".' },
            { kind: 'dont', text: 'Do not use exclamation marks in marketing copy.' },
            { kind: 'dont', text: 'Do not describe the studio as passionate. Show the standard instead.' },
          ]}
        />
      </Section>

      <p className="text-[0.875rem] text-[var(--color-text-secondary)]">
        Approved boilerplate, taglines and service descriptions are in the{' '}
        <Link href="/brand/voice/library" className="text-[var(--color-accent)] underline underline-offset-2">
          copy library
        </Link>
        .
      </p>
    </PortalPageBody>
  );
}
