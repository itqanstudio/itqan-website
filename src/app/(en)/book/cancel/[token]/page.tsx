import type { Metadata } from 'next';
import { bookingCopy } from '@/content/v3/booking';
import { CancelPage } from '@/components/v3/booking/CancelPage';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: bookingCopy.en.cancel.metaTitle, robots: { index: false, follow: false } };

export default function Page({ params }: { params: { token: string } }) {
  return <CancelPage lang="en" token={params.token} />;
}
