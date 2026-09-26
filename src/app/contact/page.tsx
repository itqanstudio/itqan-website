import type { Metadata } from 'next';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel';
import { ContactForm } from '@/components/contact/ContactForm';
import { RollButton } from '@/components/ui/RollButton';
import { INTRO_CALL_URL, INTRO_CALL_LABEL } from '@/lib/booking';
import { FadeUp } from '@/components/ui/FadeUp';
import { TextReveal } from '@/components/ui/TextReveal';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { testimonials } from '@/data/testimonials';
import { ChatCircle } from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Book an intro call',
  description:
    'Thirty minutes with the two people who would do the work. Tell us the one thing that is stuck and leave knowing whether we can move it, and what it would cost.',
  path: '/contact',
});

interface IntentCopy {
  label: string;
  heading: string;
  subheading: string;
  body: string;
}

const INTENT_COPY: Record<string, IntentCopy> = {
  'ai-check': {
    label: 'AI Visibility Check',
    heading: 'Get your free AI Visibility Check.',
    subheading: 'See what ChatGPT, Claude and Gemini say about you.',
    body: 'Tell us your brand and market. We run the check and send back where you stand — with three fixes to get named more often. Free, no obligation.',
  },
  'identity-sprint': {
    label: 'Identity Sprint',
    heading: 'Start the Identity Sprint.',
    subheading: 'Strategy, a visual system, and content positioning.',
    body: 'Share a bit about your business and the deadline. We schedule a discovery call to confirm fit before kickoff.',
  },
  'system-automation': {
    label: 'System + Automation',
    heading: 'Build the system + automation.',
    subheading: 'For teams whose brand is already strong.',
    body: 'Tell us where you are with your brand and what manual work is eating your week.',
  },
  'founder-os-core': {
    label: 'The full build',
    heading: 'Book a discovery call.',
    subheading: 'Identity → System → Automation, built and run by one team.',
    body: "Tell us about your company and where you are today. We'll confirm fit on the call.",
  },
  'founder-os-quarterly': {
    label: 'Build + ongoing support',
    heading: 'The build, plus a partner who stays.',
    subheading: 'For teams who want runway after launch.',
    body: 'Share your context. We schedule a call to talk through scope and timing.',
  },
};

const DEFAULT_COPY: IntentCopy = {
  label: 'Book an intro call',
  heading: 'Book an intro call.',
  subheading: 'Thirty minutes with the two people who would do the work.',
  body: 'Pick a time below and tell us the one thing that is stuck. If you would rather write first, the form does the same job. You hear back within twenty-four hours, from a person.',
};

interface Props {
  searchParams: { intent?: string };
}

export default function ContactPage({ searchParams }: Props) {
  const intent = typeof searchParams.intent === 'string' ? searchParams.intent : undefined;
  const copy = (intent && INTENT_COPY[intent]) || DEFAULT_COPY;

  return (
    <section className="bg-brand-cream dark:bg-[#1f1420] min-h-[100dvh] pt-10 md:pt-16 pb-20 sm:pb-24">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left column */}
          <div>
            <FadeUp>
              <SectionLabel icon={<ChatCircle size={13} />} label={copy.label} />
            </FadeUp>

            <TextReveal direction="up" delay={0.08} className="mt-6">
              <h1 className="font-sans font-semibold text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl text-text-primary dark:text-brand-cream leading-tight tracking-[-0.02em]">
                {copy.heading}
              </h1>
              <p className="font-sans font-normal text-[1.25rem] sm:text-2xl text-text-secondary dark:text-brand-cream/65 leading-relaxed mt-3">
                {copy.subheading}
              </p>
            </TextReveal>

            <FadeUp delay={0.16}>
              <p className="mt-7 text-text-secondary dark:text-brand-cream/60 text-base leading-relaxed max-w-[50ch]">
                {copy.body}
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="mt-6 text-[0.9375rem] sm:text-base leading-relaxed max-w-[46ch] text-text-primary dark:text-brand-cream/85">
                We work in{' '}
                <span
                  className="text-brand-accent-on-light dark:text-brand-accent"
                  style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
                >
                  English, Swedish and Arabic
                </span>
                , from Dubai.
              </p>
            </FadeUp>

            <ScrollReveal direction="left" distance={28} delay={0.26} className="mt-12">
              <TestimonialCarousel testimonials={testimonials} variant="card" />
            </ScrollReveal>
          </div>

          {/* Right column — booking first, then the form (decided 8 Sep 2026) */}
          <ScrollReveal direction="right" distance={28} delay={0.14} className="lg:pt-2 space-y-6">
            {/* Calendly is linked, not embedded: an iframe would pull a third-party
                script in ahead of the consent banner and slow the page for the
                majority who scroll straight to the form. */}
            <div className="rounded-2xl bg-white dark:bg-[#241626] border border-black/[0.08] dark:border-brand-cream/[0.12] shadow-[0_2px_12px_rgba(47,28,44,0.06)] dark:shadow-none p-8">
              <p className="font-semibold text-text-primary dark:text-brand-cream text-lg">
                Pick a time
              </p>
              <p className="mt-2.5 text-[0.9375rem] text-text-secondary dark:text-brand-cream/65 leading-relaxed max-w-[44ch]">
                Thirty minutes, free, on Google Meet. You leave knowing whether we can
                move the thing that is stuck, and what it would cost.
              </p>
              <div className="mt-6">
                <RollButton
                  href={INTRO_CALL_URL}
                  label={INTRO_CALL_LABEL}
                  external
                  umamiEvent="cta_contact_calendly"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#241626] border border-black/[0.08] dark:border-brand-cream/[0.12] shadow-[0_2px_12px_rgba(47,28,44,0.06)] dark:shadow-none p-8">
              <p className="font-semibold text-text-primary dark:text-brand-cream text-lg mb-6">Or send us a message</p>
              <ContactForm intent={intent} />
              {/* Existing clients land here first when something breaks. This
                  form emails an inbox; /support opens a tracked ticket with a
                  private thread they can follow. Send them to the right one. */}
              <p className="mt-6 pt-6 border-t border-black/[0.08] dark:border-brand-cream/[0.12] text-[0.875rem] text-text-secondary dark:text-brand-cream/60">
                Already working with us and something needs fixing?{' '}
                <a
                  href="/support"
                  className="underline underline-offset-4 hover:text-text-primary dark:hover:text-brand-cream transition-colors duration-200"
                >
                  Open a support request
                </a>{' '}
                and you get a private link to track it.
              </p>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
