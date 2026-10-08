import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { SiteDict } from '@/content/v3/types';
import { jsonLdString, organizationLd } from '@/lib/v3/seo';
import { UmamiAnalytics } from '@/components/providers/UmamiAnalytics';
import { Nav } from './Nav';
import { Footer } from './sections-company';
import { Reveal } from './Reveal';
import '@/styles/v3/site.css';

interface SiteShellProps {
  t: SiteDict;
  /** Extra font variable classes (the Arabic layout adds Readex Pro). */
  fontClass?: string;
  children: ReactNode;
}

/**
 * The <html> document for the v3 site. Each language is its own root layout,
 * so `lang` and `dir` are right in the first byte of HTML, not set by script.
 */
export function SiteShell({ t, fontClass = '', children }: SiteShellProps) {
  return (
    <html lang={t.lang} dir={t.dir} className={`${GeistSans.variable} ${GeistMono.variable} ${fontClass}`}>
      <body>
        <Nav t={t.nav} lang={t.lang} />
        <main id="main">{children}</main>
        <Footer t={t} />
        <Reveal />
        <UmamiAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd(t.lang)) }} />
      </body>
    </html>
  );
}
