import type { Metadata } from 'next';
import { Callout, PortalPageBody, RuleGrid, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Imagery',
  description: 'The three kinds of picture Itqan Studio uses — the work, the process, and the people — and what each is for.',
};

const KINDS = [
  {
    title: 'The work',
    body: 'Client output shown properly: a real screen, a real print piece, a real environment. Mockups are allowed when they clarify scale, never when they flatter something that does not exist yet. If a project cannot be shown, it is not in the portfolio.',
  },
  {
    title: 'The process',
    body: 'Sketches, boards, revisions, the wall of options that got cut. This is the evidence behind the word itqan and it is the most persuasive material the studio has, because nobody fakes it.',
  },
  {
    title: 'The people',
    body: 'Real photographs of the actual team. Available light, working context, no staged headshots against a grey backdrop. A brand that argues for authenticity cannot use a stock face.',
  },
];

export default function ImageryPage() {
  return (
    <PortalPageBody href="/brand/imagery"
      heroImage="/images/portfolio/oud-closet/cover.png"
      heroAlt="Client work photographed as it ships"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Pictures here do one of three jobs: show the work, show how it was
          made, or show who made it. Anything that does none of those is
          decoration and gets cut.
        </p>
      </Section>

      <Section title="Three kinds">
        <ul className="space-y-5">
          {KINDS.map((k) => (
            <li key={k.title} className="rounded-xl border border-[var(--color-border)] p-6">
              <h3 className="font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold">
                {k.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                {k.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Callout tone="warning" title="Never stock">
        No handshakes, no diverse-team-around-a-laptop, no city skyline at dusk.
        A studio that sells judgement cannot illustrate itself with a photograph
        anyone can license for nine dollars.
      </Callout>

      <Section title="Treatment">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Let the work fill the frame. Crop into a detail rather than shrinking the whole thing.' },
            { kind: 'do', text: 'Keep backgrounds plain so the subject carries the image.' },
            { kind: 'do', text: 'Match the image to the ground it sits on — dark imagery on plum, light on cream.' },
            { kind: 'do', text: 'Write real alt text describing what the work is, not "project screenshot".' },
            { kind: 'dont', text: 'Do not apply a mauve wash or a duotone to a photograph.' },
            { kind: 'dont', text: 'Do not put the mark on top of client work as a watermark.' },
            { kind: 'dont', text: 'Do not use a mockup that implies a deliverable which was never made.' },
            { kind: 'dont', text: 'Do not upscale a small image to fill a hero. Reshoot or reframe.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
