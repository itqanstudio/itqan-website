'use client';

import { motion } from 'framer-motion';
import { RollButton } from '@/components/ui/RollButton';
import { INTRO_CALL_URL, INTRO_CALL_LABEL } from '@/lib/booking';

/**
 * The closer. No badge (it ends the page). It asks for the one thing that is
 * stuck rather than for a project, because that is the question the intro call
 * is built to answer. Light-first, dark-aware.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, amount: 0.3 } as const,
  transition: { duration: 0.8, ease: EASE, delay },
});

export function CTABanner() {
  return (
    <section className="bg-white dark:bg-[#241626] py-24 md:py-36" aria-labelledby="cta-banner">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <motion.h2
          id="cta-banner"
          className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            maxWidth: 'min(100%, 18ch)',
          }}
          {...fadeUp(0)}
        >
          Tell us the one thing that is{' '}
          <span className="accent-italic">stuck</span>.
        </motion.h2>

        <motion.p
          className="mt-7 font-sans font-normal text-text-secondary dark:text-brand-cream/65 leading-[1.55]"
          style={{
            fontSize: 'clamp(1.0625rem, 1.35vw, 1.25rem)',
            maxWidth: 'min(100%, 52ch)',
          }}
          {...fadeUp(0.1)}
        >
          A thirty-minute call with the two people who would do the work. You leave
          knowing whether we can move it and what it would cost.
        </motion.p>

        <motion.div {...fadeUp(0.24)}>
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <RollButton
              href={INTRO_CALL_URL}
              label={INTRO_CALL_LABEL}
              external
              umamiEvent="cta_banner"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
