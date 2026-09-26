import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BehanceLogo,
  CheckCircle,
  Quotes,
} from '@phosphor-icons/react/dist/ssr';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { CoverMedia } from '@/components/ui/CoverMedia';
import { JsonLd } from '@/components/seo/JsonLd';
import { caseStudyLd, breadcrumbLd, SITE_NAME } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';
import {
  caseStudies,
  getCaseStudy,
  getAdjacentProjects,
  type CaseStudy,
  type CaseStudyPhase,
  type FounderPillar,
} from '@/data/case-studies';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ id: cs.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cs = getCaseStudy(params.id);
  if (!cs) {
    return { title: 'Project Not Found', robots: { index: false, follow: false } };
  }
  /*
   * Short title, subtitle-plus-outcome description, and a twitter block of its
   * own. The old title appended the whole scope line (82 to 99 characters), the
   * description was the bare metric, and with no twitter block the page
   * inherited the HOME page's twitter:title and twitter:description.
   */
  const title = `${cs.title} case study`;
  const metric = (cs.outcomeMetric ?? cs.result).trim().replace(/\.\s*$/, '');
  return pageMetadata({
    title,
    description: clampDescription(`${cs.subtitle}. ${metric}.`),
    path: `/work/${cs.id}`,
    image: cs.coverImage,
    ogType: 'article',
    // "Itqan Studio CRM" already names the brand; skip the " | Itqan Studio" suffix.
    absoluteTitle: cs.title.includes(SITE_NAME),
  });
}

