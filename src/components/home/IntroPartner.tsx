import { FadeUp } from '@/components/ui/FadeUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * The recognition beat: four sentences owners actually say about their own week.
 * No solution here and no pitch, only the problem in their words, so the sections
 * that follow land as an answer instead of an advert. Light-first, dark-aware.
 */
const mondays = [
  'Every morning someone opens the inbox and works out which booking belongs to which branch.',
  "One person's memory is the system. The day they rest, the business rests.",
  'We pay rent on six tools that do not talk to each other, and none of the data is ours.',
  'Follow-up dies in WhatsApp at 11 pm, because follow-up is me.',
];

export function IntroPartner() {
  return (
    <section
      className="bg-white dark:bg-[#241626] pt-16 sm:pt-20 lg:pt-32 pb-16 sm:pb-20 lg:pb-28 overflow-hidden"
      aria-labelledby="intro-partner-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              1
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              The week you are having
            </span>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 items-start">
          {/* Left — heading and the line that lifts the blame */}
          <div>
            <FadeUp delay={0.06}>
              <h2
                id="intro-partner-heading"
                className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.1] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', maxWidth: '16ch' }}
              >
                If this sounds like your{' '}
                <span
                  className="text-brand-accent-on-light dark:text-brand-accent"
                  style={{
                    fontFamily: 'var(--font-serif), serif',
                    fontStyle: 'italic',
                    fontWeight: 500,
                  }}
                >
                  Monday
                </span>
                .
              </h2>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p
                className="mt-7 lg:mt-9 text-text-secondary dark:text-brand-cream/70 leading-[1.6]"
                style={{ fontSize: 'clamp(1rem, 1.25vw, 1.125rem)', maxWidth: '38ch' }}
              >
                You are not disorganised.{' '}
                <span className="text-text-primary dark:text-brand-cream font-medium">
                  You are running a growing business on tools built for a smaller one.
                </span>
              </p>
            </FadeUp>
          </div>

          {/* Right — the four quotes */}
          <ul role="list" className="space-y-3 sm:space-y-4">
            {mondays.map((quote, i) => (
              <ScrollReveal key={quote} direction="up" distance={20} delay={i * 0.07}>
                <li className="rounded-[12px] border border-black/[0.08] dark:border-brand-cream/[0.08] bg-[#f5efe6] dark:bg-[#2a1a28] px-6 py-5 sm:px-7 sm:py-6">
                  <p
                    className="text-text-primary dark:text-brand-cream/85 leading-[1.55]"
                    style={{
                      fontFamily: 'var(--font-serif), serif',
                      fontStyle: 'italic',
                      fontSize: 'clamp(1rem, 1.35vw, 1.1875rem)',
                    }}
                  >
                    &ldquo;{quote}&rdquo;
                  </p>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
