import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

// TODO: Review with legal counsel before going live

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Itqan Studio FZ LLC collects, uses, stores, and protects your personal data. Read our commitments to data privacy and your rights under UAE law.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="22 April 2026">
      <p>
        This Privacy Policy explains how <strong>Itqan Studio FZ LLC</strong> (&ldquo;Itqan Studio,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a UAE Free Zone
        entity, collects, uses, and protects personal information when you visit
        itqanstudio.com or engage our services. We are committed to processing data in
        accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of
        Personal Data (the &ldquo;PDPL&rdquo;) and applicable international standards, including
        the EU General Data Protection Regulation (GDPR) where relevant.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Information you provide.</strong> Name, email address, company,
          website, budget range, phone number, and project details submitted via our
          contact form or newsletter sign-up.
        </li>
        <li>
          <strong>Information collected automatically.</strong> IP address, browser
          type, device identifiers, referring pages, and general usage analytics
          collected through cookies and similar technologies.
        </li>
        <li>
          <strong>Information from third parties.</strong> Data from authentication or
          analytics providers if you interact with us through those channels.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To respond to inquiries and provide quotes or proposals.</li>
        <li>To deliver, invoice, and support the services you have engaged us for.</li>
        <li>To send newsletters or marketing messages you have opted into.</li>
        <li>To improve our website and services through aggregated analytics.</li>
        <li>To meet legal, tax, and regulatory obligations.</li>
      </ul>

      <h2>3. Legal basis for processing</h2>
      <p>
        Depending on the context, we process personal data on the basis of your
        consent, our legitimate interests in running and improving the business, the
        performance of a contract to which you are a party, or compliance with a legal
        obligation.
      </p>

      <h2>4. Third-party tools and processors</h2>
      <p>
        We rely on a small number of trusted third-party processors to run the site
        and our services. Each is bound by its own privacy terms:
      </p>
      <ul>
        <li>
          <strong>Amazon SES</strong> &mdash; contact form and transactional email
          delivery.
        </li>
        <li>
          <strong>Listmonk (self-hosted)</strong> &mdash; newsletter subscription
          management and email delivery.
        </li>
        <li>
          <strong>Hosting providers</strong> &mdash; static site hosting and content
          delivery.
        </li>
        <li>
          <strong>Analytics</strong> &mdash; aggregated, non-identifying usage
          measurement (see our <a href="/cookies">Cookie Policy</a>).
        </li>
      </ul>

      <h2>5. Data storage and retention</h2>
      <p>
        Personal data is stored on servers operated by our processors, which may be
        located outside the UAE. Where data leaves the UAE, we rely on appropriate
        safeguards permitted under the PDPL. We retain personal data only for as long
        as reasonably necessary to fulfil the purposes for which it was collected, or
        as required by applicable law.
      </p>

      <h2>6. Your rights</h2>
      <p>Subject to applicable law, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your data.</li>
        <li>Object to or restrict certain processing activities.</li>
        <li>Withdraw consent at any time, where consent is the legal basis.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:info@itqanstudio.com">info@itqanstudio.com</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement reasonable technical and organisational measures to protect
        personal data against unauthorised access, loss, or misuse. No method of
        transmission over the internet is fully secure, and we cannot guarantee
        absolute security.
      </p>

      <h2>8. Children</h2>
      <p>
        Our services are not directed at children under 16. We do not knowingly
        collect personal data from children.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo;
        date at the top of this page reflects the most recent revision. Material
        changes will be communicated where appropriate.
      </p>

      <h2>10. Contact</h2>
      <p>
        Itqan Studio FZ LLC, Dubai, United Arab Emirates.
        <br />
        Email: <a href="mailto:info@itqanstudio.com">info@itqanstudio.com</a>
      </p>
    </LegalPageLayout>
  );
}
