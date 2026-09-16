import { Link } from 'next-view-transitions';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { FadeUp } from '@/components/ui/FadeUp';
import { RollButton } from '@/components/ui/RollButton';
import { CaseMedia } from '@/components/ui/CaseMedia';

interface CaseCard {
  href: string;
  title: string;
  /** Stakes + real outcome (src/data/case-studies.ts) — leads the caption. */
  outcome: string;
  media: { video?: string; image: string; alt: string };
  aspect: string;
  /** Expanding hover chip style. */
  chip: 'light' | 'dark';
  chipWidth: string;
}

const cards: CaseCard[] = [
  {
    href: '/work/lemon-garden',
    title: 'Lemon Garden',
    outcome:
      'Seven Swedish restaurants ran out of one shared inbox. Now guests pick their branch, bookings route themselves, and each restaurant sees its own day. Working demo on day one. Live within a week.',
    media: {
      image: '/images/portfolio/lemon-garden/cover-collage.webp',
      alt: 'Lemon Garden, a seven-restaurant booking system built and hosted by Itqan Studio',
    },
    aspect: 'aspect-[329/246]',
    chip: 'light',
    chipWidth: 'group-hover:w-[168px]',
  },
  {
    href: '/work/millow',
    title: 'Millow',
    outcome:
      'Off a locked Wix setup, onto a website and CMS they own. 56 tracked design rounds. Every release behind a 113-test gate. In their words: they captured the essence of the brand.',
    media: {
      image: '/images/portfolio/millow/cover-collage.webp',
      alt: "Millow, Sweden's fermented oat protein platform, website designed with Itqan Studio",
    },
    aspect: 'aspect-square md:aspect-[329/246]',
    chip: 'dark',
    chipWidth: 'group-hover:w-[168px]',
  },
];

/** Expanding hover chip: circle grows into a labeled pill (Axion case-card pattern). */
function HoverChip({ chip, chipWidth }: { chip: 'light' | 'dark'; chipWidth: string }) {
  return (
    <span
      className={`absolute bottom-4 left-4 flex items-center gap-2 h-9 w-9 ${chipWidth} rounded-full overflow-hidden pl-[11px] transition-all duration-300 ease-in-out ${
        chip === 'light' ? 'bg-white text-text-primary' : 'bg-brand-dark text-brand-cream'
      }`}
      aria-hidden="true"
    >
      <ArrowRight
        size={14}
        weight="bold"
        className="flex-shrink-0 -rotate-45 group-hover:rotate-0 transition-transform duration-300 ease-in-out"
      />
      <span className="text-[0.8125rem] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
        View case study
      </span>
    </span>
  );
}

/**
 * Axion "Section 3" adapted: two flagship cases with expanding hover chips,
 * captions leading with stakes + real outcomes. Light-first, dark-aware.
 */
export function CasesAxion() {
  return (
    <section
      className="bg-[#f5efe6] dark:bg-[#1a0f1c] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28"
      aria-labelledby="cases-heading"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              3
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.15] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Selected work
            </span>
          </div>
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.06}>
          <h2
            id="cases-heading"
            className="px-5 sm:px-8 lg:px-12 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.03em] mb-10 sm:mb-14 lg:mb-16"
            style={{ fontSize: 'clamp(1.75rem, 6vw, 4.2rem)' }}
          >
            Proof, not{' '}
            <span
              className="text-brand-accent-on-light dark:text-brand-accent"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
            >
              promises
            </span>
            .
          </h2>
        </FadeUp>

        {/* Cards */}
        <div className="px-5 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7">
          {cards.map((card, i) => (
            <FadeUp key={card.href} delay={i * 0.08}>
              <Link href={card.href} className="group block cursor-pointer">
                <div
                  className={`relative ${card.aspect} rounded-2xl overflow-hidden bg-brand-dark/10`}
                  style={{ viewTransitionName: `case-cover-${card.href.split('/').pop()}` }}
                >
                  <CaseMedia
                    video={card.media.video}
                    image={card.media.image}
                    alt={card.media.alt}
                  />
                  <HoverChip chip={card.chip} chipWidth={card.chipWidth} />
                </div>
                <p className="mt-4 text-[0.8125rem] sm:text-[0.875rem] text-text-secondary dark:text-brand-cream/60 leading-relaxed">
                  {card.outcome}
                </p>
                <p className="mt-1 text-[0.875rem] sm:text-[0.9375rem] font-semibold text-text-primary dark:text-brand-cream">
                  {card.title}
                </p>
              </Link>
            </FadeUp>
          ))}
        </div>

        {/* All work */}
        <FadeUp delay={0.12}>
          <div className="px-5 sm:px-8 lg:px-12 mt-12 sm:mt-14">
            <RollButton href="/work" label="All work" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
