import type { Metadata } from 'next';
import { en } from '@/content/v3/en';
import { pageMeta } from '@/lib/v3/seo';
import { HomePage } from '@/components/v3/HomePage';

export const metadata: Metadata = pageMeta({
  lang: 'en',
  title: en.meta.title,
  description: en.meta.description,
  enPath: '/',
  absoluteTitle: true,
});

export default function Page() {
  return <HomePage t={en} />;
}
