import type { Metadata } from 'next';
import Image from 'next/image';
import { pageMetadata } from '@/lib/page-metadata';
import {
  CheckCircle,
  Compass,
  CursorClick,
  Megaphone,
  MagnifyingGlass,
  Sparkle,
  HardDrives,
} from '@phosphor-icons/react/dist/ssr';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RollButton } from '@/components/ui/RollButton';
import { AiVisibility } from '@/components/home/AiVisibility';
import { FounderOS } from '@/components/home/FounderOS';
import { Guarantee } from '@/components/home/Guarantee';
import { CTABanner } from '@/components/home/CTABanner';
import { ServiceFAQ, SERVICE_FAQ } from '@/components/services/ServiceFAQ';
import { JsonLd } from '@/components/seo/JsonLd';
import { servicesGraphLd, breadcrumbLd, faqLd } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Brand, Web, SEO & AI Visibility (GEO) Services — Dubai',
  description:
    'One Dubai agency for brand, websites that convert, content and social, SEO, AI visibility (GEO), hosting and agentic automation — designed, built and run by the same senior team.',
  path: '/services',
});

/** Section badge — dark circle number + bordered pill label (Axion pattern from IntroPartner). */
function SectionBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
        {n}
      </span>
      <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
        {label}
      </span>
    </div>
  );
}

interface Capability {
  icon: typeof Compass;
  name: string;
  /** Outcome-first, <25 words, no banned words. */
  outcome: string;
}

/**
 * The widened one-partner offer — every piece that turns traffic into buyers.
 * Outcome-first, no service-menu dump. Numbers are avoided here on purpose; the
 * real proof lives in the deep-dives and case studies.
 */
const capabilities: Capability[] = [
  {
    icon: Compass,
    name: 'Brand strategy & creative direction',
    outcome: 'We find what you stand for, then make it look the part everywhere.',
  },
  {
    icon: CursorClick,
    name: 'Sites that convert',
    outcome: 'Fast, clear sites built to turn a visit into a booked conversation.',
  },
  {
    icon: Megaphone,
    name: 'Content & social media marketing',
    outcome: 'A content engine that ships every week, in your voice, without you.',
  },
  {
    icon: MagnifyingGlass,
    name: 'SEO',
    outcome: 'We help the right buyers find you when they search for what you do.',
  },
  {
    icon: Sparkle,
    name: 'AI visibility (GEO)',
    outcome: 'We work to get your brand named when buyers ask ChatGPT, Claude and Gemini.',
  },
  {
    icon: HardDrives,
    name: 'Hosting & infrastructure',
    outcome: 'We run what we build — one team owns it from first idea to live and stable.',
  },
];

interface PillarDetail {
  number: string;
  name: string;
  metaphor: string;
  lede: string;
  image: string;
  /** Descriptive alt naming the real case work shown — image SEO + a11y. */
  imageAlt: string;
  outputs: string[];
}

