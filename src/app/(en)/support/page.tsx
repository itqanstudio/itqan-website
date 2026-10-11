import type { Metadata } from 'next';
import Link from 'next/link';
import { SupportForm } from '@/components/support/SupportForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/seo';
import { pageMeta } from '@/lib/v3/seo';
import '@/styles/v3/forms.css';

export const metadata: Metadata = pageMeta({
  lang: 'en',
  title: 'Client support',
  description:
    'Already working with Itqan and something needs fixing? Send a support request and track it from a private link.',
  enPath: '/support',
  bilingual: false,
});

const SUPPORT_EMAIL = 'info@itqanstudio.com';

/**
 * /support, for EXISTING clients with a problem.
 *
 * Kept separate from /book on purpose. Booking is for new business; someone
 * whose system is down does not want to read about a briefing. This page does
 * one thing.
 */
export default function SupportPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Support', path: '/support' },
        ])}
      />

      <section className="pg" aria-labelledby="sup-title">
        <div className="wrap">
          <header className="pg-head">
            <p className="k">
              <b>■</b> Client support
            </p>
            <h1 id="sup-title">Something not working?</h1>
            <p className="lead">
              Tell us what is going on. You will get a private link to follow the request, see our
              replies, and answer without digging through your inbox.
            </p>
            <p className="note-line">
              Prefer email? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Looking to
              start something new instead? <Link href="/book">Book a briefing</Link>.
            </p>
          </header>

          <div className="pg-grid">
            <div className="fm-card">
              <SupportForm />
            </div>

            {/* The mount point for help articles once they exist. Until then, only real destinations. */}
            <aside className="pg-aside" aria-labelledby="sup-aside">
              <h2 id="sup-aside">While you wait</h2>
              <ul>
                <li>
                  <b>Response time</b>
                  <p>We reply within one business day, Dubai time, and usually sooner.</p>
                </li>
                <li>
                  <b>Track your request</b>
                  <p>
                    Every request gets a reference and a private link. Bookmark it. Replies land there
                    and in your inbox.
                  </p>
                </li>
                <li>
                  <b>Prefer email?</b>
                  <p>
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> reaches the same desk.
                  </p>
                </li>
                <li>
                  <b>Something new instead?</b>
                  <p>
                    <Link href="/book">Book a briefing</Link>. This desk is for existing work.
                  </p>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
