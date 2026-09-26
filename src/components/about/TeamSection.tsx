'use client';

import Image from 'next/image';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SpringCard } from '@/components/ui/SpringCard';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { team } from '@/data/team';

export function TeamSection() {
  return (
    <section
      className="bg-white dark:bg-[#241626] py-20 sm:py-24 lg:py-32"
      aria-labelledby="team-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              4
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              The founders
            </span>
          </div>
        </FadeUp>

        <ScrollReveal direction="up" delay={0.06}>
          <h2
            id="team-heading"
            className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.1] tracking-[-0.02em] max-w-[20ch]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)' }}
          >
            Senior hands. No juniors.{' '}
            <span
              className="text-brand-accent-on-light dark:text-brand-accent"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
            >
              No hand-offs.
            </span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.12}>
          <p
            className="mt-6 text-text-secondary dark:text-brand-cream/70 leading-[1.65] max-w-[58ch]"
            style={{ fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)' }}
          >
            Itqan is run by its two co-founders. The people who pitch your work are
            the people who build it. Strategy, design, engineering and story &mdash;
            with a senior bench when a project needs more hands.
          </p>
        </ScrollReveal>

        {/* Founder cards — the two co-founders, equal weight */}
        <StaggerContainer
          stagger={0.1}
          delay={0.18}
          className="mt-12 lg:mt-16 grid sm:grid-cols-2 gap-6 md:gap-8 max-w-[760px]"
        >
          {team.map(({ id, name, role, image, objectPosition, website }) => (
            <StaggerItem key={id}>
              <SpringCard>
                <div className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white dark:border-brand-cream/[0.12] dark:bg-[#2a1a28] shadow-[0_2px_12px_rgba(47,28,44,0.06)]">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${name}, ${role} at Itqan Studio`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ objectPosition: objectPosition ?? 'top' }}
                      sizes="(max-width: 640px) 100vw, 380px"
                    />
                  </div>
                  <div className="px-6 py-5 border-t border-black/[0.08] dark:border-brand-cream/[0.12]">
                    <p className="font-sans font-semibold text-text-primary dark:text-brand-cream text-base">
                      {website ? (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-current dark:decoration-brand-cream/30"
                        >
                          {name}
                        </a>
                      ) : (
                        name
                      )}
                    </p>
                    <p className="text-text-secondary dark:text-brand-cream/55 text-sm mt-0.5">
                      {role}
                    </p>
                  </div>
                </div>
              </SpringCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
