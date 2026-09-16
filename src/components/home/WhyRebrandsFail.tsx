'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RollButton } from '@/components/ui/RollButton';

/**
 * How it works: the four rungs, cheapest first. The point of the section is that
 * a buyer can stop after step two and still walk away with something they own,
 * so nothing here is framed as a commitment. Light-first, dark-aware (badge 4).
 */
interface Step {
  number: string;
  name: string;
  failure: string;
  fix: string;
}

const modes: Step[] = [
  {
    number: '01',
    name: 'Intro call',
    failure: 'Thirty minutes, free.',
    fix: 'You tell us the one thing that is stuck. We tell you whether we can move it.',
  },
  {
    number: '02',
    name: 'The Session',
    failure: 'Ninety minutes of questions about how the business actually runs.',
    fix: 'Within five working days, a written map: what leaks, what to fix first, what each step should cost. You keep it whether or not we ever speak again.',
  },
  {
    number: '03',
    name: 'The build',
    failure: 'One live system, fixed scope, fixed price quoted from the map.',
    fix: 'Released in stages, so you use the first part while the rest is built.',
  },
  {
    number: '04',
    name: 'We stay',
    failure: 'Hosting, backups, monitoring and changes every month.',
    fix: 'Or a weekly working partnership on the next bottleneck.',
  },
];

export function WhyRebrandsFail() {
  return (
    <section
      className="relative bg-white dark:bg-[#241626] py-24 md:py-36 overflow-hidden"
      aria-labelledby="fail-heading"
    >
      {/* Soft accent ambient — bottom-left (low on light, richer on dark) */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 12% 75%, rgba(109,74,102,0.04), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 12% 75%, rgba(204,164,194,0.07), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              4
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              How it works
            </span>
          </div>
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.06}>
          <h2
            id="fail-heading"
            className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', maxWidth: '18ch' }}
          >
            Start small.{' '}
            <span className="accent-italic">Keep the map either way</span>.
          </h2>
        </FadeUp>

        {/* The four rungs */}
        <div className="mt-14 md:mt-20 border-t border-black/[0.1] dark:border-brand-cream/[0.1]">
          {modes.map((mode, i) => (
            <ScrollReveal key={mode.number} direction="up" distance={20} delay={i * 0.05}>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 md:gap-12 py-8 md:py-10 border-b border-black/[0.1] dark:border-brand-cream/[0.1]">
                {/* Left — the failure */}
                <div className="flex gap-5">
                  <span
                    className="font-sans font-medium text-brand-accent-on-light/40 dark:text-brand-accent/40 tabular-nums leading-none flex-shrink-0"
                    style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)' }}
                  >
                    {mode.number}
                  </span>
                  <div>
                    <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.1875rem] md:text-[1.375rem] leading-[1.2]">
                      {mode.name}
                    </h3>
                    <p className="mt-2.5 text-text-secondary dark:text-brand-cream/55 text-[0.9375rem] md:text-[1rem] leading-[1.55] max-w-[42ch]">
                      {mode.failure}
                    </p>
                  </div>
                </div>

                {/* Right — how Itqan removes it */}
                <div className="md:pl-8 md:border-l border-black/[0.08] dark:border-brand-cream/[0.08]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <ArrowRight size={13} weight="bold" className="text-brand-accent-on-light dark:text-brand-accent" aria-hidden="true" />
                    <span className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-brand-accent-on-light dark:text-brand-accent">
                      What you get
                    </span>
                  </div>
                  <p className="text-text-primary dark:text-brand-cream/85 text-[0.9375rem] md:text-[1.0625rem] leading-[1.6] max-w-[46ch]">
                    {mode.fix}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Every rung above has a number attached to it on /services */}
        <FadeUp delay={0.1}>
          <div className="mt-12 md:mt-14">
            <RollButton href="/services" label="Prices and what is included" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
