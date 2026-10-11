import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/v3/brand';
import '@/styles/v3/forms.css';

export const metadata: Metadata = {
  title: 'Message received',
  description: 'We have your message and will reply by email.',
  // Post-conversion page, no search value: keep it out of the index. (No canonical:
  // a noindex page should not also self-canonicalize, that is a mixed signal.)
  robots: { index: false, follow: true },
};

/** The checkmark draws itself once, in CSS; reduced motion shows it complete. */
function Check() {
  return (
    <svg className="ty-check" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      <circle cx="28" cy="28" r="26" />
      <path d="M17 28.5L24.5 36L39 21" />
    </svg>
  );
}

export default function ThankYouPage() {
  return (
    <section className="ty" aria-labelledby="ty-title">
      <div className="wrap">
        <Check />
        <h1 id="ty-title">
          Message <span className="g">received.</span>
        </h1>
        <p className="lead">Thank you for writing. We will read it and reply by email.</p>
        <div className="btns">
          <Link className="btn pri" href="/">
            Back to the home page <Arrow />
          </Link>
          <Link className="btn" href="/#work">
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
