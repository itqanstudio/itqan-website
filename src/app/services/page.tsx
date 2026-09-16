import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { CheckCircle, X } from '@phosphor-icons/react/dist/ssr';
import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RollButton } from '@/components/ui/RollButton';
import { CTABanner } from '@/components/home/CTABanner';
import { ServiceFAQ, SERVICE_FAQ } from '@/components/services/ServiceFAQ';
import { JsonLd } from '@/components/seo/JsonLd';
import { servicesGraphLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { INTRO_CALL_URL, INTRO_CALL_LABEL, SESSION_URL } from '@/lib/booking';

export const metadata: Metadata = pageMetadata({
  title: 'How we work. Four steps, and the price of each',
  description:
    'Intro call free, the Session $750 with a written map you keep, a build quoted from that map, then Care or Partner after go-live. Prices said out loud before anything is booked.',
  path: '/services',
});

/** Section badge — dark circle number + bordered pill label (Axion pattern from IntroPartner). */
function SectionBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
        {n}
      </span>
      <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
        {label}
      </span>
    </div>
  );
}

interface Step {
  number: string;
  name: string;
  gets: string;
  /**
   * One price per rung, never a range and never "starting from".
   *
   * The build rung deliberately carries no figure: it is quoted from the map,
   * and the two scope prices (Starter, Core) are still an open decision in
   * ITQAN-POSITIONING-ICP-AND-SITE-COPY-v2.md section 5. Do not fill them in
   * with a converted number, put the agreed USD figures here when they exist.
   */
  price: string;
  time: string;
  /** Off-site booking link, where the rung can be booked directly. */
  href?: string;
  cta?: string;
}

const steps: Step[] = [
  {
    number: '01',
    name: 'Intro call',
    gets: 'Thirty minutes. The one thing that is stuck, and an honest answer on whether we can move it.',
    price: 'Free',
    time: '30 minutes',
    href: INTRO_CALL_URL,
    cta: 'Book the intro call',
  },
  {
    number: '02',
    name: 'The Session',
    gets: 'Ninety minutes of questions, then a written map: what leaks, what to fix first, in what order, what each step should cost. You keep it either way.',
    price: '$750, fixed. Half credits toward a build.',
    time: '1 week',
    href: SESSION_URL,
    cta: 'Book the Session',
  },
  {
    number: '03',
    name: 'The build',
    gets: 'One live system your team runs on, released in stages, on hosting we set up and hand over.',
    price:
      'Fixed price, quoted from the map. Half to start, half at go-live.',
    time: 'Starter 3 weeks, Core 6 weeks',
  },
  {
    number: '04',
    name: 'We stay',
    gets: 'Care, or Partner. The table below says exactly what each one covers.',
    price: 'Care $450 a month. Partner $3,000 a month.',
    time: 'Ongoing',
  },
];

const sessionGives = [
  'How the work runs today, in your words.',
  'Where it leaks, with what it costs you each week.',
  'What to fix first, second and third, and why in that order.',
  'What each step should cost, so you can price the whole path before you spend another dirham or krona.',
  'What you can do yourself without us.',
];

const buildIncludes = [
  'The front: website, booking or intake.',
  'The back: calendar, customers, quotes, contracts, invoices.',
  'The automation between them.',
  'Hosting set up in your own account and handed over.',
  'Documentation a future hire can run from.',
  'Releases in stages, tests before every release.',
];

const buildExcludes = [
  'Paid ads and media buying.',
  'A logo with nothing behind it.',
  'A discovery phase that produces a deck.',
  'Work outside the agreed scope. A second system is a second quote from the same map.',
];

interface ContinuityRow {
  label: string;
  care: string;
  partner: string;
}

