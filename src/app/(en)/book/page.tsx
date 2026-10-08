import type { Metadata } from 'next';
import { bookingCopy } from '@/content/v3/booking';
import { pageMeta } from '@/lib/v3/seo';
import { BookPage, parseTopic } from '@/components/v3/booking/BookPage';

const t = bookingCopy.en;
export const metadata: Metadata = pageMeta({ lang: 'en', title: t.metaTitle, description: t.metaDescription, enPath: '/book' });

export default function Page({ searchParams }: { searchParams: { topic?: string | string[] } }) {
  return <BookPage lang="en" topic={parseTopic(searchParams.topic)} />;
}
