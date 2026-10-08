import Image from 'next/image';
import type { Metadata } from 'next';
import { assetBySlug } from '@/data/brand-library';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Misuse',
  description: 'The eight things never to do to the Itqan Studio mark, shown rather than described.',
};

const MARK = assetBySlug('itqan-studio', 'white-logo');

/**
 * Each example is generated with CSS from the real mark rather than drawn as a
 * picture, so the "wrong" versions can never drift out of sync with the right
 * one — and nobody can mistake a screenshot of a mistake for an approved asset.
 */
const MISUSES: Array<{ title: string; why: string; style: React.CSSProperties; tile?: string }> = [
  { title: 'Stretched', why: 'Non-uniform scaling. The mark has one set of proportions.', style: { transform: 'scaleX(1.6)' } },
  { title: 'Rotated', why: 'The mark sits level. Always.', style: { transform: 'rotate(-14deg)' } },
  { title: 'Recoloured', why: 'Only the four approved cuts exist. Nothing outside the palette.', style: { filter: 'hue-rotate(120deg) saturate(3)' } },
  { title: 'Drop shadow', why: 'The mark is flat. Depth comes from the layout around it.', style: { filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.9))' } },
  {
    title: 'Wrong cut for the surface',
    why: 'The cream lockup on cream. This is the mistake the dual palette exists to prevent.',
    style: {},
    tile: '#fffbf5',
  },
  { title: 'Crowded', why: 'Clear space ignored. The mark needs the icon’s height of room on every side.', style: { transform: 'scale(2.1)' } },
  { title: 'Blurred or soft', why: 'Usually a raster mark scaled past its size. Use the SVG.', style: { filter: 'blur(1.6px)' } },
  { title: 'Tinted', why: 'Reduced opacity to “sit back”. If it should be quieter, make it smaller.', style: { opacity: 0.3 } },
];

export default function MisusePage() {
  if (!MARK?.src) return null;
  return (
    <PortalPageBody href="/brand/logo/misuse"
      heroImage="/images/portfolio/nexilink/cover.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Every example below is the real mark, broken on purpose with CSS. None
          of these are downloadable and none of them should ever appear
          anywhere.
        </p>
      </Section>

      <Section title="Never">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MISUSES.map((m) => (
            <li key={m.title}>
              <div
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#e08d84]/40 p-8"
                style={{ backgroundColor: m.tile ?? '#2f1c2c' }}
              >
                <Image
                  src={MARK.src!}
                  alt=""
                  aria-hidden="true"
                  width={MARK.width ?? 200}
                  height={MARK.height ?? 200}
                  className="max-h-full w-auto max-w-full object-contain"
                  style={m.style}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e08d84] text-[11px] font-bold text-[#2f1c2c]"
                >
                  ✕
                </span>
              </div>
              <p className="mt-2 text-[0.8125rem] font-medium">{m.title}</p>
              <p className="text-[0.75rem] leading-relaxed text-[var(--color-text-secondary)]">{m.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Callout tone="warning" title="If you are unsure">
        Use the cream lockup on plum at its natural proportions, with clear
        space around it. That version is correct in almost every context this
        brand appears in.
      </Callout>
    </PortalPageBody>
  );
}
