import type { Metadata } from 'next';
import { bookingCopy } from '@/content/v3/booking';
import { pageMeta } from '@/lib/v3/seo';
import { parseHostSlug } from '@/lib/crm/slug';
import { BookPage, parseTopic } from '@/components/v3/booking/BookPage';

// Free times come from the CRM on every request; never prerendered at build time.
export const dynamic = 'force-dynamic';

const t = bookingCopy.ar;
export const metadata: Metadata = pageMeta({ lang: 'ar', title: t.metaTitle, description: t.metaDescription, enPath: '/book' });

export default function Page({ searchParams }: { searchParams: { topic?: string | string[]; with?: string | string[] } }) {
  return <BookPage lang="ar" topic={parseTopic(searchParams.topic)} withSlug={parseHostSlug(searchParams.with)} />;
}
