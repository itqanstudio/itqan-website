'use client';

import { Link } from 'next-view-transitions';
import { ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SplitText } from '@/components/ui/SplitText';
import { TextReveal } from '@/components/ui/TextReveal';
import { FadeUp } from '@/components/ui/FadeUp';
import { drawVariants, EASE_OUT_EXPO, SPRING_BOUNCY, SPRING_SNAPPY } from '@/lib/motion';

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...SPRING_BOUNCY, delay: 0.1 }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="text-brand-accent-on-light dark:text-brand-accent"
      >
        <motion.circle
          cx="28"
          cy="28"
          r="26"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          variants={drawVariants({ duration: 0.6, delay: 0.2 })}
          initial="hidden"
          animate="visible"
        />
        <motion.path
          d="M17 28.5L24.5 36L39 21"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={drawVariants({ duration: 0.4, delay: 0.6 })}
          initial="hidden"
          animate="visible"
        />
      </svg>
    </motion.div>
  );
}

export function ThankYouClient() {
  return (
    <section className="bg-brand-cream dark:bg-[#1f1420] min-h-[100dvh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-8">
          <AnimatedCheckmark />
        </div>

        <h1 className="font-sans font-bold text-4xl md:text-5xl text-brand-dark dark:text-brand-cream leading-tight tracking-tight">
          <SplitText text="Message received!" stagger={0.04} delay={0.7} />
        </h1>

        <TextReveal direction="up" delay={1.0} as="p">
          <span className="font-serif italic text-4xl md:text-5xl text-brand-accent-on-light dark:text-brand-accent leading-tight tracking-tight mt-2 block">
            We&apos;ll be in touch soon.
          </span>
        </TextReveal>

        <FadeUp delay={1.2}>
          <p className="mt-7 text-text-secondary dark:text-brand-cream/70 text-base leading-relaxed">
            Thank you for reaching out. We&apos;ll review your message and get back to you within
            48 hours. Looking forward to working together.
          </p>
        </FadeUp>

        <FadeUp delay={1.4}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity duration-200"
              >
                Back to home
                <ArrowRight size={14} weight="bold" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
            >
              <Link
                href="/work"
                className="inline-flex items-center gap-2 border border-brand-dark/25 text-brand-dark dark:border-brand-cream/30 dark:text-brand-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-dark hover:text-brand-cream dark:hover:bg-brand-cream dark:hover:text-brand-dark dark:hover:border-brand-cream transition-colors duration-200"
              >
                View our work
                <ArrowRight size={14} weight="bold" />
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
