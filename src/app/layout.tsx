import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Manrope, Playfair_Display } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ViewTransitions } from 'next-view-transitions';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { UmamiAnalytics } from '@/components/providers/UmamiAnalytics';
import { CookieBanner } from '@/components/CookieBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME, siteGraphLd } from '@/lib/seo';
import { PORTAL_HEADER } from '@/lib/portal-chrome';
import './globals.css';

// Self-hosted via next/font (was a render-blocking external Google Fonts <link>,
// the site's single biggest FCP/LCP hit + the source of the font-swap CLS). This
// eliminates the blocking request AND ships a size-adjusted fallback metric so
// the swap no longer reflows the big hero headline. Exposed as CSS variables so
// Tailwind (font-sans/font-serif) and the inline Playfair accents resolve to them.
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Itqan Studio. The system your business runs on. Dubai and Sweden.',
    template: '%s | Itqan Studio',
  },
  description:
    'Booking, intake, customer records, invoicing and follow-up, with the website in front. Built by two senior people, live in weeks, owned by you, run with you after go-live.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: 'Itqan Studio FZ LLC',
  publisher: 'Itqan Studio FZ LLC',
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Itqan Studio. The system your business runs on. Dubai and Sweden.',
    description:
      'Bookings, intake, customer records, invoicing and follow-up, with the website in front. Live in weeks. Owned by you. Run with you after go-live.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itqan Studio. The system your business runs on. Dubai and Sweden.',
    description:
      'Bookings, intake, customer records, invoicing and follow-up, with the website in front. Live in weeks. Owned by you.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/images/brand/dark-icon.svg',
        media: '(prefers-color-scheme: light)',
        type: 'image/svg+xml',
      },
      {
        url: '/images/brand/light-icon.svg',
        media: '(prefers-color-scheme: dark)',
        type: 'image/svg+xml',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Light-first: browser chrome matches the default cream homepage; dark for dark-scheme UAs.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffbf5' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1420' },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * The brand portal runs its OWN chrome (sticky top bar + sidebar), so the
   * site's pill nav and footer must not render there — two stacked sticky bars
   * clip the page heading.
   *
   * Decided on the SERVER from a middleware header, never from usePathname().
   * The portal subdomain is REWRITTEN to /brand, so the browser path stays
   * "/positioning" and any client-side pathname guard silently evaluates false.
   * That was the live bug (2026-08-13). See lib/portal-chrome.ts.
   */
  const isPortal = (await headers()).get(PORTAL_HEADER) === '1';

  return (
    // suppressHydrationWarning: next-themes mutates <html> class before hydration.
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Fonts are self-hosted via next/font (see manrope/playfair above) — no
            render-blocking external stylesheet. */}
        {/* Site-wide entity graph: Organization + WebSite + founder Person */}
        <JsonLd data={siteGraphLd()} />
      </head>
      <body>
        {/* ViewTransitions (next-view-transitions) drives the App-Router page
            transitions via the native View Transitions API — a root crossfade for
            every navigation + a shared-element morph from a work-card cover into
            the case-study hero. Replaces the old framer-motion PageTransition. */}
        <ViewTransitions>
          <ThemeProvider>
            <SmoothScrollProvider>
              <PostHogProvider>
                {/* Cookieless, self-hosted Umami. Deliberately OUTSIDE any
                    consent gate and sibling to PostHogProvider rather than
                    nested in it: Umami stores nothing on the visitor's device,
                    so it needs no opt-in, and gating it would reduce it to
                    measuring only the people who click Accept. PostHog keeps
                    its consent gate because it does set cookies.
                    See UmamiAnalytics.tsx for the full reasoning. */}
                <UmamiAnalytics />
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-brand-dark focus:px-4 focus:py-2 focus:text-brand-cream"
                >
                  Skip to content
                </a>
                {!isPortal && <Navbar />}
                <main id="main">{children}</main>
                {!isPortal && <Footer />}
                <CookieBanner />
              </PostHogProvider>
            </SmoothScrollProvider>
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
