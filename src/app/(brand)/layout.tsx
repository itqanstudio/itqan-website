import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Readex_Pro } from 'next/font/google';
import { PORTAL_TITLE_SUFFIX } from '@/lib/page-metadata';
import { SITE_URL, v3Viewport } from '@/lib/v3/seo';
import { Lockup } from '@/components/v3/brand';
import { PrevNext, SideNav } from '@/components/portal/SideNav';
import { UmamiAnalytics } from '@/components/providers/UmamiAnalytics';
import '@/styles/v3/site.css';
import '@/styles/v3/portal.css';

/* The portal shows Arabic specimens, so it loads Readex Pro like the Arabic site. */
const readex = Readex_Pro({ subsets: ['arabic', 'latin'], weight: 'variable', display: 'swap', variable: '--font-readex' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Itqan brand', template: `%s${PORTAL_TITLE_SUFFIX}` },
  description: 'The Itqan brand system, v3: the signal i, colour, type, motion, voice and downloadable assets.',
  icons: { icon: [{ url: '/v3/icon.svg', type: 'image/svg+xml' }], apple: '/v3/apple-touch-icon.png' },
};
export const viewport: Viewport = v3Viewport;

/**
 * Root layout of the brand portal (itqanstudio.com/brand and brand.itqanstudio.com).
 * A reference manual with its own chrome: a top bar, a sticky sidebar built
 * from src/data/brand-portal.ts, and previous/next links in reading order.
 */
export default function BrandPortalLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${GeistSans.variable} ${GeistMono.variable} ${readex.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="pt-top">
          <Link className="home" href="/brand" aria-label="Itqan brand portal, overview">
            <Lockup gid="portal-top-sym" lang="en" />
            <span className="tag">Brand</span>
          </Link>
          <span className="sp" />
          <a className="site" href={SITE_URL}>
            itqanstudio.com ↗
          </a>
        </header>
        <div className="pt-body">
          <SideNav />
          <main id="main" className="pt-main">
            {children}
            <PrevNext />
          </main>
        </div>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
