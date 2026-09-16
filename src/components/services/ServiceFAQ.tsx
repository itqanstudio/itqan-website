import { Plus } from '@phosphor-icons/react/dist/ssr';
import { FadeUp } from '@/components/ui/FadeUp';
import type { FaqItem } from '@/lib/seo';

/**
 * Common founder questions. Written GEO-first: each answer leads with a direct,
 * objective, factual sentence (lower model "perplexity" → higher LLM-citation
 * odds) and is grounded in real case-study outcomes. Exported so the page can
 * emit matching FAQPage JSON-LD. Native <details> keeps every answer in the
 * server-rendered HTML — fully crawlable by Google and AI bots even collapsed.
 */
export const SERVICE_FAQ: readonly FaqItem[] = [
  {
    question: 'What does Itqan Studio do?',
    answer:
      'We build the system an owner-led business runs on: booking or intake, the admin side, the automation between them, and the website in front. Then we host it and keep building with you.',
  },
  {
    question: 'Who owns the code and the data?',
    answer:
      'You do. It is written into the proposal. You can leave with both at any time.',
  },
  {
    question: 'How fast?',
    answer:
      'A working version before you commit. Starter scope live in three weeks, core in six. Lemon Garden went from a shared inbox to a live booking system in a week.',
  },
  {
    question: 'Do you do SEO and AI visibility?',
    answer:
      'Yes, after go-live, inside Care or Partner. We cannot promise a ranking or a citation, and we say so.',
  },
  {
    question: 'Do you run ads or social media?',
    answer:
      'No ads. Content and social are scoped only inside a Partner engagement.',
  },
  {
    question: 'Where are you?',
    answer:
      'Itqan Studio FZ-LLC is a UAE company in Dubai. We serve clients in the UAE and Sweden, work in English, Swedish and Arabic, and invoice in USD.',
  },
];

export function ServiceFAQ() {
  return (
    <section
      className="bg-[#f5efe6] dark:bg-[#1a0f1c] py-20 md:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-12">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              6
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Common questions
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            id="faq-heading"
            className="mt-7 sm:mt-8 font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', maxWidth: '20ch' }}
          >
            Questions founders{' '}
            <span
              className="text-brand-accent-on-light dark:text-brand-accent"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
            >
              ask
            </span>
            .
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <div className="mt-12 md:mt-16 divide-y divide-black/[0.1] dark:divide-brand-cream/[0.1] border-t border-black/[0.1] dark:border-brand-cream/[0.1]">
            {SERVICE_FAQ.map((item, i) => (
              <details key={item.question} className="group py-5 md:py-6" open={i === 0}>
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-sans font-semibold text-text-primary dark:text-brand-cream text-[1.0625rem] md:text-[1.1875rem] leading-[1.4]">
                    {item.question}
                  </h3>
                  <Plus
                    size={22}
                    weight="bold"
                    aria-hidden="true"
                    className="mt-0.5 flex-shrink-0 text-brand-accent-on-light dark:text-brand-accent transition-transform duration-200 ease-out group-open:rotate-45"
                  />
                </summary>
                <p className="mt-4 text-text-secondary dark:text-brand-cream/70 text-[0.9375rem] md:text-[1.0625rem] leading-[1.7] max-w-[68ch]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
