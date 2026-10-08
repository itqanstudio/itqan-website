import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Readex_Pro } from 'next/font/google';
import { ar } from '@/content/v3/ar';
import { baseMetadata, v3Viewport } from '@/lib/v3/seo';
import { SiteShell } from '@/components/v3/SiteShell';

const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-readex',
});

export const metadata: Metadata = baseMetadata('ar');
export const viewport: Viewport = v3Viewport;

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell t={ar} fontClass={readex.variable}>
      {children}
    </SiteShell>
  );
}
