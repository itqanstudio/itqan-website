'use client';

import { motion } from 'framer-motion';
import { FadeUp } from '@/components/ui/FadeUp';
import { useDecorativeVideo } from '@/lib/use-decorative-video';

/**
 * The team in the room — senior hands, no hand-offs. The statement uses the
 * theme-adaptive .stats-gradient (solid mauve on light, gradient on dark).
 * Light-first, dark-aware (badge 8).
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: EASE, delay },
});

const fadeUpStatement = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function Portrait() {
  const portraitVideo = useDecorativeVideo<HTMLVideoElement>();
  return (
    <section className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-24 md:py-36" aria-labelledby="portrait-statement">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-12 md:mb-16">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              8
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              The team in the room
            </span>
          </div>
        </FadeUp>

        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Left column — video (50% on desktop) */}
          <motion.div
            className="w-full md:w-[50%] flex justify-center"
            {...fadeUp(0)}
          >
            <div
              className="portrait-video-wrapper relative w-full overflow-hidden rounded-[12px] bg-black/[0.06] dark:bg-white/[0.04]"
              style={{
                maxWidth: 'min(100%, 620px)',
              }}
            >
              <video
                ref={portraitVideo}
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/founder-poster.jpg"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/videos/portrait-sill.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>

          {/* Right column — Identity statement (50% on desktop) */}
          <div className="w-full md:w-[50%] flex flex-col justify-center">
            {/* Identity statement */}
            <motion.div {...fadeUpStatement(0.1)}>
              <blockquote id="portrait-statement">
                <p
                  className="stats-gradient font-sans font-bold leading-[1.1] tracking-[-0.02em]"
                  style={{
                    fontSize: 'clamp(2rem, 3.6vw, 3.25rem)',
                    maxWidth: 'min(100%, 18ch)',
                  }}
                >
                  Senior hands.{' '}
                  <span
                    style={{
                      fontFamily: "var(--font-serif), serif",
                      fontStyle: 'italic',
                      fontWeight: 500,
                    }}
                  >
                    No hand-offs.
                  </span>
                </p>
              </blockquote>
            </motion.div>

            {/* Supporting line */}
            <motion.p
              className="mt-7 font-sans font-normal text-text-secondary dark:text-brand-cream/70 leading-[1.6]"
              style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                maxWidth: 'min(100%, 46ch)',
              }}
              {...fadeUpStatement(0.18)}
            >
              Ibrahim Shareef, CEO and co-founder &mdash; engineer, designer and storyteller
              in one. With co-founder Bisma Aslam leading design, the people who pitch your
              work are the people who build it. No juniors. No relay race.
            </motion.p>

            <motion.p
              className="mt-7 font-sans font-medium text-[0.8125rem] text-text-secondary/80 dark:text-brand-cream/45"
              style={{ letterSpacing: '0.02em' }}
              {...fadeUpStatement(0.26)}
            >
              &mdash; Ibrahim Shareef, CEO &amp; Co-founder
            </motion.p>
          </div>

        </div>
      </div>
    </section>
  );
}
