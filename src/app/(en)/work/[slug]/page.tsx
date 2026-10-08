import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { en } from '@/content/v3/en';
import { pageMeta } from '@/lib/v3/seo';
import { CASE_SLUGS, CasePage, isCaseSlug } from '@/components/v3/CasePage';

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (!isCaseSlug(params.slug)) return {};
  const c = en.cases[params.slug];
  return pageMeta({ lang: 'en', title: c.metaTitle, description: c.metaDescription, enPath: `/work/${c.slug}` });
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!isCaseSlug(params.slug)) notFound();
  return <CasePage t={en} c={en.cases[params.slug]} />;
}
