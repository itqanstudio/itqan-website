import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/*
 * Catches every unmatched URL so the 404 renders inside the v3 layout. With one
 * root layout per language there is no top-level layout for app/not-found.tsx.
 * Real routes (pages, API, legacy, metadata files) always win over a catch-all.
 */
export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function Missing() {
  notFound();
}
