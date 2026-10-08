import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/** Unmatched /ar URLs get the Arabic 404 inside the Arabic layout. */
export const metadata: Metadata = { title: 'الصفحة غير موجودة', robots: { index: false } };

export default function Missing() {
  notFound();
}
