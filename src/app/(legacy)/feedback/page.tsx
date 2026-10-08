import type { Metadata } from 'next';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FeedbackThemer } from '@/components/feedback/FeedbackThemer';

/**
 * Client-testimonial form — the post-project routine. Reached two ways:
 *   feedback.itqanstudio.com          (host rewrite in middleware, chrome-less)
 *   itqanstudio.com/feedback          (direct path)
 * `?p=<project>` tags the submission with the engagement it belongs to, so
 * Ibrahim sends links like feedback.itqanstudio.com?p=lemon-garden.
 *
 * noindex: this page is for clients holding a link, not for search.
 */
export const metadata: Metadata = {
  title: 'How was it? — Itqan Studio',
  description: 'Two minutes of your experience working with Itqan Studio.',
  robots: { index: false, follow: false },
};

// Next 14 passes searchParams as a PLAIN OBJECT (the Promise form is Next 15).
// `await` of a non-promise happens to be identity, so the earlier Promise-typed
// version worked at runtime — but the type was a lie waiting for the 15 upgrade.
export default function FeedbackPage({
  searchParams,
}: {
  searchParams: { p?: string | string[] };
}) {
  const { p } = searchParams;
  // Bound + sanitize: this string travels into the submission payload.
  const project = typeof p === 'string' ? p.slice(0, 80) : undefined;

  return (
    <FeedbackThemer>
    <main className="min-h-screen bg-brand-cream dark:bg-[#140a16] px-5 py-14 md:py-20">
      <div className="mx-auto w-full max-w-xl">
        <p
          className="font-sans font-medium text-[0.6875rem] uppercase text-brand-accent-on-light dark:text-brand-accent"
          style={{ letterSpacing: '0.22em' }}
        >
          Itqan Studio
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-text-primary dark:text-brand-cream tracking-[-0.02em]">
          How was it, honestly?
        </h1>
        <p className="mt-4 mb-10 text-text-secondary dark:text-[rgba(255,251,245,0.7)] leading-relaxed">
          You worked with us — that makes your words the most valuable thing we own.
          Two minutes, five questions, no wrong answers.
        </p>
        <FeedbackForm project={project} />
      </div>
    </main>
    </FeedbackThemer>
  );
}
