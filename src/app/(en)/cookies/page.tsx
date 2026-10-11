import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { LegalPageLayout } from '@/components/v3/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy',
  description: 'The cookies itqanstudio.com sets (one, for staff sign-in), and how the site counts visits without any.',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="11 October 2026">
      <p>
        This Cookie Policy explains how <strong>Itqan Studio FZ-LLC</strong> uses cookies and similar technologies on
        itqanstudio.com and brand.itqanstudio.com. Read it with our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files a website stores in your browser. Similar technologies, such as local storage, keep
        data on your device in the same way.
      </p>

      <h2>2. What we set</h2>
      <p>
        <strong>Visitors:</strong> nothing. Reading the site, booking a briefing and sending a form set no cookies and
        write nothing to local storage.
      </p>
      <p>
        <strong>Staff:</strong> when someone from Itqan signs in to manage bookings, the site sets one strictly necessary
        cookie that keeps them signed in. It is secure, not readable by scripts, and expires after 14 days or on sign-out.
      </p>

      <h2>3. How we count visits</h2>
      <p>
        We use Umami, a self-hosted analytics tool that sets no cookies and stores nothing on your device. It counts page
        views with a daily rotating hash, so it cannot follow you across days or sites. If your browser sends Do Not Track
        or Global Privacy Control, the counter does not load at all. Because nothing is stored on your device, there is
        no consent banner.
      </p>

      <h2>4. Third parties</h2>
      <p>
        Links to other sites, such as LinkedIn or a client&rsquo;s website, take you to pages with their own cookie
        policies.
      </p>

      <h2>5. Changes to this policy</h2>
      <p>
        If we add a cookie, we update this page first. The date at the top shows the latest change.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about cookies: <a href="mailto:ibrahim@itqanstudio.com">ibrahim@itqanstudio.com</a>.
      </p>
    </LegalPageLayout>
  );
}
