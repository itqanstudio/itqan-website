import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

// TODO: Review with legal counsel before going live

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy',
  description:
    'What cookies Itqan Studio uses, why we use them, and how you can control or opt out of non-essential cookies.',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="22 April 2026">
      <p>
        This Cookie Policy explains how <strong>Itqan Studio FZ LLC</strong> uses
        cookies and similar technologies on itqanstudio.com. It should be read
        alongside our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What are cookies</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website.
        They allow the site to remember your actions and preferences (such as
        consent state) over a period of time, so you do not have to re-enter them on
        every visit.
      </p>

      <h2>2. Types of cookies we use</h2>

      <h3>Essential cookies</h3>
      <p>
        These are strictly necessary for the site to function. They cannot be
        disabled. They include the cookie that stores your consent preference
        (<strong>itqan_cookie_consent</strong>) so we do not repeatedly show the
        banner.
      </p>

      <h3>Analytics cookies</h3>
      <p>
        We may use aggregated analytics to understand how visitors use the site
        (for example, pages viewed, approximate region, referring source). These
        cookies do not identify you individually and are only set if you accept
        cookies via our consent banner.
      </p>

      <h2>3. Third-party cookies</h2>
      <p>
        Some pages may embed content from third parties (for example, video or
        social embeds). Those third parties may set their own cookies, which are
        governed by their respective privacy policies.
      </p>

      <h2>4. Managing and opting out</h2>
      <ul>
        <li>
          You can accept or decline non-essential cookies via the consent banner
          displayed on your first visit.
        </li>
        <li>
          You can clear cookies and local storage at any time through your browser
          settings. Doing so will prompt the consent banner again on your next
          visit.
        </li>
        <li>
          Declining non-essential cookies will not affect your ability to use the
          site; some features, such as analytics, simply will not be activated.
        </li>
      </ul>

      <h2>5. Changes to this policy</h2>
      <p>
        We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo;
        date at the top of this page reflects the most recent revision.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about our use of cookies can be sent to{' '}
        <a href="mailto:info@itqanstudio.com">info@itqanstudio.com</a>.
      </p>
    </LegalPageLayout>
  );
}
