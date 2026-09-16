'use client';

import { Browser, Database, ArrowsLeftRight } from '@phosphor-icons/react';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * What we build: one system in three parts. The website is deliberately the
 * first column, because it is the front of the system rather than a separate
 * project. Light-first, dark-aware (badge 2).
 */
interface Pillar {
  Icon: typeof Browser;
  number: string;
  name: string;
  accent: string;
  body: string;
}

const pillars: Pillar[] = [
  {
    Icon: Browser,
    number: '01',
    name: 'Front',
    accent: 'The website and the booking or intake your customers use.',
    body: 'Guests pick the branch. The form routes itself. Nothing lands in a shared inbox.',
  },
  {
    Icon: Database,
    number: '02',
    name: 'Back',
    accent: 'Calendar, customers, quotes, contracts, invoices.',
    body: 'Each location sees its own day. You see all of them.',
  },
  {
    Icon: ArrowsLeftRight,
    number: '03',
    name: 'Between',
    accent: 'Confirmations, reminders, routing to the right person.',
    body: 'And the follow-up that used to be you at 11 pm.',
  },
];

export function ThreePillars() {
  return (
    <section
      className="relative bg-brand-cream dark:bg-[#1f1420] py-24 md:py-36 overflow-hidden"
      aria-labelledby="pillars-heading"
    >
      {/* Subtle accent ambient — mauve haze, right side (low on light, richer on dark) */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 85% 25%, rgba(109,74,102,0.05), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 85% 25%, rgba(204,164,194,0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              2
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              What we build
            </span>
          </div>
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.06}>
          <h2
            id="pillars-heading"
            className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', maxWidth: '20ch' }}
          >
            One system. Three parts.{' '}
            <span className="accent-italic">Owned by you</span>.
          </h2>
        </FadeUp>

        {/* Pillars */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.08] dark:bg-brand-cream/[0.08] rounded-[14px] overflow-hidden">
          {pillars.map((pillar, i) => (
            <ScrollReveal
              key={pillar.number}
              direction="up"
              distance={28}
              delay={i * 0.1}
            >
              <PillarCard pillar={pillar} />
            </ScrollReveal>
          ))}
        </div>

        {/* The line that stops "website" being read as a separate project */}
        <FadeUp delay={0.1}>
          <p
            className="mt-14 md:mt-16 text-text-secondary dark:text-brand-cream/70 leading-[1.55]"
            style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)', maxWidth: '64ch' }}
          >
            The brand and the website are built as{' '}
            <span className="text-text-primary dark:text-brand-cream font-medium">
              the front of the system
            </span>
            , not as a separate project.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const { Icon } = pillar;
  return (
    <article
      className="relative h-full bg-white dark:bg-[#2a1a28] hover:bg-[#f5efe6] dark:hover:bg-[#341f31] p-8 md:p-10 lg:p-12 flex flex-col group transition-colors duration-300"
    >
      {/* Icon + phase number */}
      <div className="flex items-center justify-between mb-10">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-brand-accent-on-light/[0.1] border border-brand-accent-on-light/25 text-brand-accent-on-light dark:bg-brand-accent/[0.1] dark:border-brand-accent/25 dark:text-brand-accent">
          <Icon size={20} weight="regular" />
        </span>
        <span
          className="font-sans font-medium text-brand-accent-on-light/40 dark:text-brand-accent/40 tabular-nums"
          style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', lineHeight: 1 }}
        >
          {pillar.number}
        </span>
      </div>

      {/* Pillar name */}
      <h3
        className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.01em]"
        style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)' }}
      >
        {pillar.name}
      </h3>

      {/* Accent line — italic Playfair */}
      <p
        className="mt-3 text-brand-accent-on-light dark:text-brand-accent/85"
        style={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.0625rem, 1.2vw, 1.1875rem)',
          maxWidth: '30ch',
        }}
      >
        {pillar.accent}
      </p>

      {/* Spacer for rhythm */}
      <div className="flex-1 min-h-[20px]" />

      {/* Body */}
      <p
        className="mt-6 text-text-secondary dark:text-brand-cream/70 leading-[1.6]"
        style={{ fontSize: '0.9375rem', maxWidth: '38ch' }}
      >
        {pillar.body}
      </p>

      {/* Accent underline on hover */}
      <div className="mt-8 h-px bg-gradient-to-r from-brand-accent-on-light/60 via-brand-accent-on-light/20 to-transparent dark:from-brand-accent/60 dark:via-brand-accent/20 origin-left scale-x-100 md:scale-x-0 md:group-hover:scale-x-100 transition-transform duration-500 ease-out" />
    </article>
  );
}
