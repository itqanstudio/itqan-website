import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { en } from '@/content/v3/en';
import { baseMetadata, v3Viewport } from '@/lib/v3/seo';
import { SiteShell } from '@/components/v3/SiteShell';

export const metadata: Metadata = baseMetadata('en');
export const viewport: Viewport = v3Viewport;

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <SiteShell t={en}>{children}</SiteShell>;
}
