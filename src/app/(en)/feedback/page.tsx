import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FeedbackThemer } from '@/components/feedback/FeedbackThemer';
import { PORTAL_HEADER } from '@/lib/portal-chrome';
import '@/styles/v3/forms.css';

/**
 * Client-testimonial form, the post-project routine. Reached two ways:
 *   feedback.itqanstudio.com          (host rewrite in middleware, standalone)
 *   itqanstudio.com/feedback          (direct path, inside the v3 nav and footer)
 * `?p=<project>` tags the submission with the engagement it belongs to, so
 * Ibrahim sends links like feedback.itqanstudio.com?p=lemon-garden.
 *
 * noindex: this page is for clients holding a link, not for search.
 */
export const metadata: Metadata = {
  title: 'How was it?',
  description: 'Two minutes of your experience working with Itqan.',
  robots: { index: false, follow: false },
};

// Next 14 passes searchParams as a PLAIN OBJECT (the Promise form is Next 15).
export default function FeedbackPage({
  searchParams,
}: {
  searchParams: { p?: string | string[] };
}) {
  const { p } = searchParams;
  // Bound + sanitize: this string travels into the submission payload.
  const project = typeof p === 'string' ? p.slice(0, 80) : undefined;
  // Set only by the middleware, which deletes any client-sent copy (see middleware.ts).
  const standalone = headers().get(PORTAL_HEADER) === '1';

  return (
    <FeedbackThemer standalone={standalone}>
      <section className="pg" aria-labelledby="fb-title">
        <div className="wrap narrow">
          <header className="pg-head">
            <p className="k">
              <b>■</b> Client feedback
            </p>
            <h1 id="fb-title">How was it, honestly?</h1>
            <p className="lead">
              You worked with us, so your words carry more weight than anything we could write
              about ourselves. Two minutes, five questions, no wrong answers.
            </p>
          </header>
          <div className="fm-card">
            <FeedbackForm project={project} />
          </div>
        </div>
      </section>
    </FeedbackThemer>
  );
}