/** Cut at a word boundary so a snippet never ends mid-word. */
function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…`;
}

const PILLAR_META: Record<
  FounderPillar,
  { number: string; name: string; metaphor: string }
> = {
  identity: { number: '01', name: 'IDENTITY', metaphor: 'the soul' },
  system: { number: '02', name: 'SYSTEM', metaphor: 'the skeleton' },
  automation: { number: '03', name: 'AUTOMATION', metaphor: 'the heartbeat' },
};

export default function CaseStudyPage({ params }: Props) {
  const cs = getCaseStudy(params.id);
  if (!cs) notFound();

  const { next } = getAdjacentProjects(params.id);

  return (
    <>
      <JsonLd data={caseStudyLd(cs)} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: cs.title, path: `/work/${cs.id}` },
        ])}
      />

      {/* ── Header — centered, editorial ── */}
      <section
        className="bg-brand-cream dark:bg-[#1f1420] pt-10 md:pt-16 pb-10 md:pb-12"
        aria-label="Case study header"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 text-center">
          {/* Sector eyebrow */}
          <FadeUp>
            <p
              className="font-sans font-medium text-[0.75rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
              style={{ letterSpacing: '0.22em' }}
            >
              {cs.industry}
            </p>
          </FadeUp>

          {/* Client name */}
          <FadeUp delay={0.08}>
            <h1
              className="mt-6 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.02] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(3rem, 7.5vw, 6rem)' }}
            >
              {cs.title}
            </h1>
          </FadeUp>

          {/* Duration vs. industry average + live site link */}
          {(cs.duration || cs.liveUrl || (cs.links && cs.links.length > 0)) && (
            <FadeUp delay={0.14}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {cs.duration && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.8125rem] font-semibold text-brand-accent-on-light dark:text-brand-accent bg-brand-accent/[0.14] border border-brand-accent-on-light/25 dark:bg-[#2a1a28] dark:border-brand-accent/25">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent-on-light dark:bg-brand-accent" aria-hidden="true" />
                    Delivered in {cs.duration}
                  </div>
                )}

                {cs.duration && cs.industryAverage && (
                  <span className="text-[0.8125rem] text-text-secondary/60 dark:text-brand-cream/40">
                    industry average{' '}
                    <span className="line-through decoration-from-font">
                      {cs.industryAverage}
                    </span>
                  </span>
                )}

                {cs.liveUrl && (
                  <a
                    href={cs.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.8125rem] font-semibold text-text-primary hover:text-brand-accent-on-light dark:text-brand-cream dark:hover:text-brand-accent transition-colors duration-200 bg-white border border-black/[0.1] dark:bg-brand-accent/[0.12] dark:border-brand-accent/35"
                    aria-label={`Visit ${cs.title} live site (opens in new tab)`}
                  >
                    Visit live site
                    <ArrowUpRight
                      size={14}
                      weight="bold"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                )}

                {cs.links?.map((lnk) => {
                  const isBehance = lnk.href.includes('behance.net');
                  return (
                    <a
                      key={lnk.href}
                      href={lnk.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.8125rem] font-semibold text-text-primary hover:text-brand-accent-on-light dark:text-brand-cream dark:hover:text-brand-accent transition-colors duration-200 bg-white border border-black/[0.1] dark:bg-brand-accent/[0.12] dark:border-brand-accent/35"
                      aria-label={`${lnk.label} (opens in new tab)`}
                    >
                      {isBehance && (
                        <BehanceLogo size={15} weight="fill" aria-hidden="true" />
                      )}
                      {lnk.label}
                      <ArrowUpRight
                        size={14}
                        weight="bold"
                        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  );
                })}
              </div>
            </FadeUp>
          )}

          {/* Outcome metric — quantified headline */}
          {cs.outcomeMetric && (
            <FadeUp delay={0.2}>
              <p
                className="mt-6 mx-auto text-text-secondary dark:text-brand-cream/80 italic"
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontSize: 'clamp(1.0625rem, 1.4vw, 1.375rem)',
                  maxWidth: '52ch',
                }}
              >
                {cs.outcomeMetric}
              </p>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── Hero (video preferred, image fallback) ── */}
      <section
        className="bg-brand-cream dark:bg-[#1f1420] pb-16 md:pb-24"
        aria-label="Case study hero"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          <FadeUp delay={0.16}>
            <CaseStudyHero cs={cs} />
          </FadeUp>
        </div>
      </section>

      {/* ── At a glance ── */}
      <AtAGlance cs={cs} />

      {/* ── The Before (client's voice on the pain) ── */}
      {cs.beforeQuote && <BeforeBlock cs={cs} />}

      {/* ── The 90-day arc (phase-by-phase) ── */}
      {cs.phases && cs.phases.length > 0 && <PhaseArc phases={cs.phases} />}

      {/* ── The After (qualitative narrative) ── */}
      <AfterBlock cs={cs} />

      {/* ── What we shipped (mockup gallery) ── */}
      <section
        className="bg-white dark:bg-[#241626] py-20 md:py-24"
        aria-label="Project gallery"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          <FadeUp>
            <p
              className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent mb-10"
              style={{ letterSpacing: '0.22em' }}
            >
              What we shipped
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {cs.mockups.map((src, i) => (
              <FadeUp key={src} delay={0.08 + i * 0.08}>
                <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden">
                  <Image
                    src={src}
                    alt={`${cs.title} mockup ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand & character — optional, gated on brandShowcase ── */}
      {cs.brandShowcase && cs.brandShowcase.length > 0 && (
        <BrandShowcase title={cs.title} images={cs.brandShowcase} copy={cs.brandShowcaseCopy} />
      )}

      {/* ── Large testimonial ── */}
      <TestimonialBlock cs={cs} />

      {/* ── Next case study — full-bleed visual card ── */}
      {next && <NextCaseCard next={next} />}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Hero — video preferred, image fallback. Optional live-site CTA overlay.
