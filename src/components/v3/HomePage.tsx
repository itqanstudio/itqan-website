import type { SiteDict } from '@/content/v3/types';
import { jsonLdString } from '@/lib/v3/seo';
import { Build, Faq, Hero, How, Industries, RunSection, Security, Strip } from './sections';
import { Company, Cta, Work } from './sections-company';

/** The home page, in either language. */
export function HomePage({ t }: { t: SiteDict }) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: t.lang,
    mainEntity: t.faq.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <>
      <Hero t={t} />
      <Strip t={t} />
      <Industries t={t} />
      <RunSection t={t} />
      <Build t={t} />
      <Security t={t} />
      <How t={t} />
      <Work t={t} />
      <Faq t={t} />
      <Company t={t} />
      <Cta t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqLd) }} />
    </>
  );
}
