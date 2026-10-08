import Image from 'next/image';
import type { Metadata } from 'next';
import { assetBySlug } from '@/data/brand-library';
import { Callout, PortalPageBody, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Clear space & sizing',
  description: 'The exclusion zone around the Itqan Studio mark, and the minimum size it stays legible at.',
};

const MARK = assetBySlug('itqan-studio', 'light-icon');

export default function ClearSpacePage() {
  if (!MARK?.src) return null;
  return (
    <PortalPageBody href="/brand/logo/clear-space"
      heroImage="/images/portfolio/medacs/cover.png"
    >
      <Section
        title="The exclusion zone"
        intro="Clear space equals the full height of the icon, on all four sides. Nothing enters it — not type, not another logo, not the edge of the canvas."
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[#2f1c2c] p-8">
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-lg border border-dashed border-[var(--color-accent)]/40"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/3 top-1/3 h-1/3 w-1/3 border border-dashed border-[var(--color-accent)]/70"
            />
            <div className="absolute left-1/3 top-1/3 flex h-1/3 w-1/3 items-center justify-center">
              <Image
                src={MARK.src}
                alt="Itqan Studio icon inside its clear-space grid"
                width={MARK.width ?? 200}
                height={MARK.height ?? 200}
                className="h-full w-full object-contain"
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[8%] -translate-x-1/2 font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-accent)]"
            >
              1×
            </span>
            <span
              aria-hidden="true"
              className="absolute left-[8%] top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-accent)]"
            >
              1×
            </span>
          </div>
          <p className="mt-6 text-center font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--color-muted)]">
            1× = the height of the icon
          </p>
        </div>
      </Section>

      <Section title="Minimum sizes" intro="Below these the letterforms close up and the lockup reads as a smudge.">
        <SpecTable
          columns={['Context', 'Minimum', 'Notes']}
          rows={[
            ['Lockup on screen', '120px wide', 'Below this, switch to the icon.'],
            ['Icon on screen', '24px', 'Below this, use the favicon cut.'],
            ['Favicon', '16px', 'Purpose-drawn. Never scale the lockup down to this.'],
            ['Lockup in print', '30mm wide', 'Measured on the lockup width, not the bounding box.'],
            ['Video corner', '2.5% of frame height', 'Consistent optical size across 16:9, 1:1 and 9:16.'],
          ]}
        />
      </Section>

      <Callout tone="note" title="Beside another logo">
        In a client lockup or partner row, match the OPTICAL height of the other
        marks, not the bounding-box height. Keep at least 2× clear space between
        the two, and never lock them into a single composite graphic.
      </Callout>
    </PortalPageBody>
  );
}
