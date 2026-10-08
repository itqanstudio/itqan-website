import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { assetBySlug } from '@/data/brand-library';
import { Callout, PortalPageBody, RuleGrid, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Logo',
  description: 'The Itqan Studio mark and wordmark: which version to use where, and the rules that keep it recognisable.',
};

/*
 * Named from the ARTWORK, not from the filename.
 *
 * The source files are called light-* / dark-*, but `light-icon` and
 * `light-logo` are drawn in Mauve #cca4c2, not cream. Calling either one
 * "cream" would send someone to the wrong file — and because mauve on a light
 * surface is the banned 2.11:1 pairing, every mauve cut is shown on dark here.
 *
 * There is deliberately no cream icon. On dark at small sizes the mauve icon
 * is the one to use.
 */
const PRIMARY = [
  {
    slug: 'white-logo',
    title: 'Cream lockup',
    when: 'The default on plum and any dark section.',
    tile: '#2f1c2c',
  },
  {
    slug: 'dark-logo',
    title: 'Plum lockup',
    when: 'Cream, white and any light surface — including other people’s decks.',
    tile: '#fffbf5',
  },
  {
    slug: 'light-logo',
    title: 'Mauve lockup',
    when: 'Dark surfaces where the mark should carry the accent rather than sit quiet. Never on light.',
    tile: '#2f1c2c',
  },
  {
    slug: 'light-icon',
    title: 'Mauve icon',
    when: 'Small spaces on dark: favicon, avatar, video corner.',
    tile: '#2f1c2c',
  },
  {
    slug: 'dark-icon',
    title: 'Plum icon',
    when: 'Small spaces on light.',
    tile: '#fffbf5',
  },
];

export default function LogoPage() {
  return (
    <PortalPageBody href="/brand/logo"
      heroImage="/images/hero/hero-main.png"
      heroAlt="A brand mark at working size"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          The lockup is the default. The icon exists for the places a lockup
          cannot survive — a favicon, an avatar, the corner of a video — and
          nowhere else. Both are monochrome, because a mark that depends on two
          colours breaks the first time someone prints it.
        </p>
      </Section>

      <Section title="Approved versions" intro="Pick by the surface it sits on, then by the space available.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {PRIMARY.map((p) => {
            const asset = assetBySlug('itqan-studio', p.slug);
            if (!asset?.src) return null;
            return (
              <li key={p.slug} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="flex h-40 items-center justify-center p-10" style={{ backgroundColor: p.tile }}>
                  <Image
                    src={asset.src}
                    alt={`${p.title} — Itqan Studio`}
                    width={asset.width ?? 200}
                    height={asset.height ?? 200}
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[0.9375rem] font-medium">{p.title}</h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--color-text-secondary)]">
                    {p.when}
                  </p>
                  <a
                    href={asset.src}
                    download
                    className="mt-3 inline-block font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-accent)] hover:underline"
                  >
                    ↓ {asset.format.toUpperCase()}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Callout tone="tip" title="Which one, quickly">
        Dark background: cream, or mauve when the mark should carry the accent.
        Light background: plum, always. Smaller than about 120px wide: the icon
        rather than the lockup.
      </Callout>

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Use the SVG wherever the medium allows it. It stays sharp at every size.' },
            { kind: 'do', text: 'Give the mark its clear space — the height of the icon on every side.' },
            { kind: 'do', text: 'Use one colour. The mark is monochrome by design.' },
            { kind: 'do', text: 'Switch to the icon before the lockup becomes unreadable, not after.' },
            { kind: 'dont', text: 'Do not recolour the mark outside the five approved cuts.' },
            { kind: 'dont', text: 'Do not add a shadow, glow, gradient or outline.' },
            { kind: 'dont', text: 'Do not stretch, rotate, skew or crop it.' },
            { kind: 'dont', text: 'Do not set the wordmark in Manrope by hand — it is drawn, not typed.' },
          ]}
        />
        <p className="mt-6 text-[0.875rem] text-[var(--color-text-secondary)]">
          Worked examples of each failure are on{' '}
          <Link href="/brand/logo/misuse" className="text-[var(--color-accent)] underline underline-offset-2">
            Misuse
          </Link>
          .
        </p>
      </Section>
    </PortalPageBody>
  );
}
