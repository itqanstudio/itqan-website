import type { Metadata } from 'next';
import { ar } from '@/content/v3/ar';
import { pageMeta } from '@/lib/v3/seo';
import { HomePage } from '@/components/v3/HomePage';

export const metadata: Metadata = pageMeta({
  lang: 'ar',
  title: ar.meta.title,
  description: ar.meta.description,
  enPath: '/',
  absoluteTitle: true,
});

export default function Page() {
  return <HomePage t={ar} />;
}
