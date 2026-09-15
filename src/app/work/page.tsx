import type { Metadata } from 'next';
import { FadeUp } from '@/components/ui/FadeUp';
import { WorkGrid } from '@/components/work/WorkGrid';
import { projects } from '@/data/projects';
import { caseStudies } from '@/data/case-studies';
import { JsonLd } from '@/components/seo/JsonLd';
import { workCollectionLd, breadcrumbLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Our Work — Brand, Web, Product & Automation Case Studies',
  description:
    'Case studies from Itqan Studio, a Dubai design and AI agency — brand identity, websites, product UX, full-stack builds and AI automation delivered for founders in Dubai and beyond.',
  path: '/work',
});

export default function WorkPage() {
  return (
    <>
      {/* ItemList is built from caseStudies — the same source /work/[id] uses — so
          it can never link to a slug without a detail page. */}
      <JsonLd data={workCollectionLd(caseStudies)} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ])}
      />
      {/* Header — Axion treatment */}
      <section
        className="bg-brand-cream dark:bg-[#1f1420] pt-10 md:pt-16 pb-12 md:pb-16"
        aria-label="Work page header"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          {/* Numbered badge row */}
          <FadeUp>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
                1
              </span>
              <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
                Selected work
              </span>
            </div>
          </FadeUp>

          {/* Heading */}
          <FadeUp delay={0.06}>
            <h1
              className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', maxWidth: '18ch' }}
            >
              The work speaks{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
              >
                first
              </span>
              .
            </h1>
          </FadeUp>

          {/* AI-moment line — one per page, in-voice */}
          <FadeUp delay={0.12}>
            <p className="mt-6 text-[0.9375rem] sm:text-[1.0625rem] leading-[1.6] text-text-secondary dark:text-brand-cream/70 max-w-[52ch]">
              When a buyer asks an AI who to trust with their brand, this is the
              evidence that answers.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Filter + Project grid */}
      <section
        className="bg-white dark:bg-[#241626] pb-20 md:pb-28 pt-10 md:pt-14"
        aria-label="Project portfolio"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          <WorkGrid projects={projects} />
        </div>
      </section>
    </>
  );
}
