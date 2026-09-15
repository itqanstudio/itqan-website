'use client';

import { motion } from 'framer-motion';
import { RollButton } from '@/components/ui/RollButton';

/**
 * The closer — a private, senior conversation. No badge (it ends the page).
 * Carries the page's single AI-moment: an honest, in-voice line that the
 * machines are already answering, echoing the hero. Light-first, dark-aware.
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
          Make the call you can&apos;t afford to get{' '}
          <span className="accent-italic">wrong</span>.
        </motion.h2>

        <motion.p
          className="mt-7 font-sans font-normal text-text-secondary dark:text-brand-cream/65 leading-[1.55]"
          style={{
            fontSize: 'clamp(1.0625rem, 1.35vw, 1.25rem)',
            maxWidth: 'min(100%, 52ch)',
          }}
          {...fadeUp(0.1)}
        >
          A private conversation with the people who will do the work. No funnel.
          No junior on the other end.
        </motion.p>

        {/* AI-moment — honest, in-voice; the machines are already answering. */}
        <motion.p
          className="mt-6 font-sans text-[0.9375rem] md:text-[1rem] text-text-secondary/80 dark:text-brand-cream/50 leading-[1.5]"
          style={{ maxWidth: 'min(100%, 52ch)' }}
          {...fadeUp(0.16)}
        >
          The machines are already answering. The work is making sure your name is
          in the reply.
        </motion.p>

        <motion.div {...fadeUp(0.24)}>
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            {/* Single CTA — a private, senior conversation (no lead-funnel tripwire) */}
            <RollButton href="/contact" label="Start a conversation" umamiEvent="cta_banner" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