const continuity: ContinuityRow[] = [
  { label: 'Hosting, backups, monitoring', care: 'Yes', partner: 'Yes' },
  {
    label: 'Changes',
    care: 'Up to four hours a month',
    partner: 'Three engineering days a month, extra days quoted',
  },
  {
    label: 'Cadence',
    care: 'Written requests, monthly status line',
    partner: 'Weekly sixty-minute working call, monthly written review',
  },
  {
    label: 'Scope',
    care: 'Keep it running and current',
    partner: 'The next bottleneck each quarter: copy, site, systems, automation',
  },
  { label: 'Term', care: 'Three months, then month to month', partner: 'Month to month, thirty days notice' },
  {
    label: 'Ending',
    care: 'Full handover of accounts and credentials within thirty days',
    partner: 'Same',
  },
  { label: 'Price', care: '$450 a month', partner: '$3,000 a month' },
];

const refusals = [
  'Paid ads.',
  'Logo-only jobs.',
  'Retainers before a diagnosis.',
  'Gambling, alcohol, adult content and interest-based finance.',
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={servicesGraphLd()} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'How we work', path: '/services' },
        ])}
      />
      <JsonLd data={faqLd(SERVICE_FAQ)} />

      {/* ── 1 · Header ── */}
      <section
        className="relative bg-brand-cream dark:bg-[#1f1420] pt-10 md:pt-16 pb-16 md:pb-24 overflow-hidden"
        aria-label="How we work"
      >
        <div
          className="absolute inset-0 pointer-events-none dark:hidden"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 15% 25%, rgba(204,164,194,0.20), transparent 60%), radial-gradient(ellipse 55% 50% at 90% 80%, rgba(209,194,165,0.16), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none hidden dark:block"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 15% 25%, rgba(204,164,194,0.12), transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={1} label="How we work" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h1
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.04] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5.5rem)', maxWidth: '16ch' }}
            >
              Four steps, no{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: 'var(--font-serif), serif', fontStyle: 'italic', fontWeight: 500 }}
              >
                mystery
              </span>
              .
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p
              className="mt-7 sm:mt-8 text-[#4a4a4a] dark:text-brand-cream/75 leading-[1.6] max-w-[52ch]"
              style={{ fontSize: 'clamp(1.0625rem, 1.35vw, 1.25rem)' }}
            >
              Prices are said out loud before anything is booked. You can stop after step
              two and still keep everything you paid for.
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="mt-9 sm:mt-11">
              <RollButton href={INTRO_CALL_URL} label={INTRO_CALL_LABEL} external />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 2 · The four steps ── */}
      <section className="bg-white dark:bg-[#241626] py-16 md:py-24" aria-labelledby="steps-heading">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={2} label="The four steps" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              id="steps-heading"
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', maxWidth: '22ch' }}
            >
              What each step costs, and how long it{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: 'var(--font-serif), serif', fontStyle: 'italic', fontWeight: 500 }}
              >
                takes
              </span>
              .
            </h2>
          </FadeUp>

          <div className="mt-12 md:mt-16 border-t border-black/[0.1] dark:border-brand-cream/[0.1]">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} direction="up" distance={20} delay={i * 0.05}>
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 md:gap-12 py-8 md:py-10 border-b border-black/[0.1] dark:border-brand-cream/[0.1]">
                  {/* Left — the step */}
                  <div className="flex gap-5">
                    <span
                      className="font-sans font-medium text-brand-accent-on-light/40 dark:text-brand-accent/40 tabular-nums leading-none flex-shrink-0"
                      style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)' }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.1875rem] md:text-[1.375rem] leading-[1.2]">
                        {step.name}
                      </h3>
                      <p className="mt-2.5 text-text-secondary dark:text-brand-cream/55 text-[0.9375rem] md:text-[1rem] leading-[1.55] max-w-[44ch]">
                        {step.gets}
                      </p>
                    </div>
                  </div>

                  {/* Right — price and time */}
                  <div className="md:pl-8 md:border-l border-black/[0.08] dark:border-brand-cream/[0.08]">
                    <p className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-brand-accent-on-light dark:text-brand-accent">
                      Price
                    </p>
                    <p className="mt-2 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] md:text-[1.0625rem] leading-[1.6] max-w-[44ch]">
                      {step.price}
                    </p>

                    <p className="mt-5 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-text-secondary/70 dark:text-brand-cream/45">
                      Time
                    </p>
                    <p className="mt-2 text-text-secondary dark:text-brand-cream/70 text-[0.9375rem] leading-[1.55]">
                      {step.time}
                    </p>

                    {step.href && step.cta && (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="press-scale mt-4 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-text-primary dark:text-brand-cream underline underline-offset-[6px] decoration-brand-accent-on-light/50 dark:decoration-brand-accent/50 hover:decoration-brand-accent-on-light dark:hover:decoration-brand-accent"
                      >
                        {step.cta}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <FadeUp delay={0.1}>
            <p
              className="mt-10 text-text-primary dark:text-brand-cream font-medium"
              style={{ fontSize: 'clamp(1.0625rem, 1.3vw, 1.25rem)' }}
            >
              We do not discount. We change scope.
            </p>
          </FadeUp>

          {/* The guarantee sits with the prices it applies to */}
          <FadeUp delay={0.16}>
            <p
              className="mt-6 italic text-text-secondary/75 dark:text-brand-cream/50 leading-[1.6]"
              style={{
                fontFamily: 'var(--font-serif), serif',
                fontSize: '1rem',
                maxWidth: '62ch',
              }}
            >
              Every deliverable has a date. Miss a date and the work extends at no charge
              until it ships. We never guarantee your revenue or your leads. We guarantee
              what we build, and when.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 3 · What the Session gives you, and what a build includes ── */}
      <section
        className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-16 md:py-24"
        aria-labelledby="scope-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={3} label="What you get" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              id="scope-heading"
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', maxWidth: '20ch' }}
            >
              A map, not a{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: 'var(--font-serif), serif', fontStyle: 'italic', fontWeight: 500 }}
              >
                deck
              </span>
              .
            </h2>
          </FadeUp>

          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* The Session */}
            <ScrollReveal direction="up" distance={24}>
              <div className="h-full rounded-[14px] border border-black/[0.08] dark:border-brand-cream/[0.08] bg-white dark:bg-[#2a1a28] p-7 md:p-9">
                <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[0.9375rem] tracking-[0.02em] uppercase mb-6">
                  What the Session gives you
                </h3>
                <ul role="list" className="space-y-3.5">
                  {sessionGives.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] leading-[1.55]"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        aria-hidden="true"
                        className="mt-[0.2em] flex-shrink-0 text-brand-accent-on-light dark:text-brand-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Build includes */}
            <ScrollReveal direction="up" distance={24} delay={0.08}>
              <div className="h-full rounded-[14px] border border-black/[0.08] dark:border-brand-cream/[0.08] bg-white dark:bg-[#2a1a28] p-7 md:p-9">
                <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[0.9375rem] tracking-[0.02em] uppercase mb-6">
                  What a build includes
                </h3>
                <ul role="list" className="space-y-3.5">
                  {buildIncludes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] leading-[1.55]"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        aria-hidden="true"
                        className="mt-[0.2em] flex-shrink-0 text-brand-accent-on-light dark:text-brand-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Not included */}
            <ScrollReveal direction="up" distance={24} delay={0.16}>
              <div className="h-full rounded-[14px] border border-black/[0.06] dark:border-brand-cream/[0.06] bg-white/60 dark:bg-[#241626] p-7 md:p-9">
                <h3 className="font-sans font-semibold text-text-secondary dark:text-brand-cream/55 text-[0.9375rem] tracking-[0.02em] uppercase mb-6">
                  Not included
                </h3>
                <ul role="list" className="space-y-3.5">
                  {buildExcludes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-text-secondary dark:text-brand-cream/50 text-[0.9375rem] leading-[1.55]"
                    >
                      <X
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className="mt-[0.3em] flex-shrink-0 text-text-secondary/50 dark:text-brand-cream/30"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 4 · Care or Partner ── */}
      <section
        className="bg-white dark:bg-[#241626] py-16 md:py-24"
        aria-labelledby="continuity-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={4} label="After go-live" />
          </FadeUp>

          <FadeUp delay={0.06}>
            <h2
              id="continuity-heading"
              className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', maxWidth: '20ch' }}
            >
              Care, or{' '}
              <span
                className="text-brand-accent-on-light dark:text-brand-accent"
                style={{ fontFamily: 'var(--font-serif), serif', fontStyle: 'italic', fontWeight: 500 }}
              >
                Partner
              </span>
              .
            </h2>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div className="mt-12 md:mt-16 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">
                  Care and Partner compared, line by line
                </caption>
                <thead>
                  <tr className="border-b border-black/[0.14] dark:border-brand-cream/[0.14]">
                    <th scope="col" className="py-4 pr-6 w-[28%]">
                      <span className="sr-only">Line</span>
                    </th>
                    <th
                      scope="col"
                      className="py-4 pr-6 font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.0625rem] md:text-[1.1875rem]"
                    >
                      Care
                    </th>
                    <th
                      scope="col"
                      className="py-4 font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.0625rem] md:text-[1.1875rem]"
                    >
                      Partner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {continuity.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-black/[0.08] dark:border-brand-cream/[0.08] align-top"
                    >
                      <th
                        scope="row"
                        className="py-4 pr-6 font-sans font-medium text-text-secondary dark:text-brand-cream/55 text-[0.875rem] leading-[1.5]"
                      >
                        {row.label}
                      </th>
                      <td className="py-4 pr-6 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] leading-[1.55]">
                        {row.care}
                      </td>
                      <td className="py-4 text-text-primary dark:text-brand-cream/85 text-[0.9375rem] leading-[1.55]">
                        {row.partner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 5 · Where brand, content and AI visibility fit, and your data ── */}
      <section
        className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-16 md:py-24"
        aria-labelledby="fit-heading"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeUp>
            <SectionBadge n={5} label="The rest of it" />
          </FadeUp>

          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <FadeUp delay={0.06}>
              <div>
                <h2
                  id="fit-heading"
                  className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.1] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.125rem)' }}
                >
                  Where brand, content and AI visibility fit
                </h2>
                <p
                  className="mt-5 text-text-secondary dark:text-brand-cream/75 leading-[1.65]"
                  style={{ fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)', maxWidth: '54ch' }}
                >
                  Inside. The website is built as the front of the system. A brand identity
                  is scoped when the map says the brand has fallen behind the business. AI
                  visibility, getting your name into the answers buyers get from ChatGPT,
                  Claude and Gemini, is a Care or Partner line after go-live. We cannot
                  promise a citation. No honest partner can. We build for it and we track it.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div>
                <h2
                  className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.1] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.125rem)' }}
                >
                  Your data, your system
                </h2>
                <p
                  className="mt-5 text-text-secondary dark:text-brand-cream/75 leading-[1.65]"
                  style={{ fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)', maxWidth: '54ch' }}
                >
                  Hosted in the EU, on AWS in Ireland. Your own database, daily backups kept
                  for thirty days, encrypted connections. You own the code and the data, and
                  can move both to your own cloud account at any time.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* What we say no to */}
          <FadeUp delay={0.18}>
            <div className="mt-14 md:mt-20 rounded-[14px] border border-black/[0.08] dark:border-brand-cream/[0.08] bg-white/60 dark:bg-[#241626] p-7 md:p-9">
              <h2 className="font-sans font-semibold text-text-secondary dark:text-brand-cream/55 text-[0.9375rem] tracking-[0.02em] uppercase">
                What we say no to
              </h2>
              <ul role="list" className="mt-6 flex flex-wrap gap-x-8 gap-y-3.5">
                {refusals.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-text-secondary dark:text-brand-cream/55 text-[0.9375rem] leading-[1.55]"
                  >
                    <X
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                      className="mt-[0.3em] flex-shrink-0 text-text-secondary/50 dark:text-brand-cream/30"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ — founder questions ── */}
      <ServiceFAQ />

      {/* The shared <Guarantee /> block is deliberately NOT used here: it renders
          the same Care and Partner cards as section 4 above. The guarantee sentence
          it carries lives in section 2 instead, next to the prices it applies to. */}

      {/* ── Closing CTA (shared) ── */}
      <CTABanner />
    </>
  );
}
