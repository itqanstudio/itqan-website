'use client';

import Image from 'next/image';
import { Palette, Lightning, PencilSimpleLine } from '@phosphor-icons/react';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SpringCard } from '@/components/ui/SpringCard';

const values = [
  {
    Icon: Palette,
    title: 'Excellence in Craftsmanship',
    description:
      'The system still works at three locations and at ten. Built once, properly, so it compounds instead of decaying.',
    image: '/images/founder-render.png',
    alt: 'Itqan Studio brand craft',
  },
  {
    Icon: Lightning,
    title: 'Excellence in Precision',
    description:
      'Documented, traceable, tested. You can see what was decided, when, and why, and a future hire can run it from the handover doc.',
    image: '/images/portfolio/project-you/today.webp',
    alt: 'Project You — a calm life dashboard built by Itqan Studio',
  },
  {
    Icon: PencilSimpleLine,
    title: 'Excellence in Function',
    description:
      'Built for how your staff actually work, and shown working before the build starts.',
    image: '/images/portfolio/oud-closet/cover.png',
    alt: 'Oud Closet — luxury modest-fashion storefront designed by Itqan Studio',
  },
];

const directions: Array<'left' | 'up' | 'right'> = ['left', 'up', 'right'];

export function Values() {
  return (
    <section
      className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-20 sm:py-24 lg:py-32"
      aria-labelledby="values-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              3
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              How we work
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            id="values-heading"
            className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.1] tracking-[-0.02em] max-w-[20ch]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)' }}
          >
            Three ways we hold the line on{' '}
            <span
              className="text-brand-accent-on-light dark:text-brand-accent"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
            >
              excellence
            </span>
            .
          </h2>
        </FadeUp>

        <div className="mt-12 sm:mt-14 grid md:grid-cols-3 gap-5 sm:gap-6">
          {values.map(({ Icon, title, description, image, alt }, i) => (
            <ScrollReveal key={title} direction={directions[i]} distance={28} delay={0.08 + i * 0.09}>
              <SpringCard className="h-full">
                <div className="rounded-2xl p-7 sm:p-8 flex flex-col border border-black/[0.08] bg-white dark:border-brand-cream/[0.12] dark:bg-[#2a1a28] shadow-[0_2px_12px_rgba(47,28,44,0.06)] overflow-hidden h-full">
                  <Icon size={22} className="text-brand-accent-on-light dark:text-brand-accent mb-5" />
                  <h3 className="font-sans font-semibold text-xl text-text-primary dark:text-brand-cream leading-snug mb-4">
                    {title}
                  </h3>
                  <p className="text-text-secondary dark:text-brand-cream/65 text-sm leading-relaxed flex-1">
                    {description}
                  </p>
                  <div className="mt-7 relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image src={image} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                  </div>
                </div>
              </SpringCard>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
