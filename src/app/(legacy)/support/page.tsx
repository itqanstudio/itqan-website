import type { Metadata } from 'next';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SupportForm } from '@/components/support/SupportForm';
import { FadeUp } from '@/components/ui/FadeUp';
import { LifebuoyIcon } from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Client support',
  description:
    'Already working with Itqan Studio and something needs fixing? Send a support request and track it from a private link.',
  path: '/support',
});

/**
 * /support — for EXISTING clients with a problem.
 *
 * Kept separate from /contact on purpose. Contact is for new business and its
 * copy sells; someone whose site is down does not want to read about a Brand
 * Audit. This page does one thing.
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

      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <FadeUp>
          <SectionLabel icon={<LifebuoyIcon size={13} />} label="Support" />
          <h1 className="mt-4 text-3xl text-[#fffbf5] sm:text-4xl">Something not working?</h1>
          <p className="mt-4 text-base leading-relaxed text-[rgba(255,251,245,0.7)]">
            Tell us what is going on. You will get a private link to follow the request, see our
            replies, and answer without digging through your inbox.
          </p>
          <p className="mt-2 text-sm text-[rgba(255,251,245,0.5)]">
            Prefer email? Write to{' '}
            <a
              href="mailto:info@itqanstudio.com"
              className="underline underline-offset-4 hover:text-[#fffbf5]"
            >
              info@itqanstudio.com
            </a>
            . Looking to start a project instead?{' '}
            <a href="/contact" className="underline underline-offset-4 hover:text-[#fffbf5]">
              Book a call
            </a>
            .
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <SupportForm />

          {/* Wispr-Flow-style sidebar. This is the mount point for help
              articles once they exist — until then, only real destinations. */}
          <aside className="rounded-xl border border-[rgba(255,251,245,0.12)] bg-[rgba(255,251,245,0.03)] p-6 lg:sticky lg:top-28">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[rgba(255,251,245,0.5)]">
              While you wait
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <p className="font-semibold text-[#fffbf5]">Response time</p>
                <p className="mt-1 text-[rgba(255,251,245,0.6)]">
                  We reply within one business day, Dubai time — usually much faster.
                </p>
              </li>
              <li>
                <p className="font-semibold text-[#fffbf5]">Track your request</p>
                <p className="mt-1 text-[rgba(255,251,245,0.6)]">
                  Every request gets a reference and a private link. Bookmark it — replies land
                  there and in your inbox.
                </p>
              </li>
              <li>
                <p className="font-semibold text-[#fffbf5]">Prefer email?</p>
                <p className="mt-1 text-[rgba(255,251,245,0.6)]">
                  <a
                    href="mailto:info@itqanstudio.com"
                    className="underline underline-offset-4 hover:text-[#fffbf5]"
                  >
                    info@itqanstudio.com
                  </a>{' '}
                  reaches the same desk.
                </p>
              </li>
              <li>
                <p className="font-semibold text-[#fffbf5]">New project instead?</p>
                <p className="mt-1 text-[rgba(255,251,245,0.6)]">
                  <a href="/contact" className="underline underline-offset-4 hover:text-[#fffbf5]">
                    Book a call
                  </a>{' '}
                  — this desk is for existing work.
                </p>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
