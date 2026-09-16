'use client';

import { ShieldCheck } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * After go-live. The section that separates us from an agency that hands over
 * and leaves, so it names both continuity options and the date guarantee. Prices
 * live on /services, deliberately not here. Light-first, dark-aware (badge 5).
 */
const gates = [
  {
    name: 'Care',
    delivers:
      'Hosting, backups, monitoring, and up to four hours of changes or advice a month. Three-month minimum, then month to month.',
  },
  {
    name: 'Partner',
    delivers:
      'A fixed weekly working call, three engineering days a month, a monthly written review, and the next bottleneck each quarter. Month to month, thirty days notice.',
  },
];

/** `badge` sets the numbered pill (default 5, the home order). */
export function Guarantee({ badge = 5 }: { badge?: number }) {
  return (
    <section
      className="relative bg-[#f5efe6] dark:bg-[#1a0f1c] py-24 md:py-36 overflow-hidden"
      aria-labelledby="guarantee-heading"
    >
      {/* Soft accent ambient — bottom-right (low on light, richer on dark) */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 85% 80%, rgba(109,74,102,0.04), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 85% 80%, rgba(204,164,194,0.07), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-10 md:mb-14">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              {badge}
            </span>
            <span className="inline-flex items-center gap-2 text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              <ShieldCheck size={14} weight="bold" className="text-brand-accent-on-light dark:text-brand-accent" />
              After go-live
            </span>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-start">
          {/* Left — heading + lead */}
          <div>
            <FadeUp delay={0.06}>
              <h2
                id="guarantee-heading"
                className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.5rem)' }}
              >
                Most agencies hand over and leave.{' '}
                <span className="accent-italic">We stay.</span>
              </h2>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p
                className="mt-7 text-text-secondary dark:text-brand-cream/75 leading-[1.6]"
                style={{ fontSize: 'clamp(1rem, 1.25vw, 1.125rem)', maxWidth: '46ch' }}
              >
                The team that built your system hosts it, watches it, backs it up every
                day, and keeps building.{' '}
                <span className="text-text-primary dark:text-brand-cream font-medium">
                  Two ways.
                </span>
              </p>
            </FadeUp>

            {/* The guarantee, and the boundary on it, in one breath */}
            <FadeUp delay={0.26}>
              <p
                className="mt-9 italic text-text-secondary/70 dark:text-brand-cream/45 leading-[1.55]"
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontSize: '0.9375rem',
                  maxWidth: '46ch',
                }}
              >
                Every deliverable has a date. Miss a date and the work extends at no
                charge until it ships. We never guarantee your revenue or your leads. We
                guarantee what we build, and when.
              </p>
            </FadeUp>
          </div>

          {/* Right — phase gate cards */}
          <div className="grid gap-3 md:gap-4">
            {gates.map((gate, i) => (
              <ScrollReveal
                key={gate.name}
                direction="up"
                distance={20}
                delay={i * 0.08}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative flex items-start gap-5 md:gap-6 p-6 md:p-7 rounded-[12px] border border-black/[0.08] dark:border-brand-cream/[0.08] bg-white dark:bg-[#2a1a28] shadow-[0_2px_12px_rgba(47,28,44,0.06)]"
                >
                  {/* Option marker */}
                  <div
                    className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-sans font-semibold text-brand-accent-on-light border border-brand-accent-on-light/35 bg-brand-accent-on-light/[0.08] dark:text-brand-accent dark:border-brand-accent/35 dark:bg-brand-accent/[0.08] tabular-nums"
                    style={{ fontSize: '0.875rem' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.125rem] md:text-[1.25rem] leading-[1.2]">
                      {gate.name}
                    </h3>
                    <p className="mt-2 text-text-secondary dark:text-brand-cream/75 text-[0.9375rem] md:text-[1rem] leading-[1.55]">
                      {gate.delivers}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
