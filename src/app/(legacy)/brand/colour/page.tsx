import type { Metadata } from 'next';
import { CORE_COLOURS, TEXT_COLOURS } from '@/data/brand-spec';
import { ColourBands } from '@/components/brand/ColourBands';
import {
  Bleed,
  Callout,
  PortalPageBody,
  Prose,
  PullQuote,
  RuleGrid,
  Section,
} from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Colour',
  description:
    'The Itqan Studio palette: a plum ground, warm cream, and an accent that changes cut depending on what it sits on.',
};

export default function ColourPage() {
  return (
    <PortalPageBody href="/brand/colour">
      <Section>
        <Prose>
          The palette alternates. A plum section, then a cream one, then plum
          again. That rhythm is the layout system as much as the colour system:
          it gives a long page a pulse without needing a single divider.
        </Prose>
        <Prose>
          Everything below is shown at the size you will actually use it, with
          real type on it. If a combination appears here, it has been measured.
        </Prose>
      </Section>

      <Bleed className="mb-24 md:mb-32">
        <ColourBands swatches={CORE_COLOURS} />
      </Bleed>

      <PullQuote>
        One accent, two cuts. Which one you use is decided by the surface
        underneath, never by preference.
      </PullQuote>

      <Section title="Why there are two mauves">
        <Prose>
          Mauve is the colour people recognise, and it only works on dark. On
          cream it measures 2.11:1 — far below the 4.5:1 that body text needs,
          and low enough that the text is genuinely hard to see rather than just
          low-contrast.
        </Prose>
        <Prose>
          Deep Mauve is the same role, redrawn for light surfaces at 7.22:1.
          They are two cuts of one accent, not two colours, which is why they
          are never used together.
        </Prose>
      </Section>

      <Section title="Text" intro="Three text colours, chosen by the surface rather than by hierarchy.">
        <Bleed>
          <ColourBands swatches={TEXT_COLOURS} />
        </Bleed>
      </Section>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Alternate dark and light sections down a page. It is the rhythm the brand is built on.' },
            { kind: 'do', text: 'Use Mauve #cca4c2 on plum and any dark section — hero, benefits, closing banner.' },
            { kind: 'do', text: 'Use Deep Mauve #6d4a66 on cream, white, and any light-tinted panel.' },
            { kind: 'do', text: 'Keep cream warm. #fffbf5, never pure white.' },
            { kind: 'dont', text: 'Do not put Mauve on a light background. It measures 2.11:1 and fails badly.' },
            { kind: 'dont', text: 'Do not put cream or white text on a mauve fill. Text on mauve is plum.' },
            { kind: 'dont', text: 'Do not introduce a colour outside this page, including tints of these.' },
            { kind: 'dont', text: 'Do not use Sand as body text on light. It is a dark-surface accent.' },
          ]}
        />
      </Section>

      <Callout tone="note" title="In code">
        The two cuts are separate Tailwind tokens on purpose:{' '}
        <code className="font-[family-name:var(--font-mono)] text-[0.8125rem]">
          text-brand-accent
        </code>{' '}
        and{' '}
        <code className="font-[family-name:var(--font-mono)] text-[0.8125rem]">
          text-brand-accent-on-light
        </code>
        . If you find yourself reaching for an opacity to make Mauve work on
        cream, you want the other token.
      </Callout>
    </PortalPageBody>
  );
}