// ────────────────────────────────────────────────────────────
function CaseStudyHero({ cs }: { cs: CaseStudy }) {
  return (
    <div
      className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-[14px] overflow-hidden bg-brand-dark"
      style={{ viewTransitionName: `case-cover-${cs.id}` }}
    >
      <CoverMedia
        src={cs.coverImage}
        video={cs.coverVideo}
        alt={cs.coverVideo ? `${cs.title} — animated cover` : `${cs.title} — ${cs.subtitle}`}
        priority
        sizes="100vw"
        cinematic
      />

      {cs.liveUrl && (
        <a
          href={cs.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute bottom-5 right-5 md:bottom-7 md:right-7 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.8125rem] md:text-[0.875rem] font-semibold text-brand-cream transition-colors duration-200 hover:text-brand-accent"
          style={{
            background: 'rgba(20, 12, 20, 0.7)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(204, 164, 194, 0.35)',
          }}
          aria-label={`Visit ${cs.title} live site (opens in new tab)`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
          Visit live site
          <ArrowUpRight
            size={15}
            weight="bold"
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// At a glance — 4-column stat strip
// ────────────────────────────────────────────────────────────
function AtAGlance({ cs }: { cs: CaseStudy }) {
  const stats: Array<{ label: string; value: string; emphasis?: boolean }> = [];

  if (cs.duration) stats.push({ label: 'Timeline', value: cs.duration });
  if (cs.scope) stats.push({ label: 'Scope', value: cs.scope });
  stats.push({ label: 'Industry', value: cs.industry });
  if (cs.stack) stats.push({ label: 'Stack', value: cs.stack });
  if (cs.outcomeMetric) {
    stats.push({ label: 'Outcome', value: cs.outcomeMetric, emphasis: true });
  }

  // 5-col grid on md: the emphasised Outcome spans 2 cols when there's room, else 1, so
  // any combination of the optional stats (duration / scope / stack) fills the row
  // without overflowing onto a second line.
  const baseCount = stats.filter((s) => !s.emphasis).length;
  const outcomeSpansTwo = baseCount <= 3;

  return (
    <section
      className="bg-white dark:bg-[#241626] py-12 md:py-16"
      aria-label="Engagement at a glance"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-px rounded-[14px] overflow-hidden bg-black/[0.08] dark:bg-brand-cream/[0.08]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`bg-[#f5efe6] dark:bg-[#2a1a28] p-6 md:p-7 ${
                  stat.emphasis
                    ? `sm:col-span-2 ${outcomeSpansTwo ? 'md:col-span-2' : 'md:col-span-1'} bg-brand-accent/[0.1] dark:bg-brand-accent/[0.08]`
                    : ''
                }`}
              >
                <p
                  className={`text-[0.625rem] font-bold tracking-[0.22em] uppercase ${
                    stat.emphasis
                      ? 'text-brand-accent-on-light dark:text-brand-accent'
                      : 'text-text-secondary/70 dark:text-brand-cream/45'
                  }`}
                >
                  {stat.label}
                </p>
                <p
                  className={`mt-3 text-text-primary dark:text-brand-cream leading-[1.4] font-medium ${
                    stat.emphasis
                      ? 'text-[1.125rem] md:text-[1.3125rem]'
                      : 'text-[0.9375rem] md:text-[1rem]'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Before — client's voice on the pain, large editorial blockquote
// ────────────────────────────────────────────────────────────
function BeforeBlock({ cs }: { cs: CaseStudy }) {
  return (
    <section
      className="relative bg-[#f5efe6] dark:bg-[#1a0f1c] py-24 md:py-32 overflow-hidden"
      aria-labelledby="before-heading"
    >
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(109,74,102,0.08), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(204,164,194,0.06), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          <FadeUp>
            <p
              id="before-heading"
              className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
              style={{ letterSpacing: '0.22em' }}
            >
              Before Itqan
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="mt-7 flex items-start gap-5 md:gap-8">
              <Quotes
                size={48}
                weight="fill"
                className="text-brand-accent-on-light/35 dark:text-brand-accent/35 flex-shrink-0 -mt-2 md:-mt-3"
              />
              <blockquote>
                <p
                  className="text-text-primary dark:text-brand-cream/90 leading-[1.35] tracking-[-0.01em]"
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.625rem, 3vw, 2.5rem)',
                  }}
                >
                  {cs.beforeQuote}
                </p>
                {cs.challenge && (
                  <p className="mt-7 text-text-secondary dark:text-brand-cream/55 text-[1rem] md:text-[1.0625rem] leading-[1.65] max-w-[64ch]">
                    {cs.challenge}
                  </p>
                )}
              </blockquote>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Phase arc — only renders the pillars that were in scope
// ────────────────────────────────────────────────────────────
function PhaseArc({ phases }: { phases: CaseStudyPhase[] }) {
  return (
    <section
      className="bg-white dark:bg-[#241626] py-24 md:py-32"
      aria-labelledby="phase-arc-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <FadeUp>
          <p
            className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
            style={{ letterSpacing: '0.22em' }}
          >
            The bridge
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            id="phase-arc-heading"
            className="mt-6 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', maxWidth: '22ch' }}
          >
            What we{' '}
            <span className="accent-italic">actually built.</span>
          </h2>
        </FadeUp>

        <div className="mt-14 md:mt-20 grid gap-px bg-black/[0.08] dark:bg-brand-cream/[0.08] rounded-[14px] overflow-hidden">
          {phases.map((phase, i) => (
            <ScrollReveal key={phase.pillar} direction="up" distance={20} delay={i * 0.08}>
              <PhaseRow phase={phase} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhaseRow({ phase }: { phase: CaseStudyPhase }) {
  const meta = PILLAR_META[phase.pillar];
  return (
    <article className="bg-[#f5efe6] dark:bg-[#2a1a28] p-7 md:p-10 lg:p-12">
      <div className="grid md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-start">
        {/* Left — pillar identity */}
        <div>
          <div className="flex items-baseline justify-between md:justify-start md:gap-5">
            <span
              className="font-sans font-medium text-brand-accent-on-light/40 dark:text-brand-accent/40 tabular-nums leading-none"
              style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}
            >
              {meta.number}
            </span>
            <span className="text-[0.625rem] font-bold tracking-[0.22em] uppercase text-text-secondary/70 dark:text-brand-cream/45">
              {phase.days}
            </span>
          </div>
          <h3
            className="mt-5 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(1.625rem, 2.4vw, 2.125rem)' }}
          >
            {meta.name}
          </h3>
        </div>

        {/* Right — deliverables */}
        <ul role="list" className="space-y-3.5 md:pt-2">
          {phase.deliverables.map((deliverable) => (
            <li
              key={deliverable}
              className="flex items-start gap-3 text-text-secondary dark:text-brand-cream/85 text-[0.9375rem] md:text-[1.0625rem] leading-[1.5]"
            >
              <CheckCircle
                size={18}
                weight="fill"
                className="text-brand-accent-on-light/75 dark:text-brand-accent/75 mt-[0.15em] flex-shrink-0"
              />
              <span>{deliverable}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// After — qualitative narrative
// ────────────────────────────────────────────────────────────
function AfterBlock({ cs }: { cs: CaseStudy }) {
  return (
    <section
      className="relative bg-[#f5efe6] dark:bg-[#1a0f1c] py-24 md:py-32 overflow-hidden"
      aria-labelledby="after-heading"
    >
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(109,74,102,0.08), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(204,164,194,0.06), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          <FadeUp>
            <p
              id="after-heading"
              className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
              style={{ letterSpacing: '0.22em' }}
            >
              After
            </p>
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              className="mt-6 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', maxWidth: '22ch' }}
            >
              From invisible to{' '}
              <span className="accent-italic">inevitable.</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p
              className="mt-10 text-text-secondary dark:text-brand-cream/80 leading-[1.7]"
              style={{
                fontSize: 'clamp(1.0625rem, 1.3vw, 1.1875rem)',
                maxWidth: '64ch',
              }}
            >
              {cs.result}
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Brand & character — optional showcase (brand cover + mascot system).
// Renders only when cs.brandShowcase has images. On-brand dark section;
// reuses the gallery's framing so it sits naturally after "What we shipped".
// ────────────────────────────────────────────────────────────
// Defaults preserve the copy this section shipped with (written for Mutqin), so entries
// without brandShowcaseCopy render exactly as before.
const BRAND_SHOWCASE_DEFAULT_COPY = {
  eyebrow: 'Brand & character',
  title: { lead: 'A product with a', accent: 'face.' },
  body: 'The personality is built with the product, not added after — a brand kit, an in-repo design system, and Mu, a six-pose companion who asks the questions. That is the Itqan standard.',
};

function BrandShowcase({
  title,
  images,
  copy = BRAND_SHOWCASE_DEFAULT_COPY,
}: {
  title: string;
  images: string[];
  copy?: typeof BRAND_SHOWCASE_DEFAULT_COPY;
}) {
  return (
    <section
      className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-20 md:py-24"
      aria-labelledby="brand-showcase-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <FadeUp>
          <p
            className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
            style={{ letterSpacing: '0.22em' }}
          >
            {copy.eyebrow}
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            id="brand-showcase-heading"
            className="mt-6 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', maxWidth: '20ch' }}
          >
            {copy.title.lead} <span className="accent-italic">{copy.title.accent}</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p
            className="mt-6 text-text-secondary dark:text-brand-cream/70 leading-[1.65]"
            style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)', maxWidth: '58ch' }}
          >
            {copy.body}
          </p>
        </FadeUp>

        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-4 md:gap-5">
          {images.map((src, i) => (
            <FadeUp key={src} delay={0.08 + i * 0.08}>
              <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden">
                <Image
                  src={src}
                  alt={`${title} brand and character — view ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Testimonial — large, photo-forward
// ────────────────────────────────────────────────────────────
function TestimonialBlock({ cs }: { cs: CaseStudy }) {
  return (
    <section
      className="relative bg-brand-cream dark:bg-[#1f1420] py-28 md:py-40 overflow-hidden"
      aria-label="Client testimonial"
    >
      {/* Soft accent gravity */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(109,74,102,0.08), transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(204,164,194,0.08), transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="grid md:grid-cols-[176px_1fr] gap-8 md:gap-14 items-start">
            {/* Avatar — bigger, framed */}
            <div className="md:pt-3">
              {cs.testimonialImage ? (
                <div className="relative w-32 h-32 md:w-[176px] md:h-[176px] rounded-full overflow-hidden ring-2 ring-brand-accent-on-light/25 dark:ring-brand-accent/25">
                  <Image
                    src={cs.testimonialImage}
                    alt={cs.testimonialName}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-[176px] md:h-[176px] rounded-full bg-brand-accent/[0.12] border border-brand-accent-on-light/25 dark:bg-brand-accent/[0.08] dark:border-brand-accent/25 flex items-center justify-center">
                  <Quotes size={52} weight="fill" className="text-brand-accent-on-light/65 dark:text-brand-accent/65" />
                </div>
              )}
            </div>

            {/* Quote — larger, wall-pull-quote scale */}
            <blockquote>
              <Quotes
                size={42}
                weight="fill"
                className="text-brand-accent-on-light/35 dark:text-brand-accent/35 mb-5"
              />
              <p
                className="font-sans font-normal text-text-primary dark:text-brand-cream leading-[1.35] tracking-[-0.01em]"
                style={{ fontSize: 'clamp(1.625rem, 3vw, 2.5rem)' }}
              >
                {cs.testimonialQuote}
              </p>
              <footer className="mt-10 pt-6 border-t border-black/[0.1] dark:border-brand-cream/[0.1]">
                <p className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.0625rem]">
                  {cs.testimonialName}
                </p>
                <p className="text-text-secondary dark:text-brand-cream/55 text-[0.875rem] mt-1">
                  {cs.testimonialCompany}
                </p>
              </footer>
            </blockquote>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Next case study — full-bleed visual hand-off
// ────────────────────────────────────────────────────────────
function NextCaseCard({ next }: { next: CaseStudy }) {
  return (
    <section
      className="relative bg-white dark:bg-[#241626] pt-16 md:pt-24 pb-16 md:pb-24"
      aria-label="Next case study"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <FadeUp>
          <p
            className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent mb-6"
            style={{ letterSpacing: '0.22em' }}
          >
            Next case study
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <Link
            href={`/work/${next.id}`}
            className="group relative block overflow-hidden rounded-[14px]"
          >
            <div
              className="relative w-full aspect-[16/9] md:aspect-[21/9]"
              style={{ viewTransitionName: `case-cover-${next.id}` }}
            >
              <CoverMedia
                src={next.coverImage}
                video={next.coverVideo}
                alt={next.title}
                sizes="100vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                <p
                  className="text-[0.6875rem] font-bold tracking-[0.22em] uppercase text-brand-accent mb-3"
                >
                  {next.industry}
                </p>
                <h3
                  className="font-sans font-semibold text-brand-cream leading-[1.02] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
                >
                  {next.title}
                </h3>
                {next.outcomeMetric && (
                  <p
                    className="mt-3 text-brand-cream/75 italic"
                    style={{
                      fontFamily: "var(--font-serif), serif",
                      fontSize: 'clamp(1rem, 1.25vw, 1.1875rem)',
                      maxWidth: '52ch',
                    }}
                  >
                    {next.outcomeMetric}
                  </p>
                )}
                <div className="mt-7 inline-flex items-center gap-2 text-brand-cream/85 text-[0.9375rem] font-medium">
                  <span>Read the case</span>
                  <ArrowRight
                    size={15}
                    weight="bold"
                    className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                  />
                </div>
              </div>
            </div>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
