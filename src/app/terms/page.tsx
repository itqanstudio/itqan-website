import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

// TODO: Review with legal counsel before going live

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of itqanstudio.com and any services provided by Itqan Studio FZ LLC.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="22 April 2026">
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of itqanstudio.com (the
        &ldquo;Site&rdquo;) and any services provided by <strong>Itqan Studio FZ LLC</strong> (&ldquo;Itqan
        Studio,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a UAE Free Zone entity. By accessing the Site or
        engaging our services, you agree to be bound by these Terms.
      </p>

      <h2>1. Scope of services</h2>
      <p>
        Itqan Studio provides brand identity design, UI/UX design, web and
        application development, automation and systems setup, and related digital
        services. The specific deliverables, timelines, and fees for any engagement
        are defined in a separate written proposal or statement of work, which,
        together with these Terms, forms the full agreement between the parties.
      </p>

      <h2>2. Use of the website</h2>
      <p>
        The Site is provided for informational purposes. You agree not to use the
        Site in any manner that is unlawful, harmful, or that infringes the rights of
        others. We reserve the right to suspend or restrict access to the Site at any
        time without notice.
      </p>

      <h2>3. Engagements and payment</h2>
      <p>
        Unless agreed otherwise in writing:
      </p>
      <ul>
        <li>Projects begin only after a signed proposal and initial deposit are received.</li>
        <li>All fees are quoted in AED or USD as specified in the relevant proposal.</li>
        <li>Invoices are payable within 14 days of issue.</li>
        <li>Late payments may incur interest at the maximum rate permitted by law.</li>
        <li>Additional work outside the agreed scope will be quoted and approved separately.</li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        Upon full payment, ownership of final approved deliverables transfers to the
        client, except for:
      </p>
      <ul>
        <li>
          Pre-existing tools, frameworks, and proprietary assets of Itqan Studio used
          in the delivery of the work, which remain our property.
        </li>
        <li>
          Third-party assets (fonts, stock imagery, open-source libraries), which
          remain governed by their respective licences.
        </li>
      </ul>
      <p>
        Itqan Studio retains the right to display completed work in our portfolio,
        case studies, and marketing materials unless otherwise agreed in writing.
      </p>

      <h2>5. Confidentiality</h2>
      <p>
        Both parties agree to treat non-public information exchanged during an
        engagement as confidential, and to use it only for the purposes of the
        engagement.
      </p>

      <h2>6. Warranties and disclaimers</h2>
      <p>
        We perform our services with reasonable skill and care. The Site and any
        materials it contains are provided &ldquo;as is&rdquo; without warranty of any kind,
        express or implied, to the fullest extent permitted by law.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Itqan Studio&rsquo;s total aggregate
        liability arising out of or in connection with any engagement shall not
        exceed the fees paid by the client for the specific deliverable giving rise
        to the claim. We are not liable for indirect, incidental, consequential, or
        loss-of-profit damages.
      </p>

      <h2>8. Termination</h2>
      <p>
        Either party may terminate an engagement for material breach that remains
        uncured for 14 days after written notice. On termination, the client shall
        pay for all work performed up to the termination date.
      </p>

      <h2>9. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the United Arab Emirates, as
        applicable to Free Zone entities. Any dispute arising out of or in connection
        with these Terms shall be submitted to the exclusive jurisdiction of the
        competent courts of Dubai.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site after
        changes are posted constitutes acceptance of the revised Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Itqan Studio FZ LLC, Dubai, United Arab Emirates.
        <br />
        Email: <a href="mailto:info@itqanstudio.com">info@itqanstudio.com</a>
      </p>
    </LegalPageLayout>
  );
}