const pillars: PillarDetail[] = [
  {
    number: '01',
    name: 'Identity',
    metaphor: 'the soul',
    lede: 'Most founders confuse a logo for an identity. We build the soul of the company — the positioning, the visual system, the voice — so every later asset compounds instead of contradicts.',
    image: '/images/founder-render.png',
    imageAlt: 'Itqan Studio brand identity and creative direction',
    outputs: [
      'Brand strategy & positioning brief',
      'Full visual identity system (logo, type, color, imagery)',
      'Content positioning + voice guidelines',
      'A content calendar ready to ship from',
    ],
  },
  {
    number: '02',
    name: 'System',
    metaphor: 'the skeleton',
    lede: "An identity that doesn't ship is decoration. We assemble the skeleton — the tooling stack, the workflows, the cadence — so the founder stops being the bottleneck.",
    image: '/images/portfolio/mutqin/hero-landing.webp',
    imageAlt: 'Mutqin founder portal — a product Itqan designed and built',
    outputs: [
      'Tooling stack chosen, configured, and connected',
      'Documented workflows for content, sales, and ops',
      'Social-media marketing + content engine, built to ship 4+ pieces/week',
      'Hand-off docs so a future hire can run it',
    ],
  },
  {
    number: '03',
    name: 'Automation',
    metaphor: 'the heartbeat',
    lede: 'Workflows still need someone clicking buttons. The heartbeat is the agentic layer that runs the operation without you in the loop — audit-trailed and founder-controlled.',
    image: '/images/portfolio/ITQAN-CRM-MKP-MCBK2.png',
    imageAlt: 'Itqan Studio CRM — the operations system that runs the studio, built in-house',
    outputs: [
      'Agentic automation layer, founder-controlled',
      'Lead capture + qualification automation',
      'Content distribution + cross-platform repurposing',
      'Daily KPI digest so you always know the number',
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={servicesGraphLd()} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
      <JsonLd data={faqLd(SERVICE_FAQ)} />

      {/* ── 1 · Header — the offer ── */}
      <section
        className="relative bg-brand-cream dark:bg-[#1f1420] pt-10 md:pt-16 pb-16 md:pb-24 overflow-hidden"
        aria-label="Services header"
      >
        {/* Soft accent ambient — mode-tuned so it never washes out light text */}
        <div
          className="absolute inset-0 pointer-events-none dark:hidden"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 15% 25%, rgba(204,164,194,0.20), transparent 60%), radial-gradient(ellipse 55% 50% at 90% 80%, rgba(209,194,165,0.16), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none hidden dark:block"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 15% 25%, rgba(204,164,194,0.12), transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={1} label="What we do" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h1
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.04] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5.5rem)', maxWidth: '18ch' }}
            >
              Everything that turns traffic into{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
              >
                buyers
              </span>
              .
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p
              className="mt-7 sm:mt-8 text-[#4a4a4a] dark:text-brand-cream/75 leading-[1.6] max-w-[58ch]"
              style={{ fontSize: 'clamp(1.0625rem, 1.35vw, 1.25rem)' }}
            >
              One partner for brand, sites, content, SEO, AI visibility and the
              infrastructure that runs it. Built and run by the same senior team.
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="mt-9 sm:mt-11">
              <RollButton href="/contact" label="Start a conversation" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 2 · The widened offer — capabilities ── */}
      <section
        className="bg-white dark:bg-[#241626] py-16 md:py-24"
        aria-labelledby="capabilities-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={2} label="The offer" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              id="capabilities-heading"
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', maxWidth: '24ch' }}
            >
              Six capabilities. One{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
              >
                team
              </span>
              .
            </h2>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p
              className="mt-6 text-text-secondary dark:text-brand-cream/70 leading-[1.6] max-w-[54ch]"
              style={{ fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)' }}
            >
              No hand-offs between agencies. Every piece is designed, built and run
              in-house, so the parts fit and the outcome compounds.
            </p>
          </FadeUp>

          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <ScrollReveal key={cap.name} direction="up" distance={22} delay={i * 0.06}>
                  <article className="h-full rounded-[14px] border border-black/[0.08] dark:border-brand-cream/[0.12] bg-white dark:bg-[#2a1a28] p-6 md:p-7 shadow-[0_2px_12px_rgba(47,28,44,0.06)] transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(47,28,44,0.12)]">
                    <span className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-accent/[0.14] dark:bg-brand-accent/[0.16]">
                      <Icon
                        size={20}
                        weight="regular"
                        className="text-brand-accent-on-light dark:text-brand-accent"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="mt-5 font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.0625rem] md:text-[1.125rem] leading-[1.3]">
                      {cap.name}
                    </h3>
                    <p className="mt-2.5 text-text-secondary dark:text-brand-cream/70 text-[0.9375rem] leading-[1.55]">
                      {cap.outcome}
                    </p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3 · AI visibility (GEO) — the scroll-stopper ── */}
      <section
        className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-16 md:py-24 overflow-hidden"
        aria-labelledby="geo-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={3} label="AI visibility" />
          </FadeUp>

          <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — the pull-line */}
            <div>
              <FadeUp delay={0.06}>
                <h2
                  id="geo-heading"
                  className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.03em]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', maxWidth: '16ch' }}
                >
                  Your next customer just asked{' '}
                  <span
                    className="text-brand-accent-on-light dark:text-brand-accent"
                    style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
                  >
                    an AI
                  </span>
                  .
                </h2>
              </FadeUp>

              <FadeUp delay={0.12}>
                <p
                  className="mt-6 text-[#4a4a4a] dark:text-brand-cream/75 leading-[1.6] max-w-[48ch]"
                  style={{ fontSize: 'clamp(1.0625rem, 1.3vw, 1.1875rem)' }}
                >
                  Buyers no longer start on Google. They ask ChatGPT, Claude and Gemini
                  who to hire — and act on the answer. We work to get your name in it.
                </p>
              </FadeUp>

              <FadeUp delay={0.18}>
                <p className="mt-6 text-text-secondary dark:text-brand-cream/60 leading-[1.6] max-w-[48ch] text-[0.9375rem]">
                  Clear positioning, structured content, and the signals AI engines
                  trust. We can&apos;t promise a citation — no honest partner can — but we
                  build for it, and we track it.
                </p>
              </FadeUp>
            </div>

            {/* Right — the AI-answer beat (reused, honest, self-discloses simulation) */}
            <FadeUp delay={0.1}>
              <div className="flex justify-center lg:justify-end">
                <AiVisibility className="w-full max-w-[440px]" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── The method — 3-pillar overview (shared, theme-aware) ── */}
      <FounderOS />

      {/* ── 4 · How it ships — pillar deep-dives ── */}
      <section
        className="bg-white dark:bg-[#241626] py-16 md:py-24"
        aria-labelledby="deep-dives-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={5} label="How it ships" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              id="deep-dives-heading"
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', maxWidth: '22ch' }}
            >
              Three phases. Real assets at{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
              >
                every gate
              </span>
              .
            </h2>
          </FadeUp>

          <div className="mt-8 md:mt-12">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={pillar.number} direction="up" distance={28} delay={0}>
                <article
                  className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center py-14 md:py-20 ${
                    i > 0 ? 'border-t border-black/[0.08] dark:border-brand-cream/[0.1]' : ''
                  }`}
                >
                  {/* Image — alternates sides */}
                  <div
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(47,28,44,0.06)] ${
                      i % 2 === 1 ? 'md:order-2' : ''
                    }`}
                  >
                    <Image
                      src={pillar.image}
                      alt={pillar.imageAlt}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Text */}
                  <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                    <span
                      className="font-sans font-medium text-brand-accent-on-light/45 dark:text-brand-accent/45 tabular-nums leading-none block"
                      style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}
                    >
                      {pillar.number}
                    </span>

                    <h3
                      className="mt-5 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.015em]"
                      style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
                    >
                      {pillar.name}
                    </h3>

                    <p
                      className="mt-2 text-brand-accent-on-light dark:text-brand-accent"
                      style={{
                        fontFamily: "var(--font-serif), serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(1.0625rem, 1.25vw, 1.25rem)',
                      }}
                    >
                      {pillar.metaphor}
                    </p>

                    <p
                      className="mt-6 text-text-secondary dark:text-brand-cream/75 leading-[1.6]"
                      style={{ fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)', maxWidth: '50ch' }}
                    >
                      {pillar.lede}
                    </p>

                    {/* Outputs list */}
                    <p className="mt-8 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-text-secondary/70 dark:text-brand-cream/45">
                      What ships
                    </p>
                    <ul role="list" className="mt-3 space-y-2.5">
                      {pillar.outputs.map((output) => (
                        <li
                          key={output}
                          className="flex items-start gap-2.5 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] leading-[1.55]"
                        >
                          <CheckCircle
                            size={16}
                            weight="fill"
                            className="text-brand-accent-on-light dark:text-brand-accent mt-[0.2em] flex-shrink-0"
                          />
                          <span>{output}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </ScrollReveal>
            ))}

            {/* Closing CTA — primary conversation + $497 audit */}
            <FadeUp>
              <div className="mt-12 md:mt-16 flex flex-col sm:flex-row sm:items-center gap-5">
                <RollButton href="/contact" label="Start a conversation" />

                <a
                  href="/contact?intent=ai-check"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-black/[0.14] dark:border-brand-cream/[0.2] bg-white dark:bg-[#2a1a28] pl-4 pr-4 py-2.5 text-[0.8125rem] sm:text-[0.875rem] font-semibold text-text-primary dark:text-brand-cream transition-colors duration-300 hover:border-black/[0.28] dark:hover:border-brand-cream/[0.35]"
                >
                  <span className="text-brand-accent-on-light dark:text-brand-accent">Free</span>
                  <span>AI Visibility Check</span>
                  <span className="text-text-secondary dark:text-brand-cream/50 text-[0.75rem] font-medium">
                    — see where you rank in AI answers
                  </span>
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FAQ — founder questions (GEO/AEO + on-page depth) ── */}
      <ServiceFAQ />

      {/* ── Guarantee (shared) — badge 7 in the Services sequence ── */}
      <Guarantee badge={7} />

      {/* ── Closing CTA (shared) ── */}
      <CTABanner />
    </>
  );
}
