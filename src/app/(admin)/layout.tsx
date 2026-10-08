import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { v3Viewport } from '@/lib/v3/seo';
import '@/styles/v3/site.css';
import '@/styles/v3/book.css';
import '@/styles/v3/admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin · Itqan', template: '%s · Itqan admin' },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: [{ url: '/v3/icon.svg', type: 'image/svg+xml' }] },
};
export const viewport: Viewport = v3Viewport;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <main id="main" className="adm">
          {children}
        </main>
      </body>
    </html>
  );
}
