import type { Metadata } from 'next';
import { AboutHero } from '@/components/about/AboutHero';
import { MissionStatement } from '@/components/about/MissionStatement';
import { Values } from '@/components/about/Values';
import { TeamSection } from '@/components/about/TeamSection';
import { Languages } from '@/components/about/Languages';
import { CTABanner } from '@/components/home/CTABanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Ibrahim Shareef & Bisma Aslam, co-founders',
  description:
    'Meet the team behind Itqan Studio, a Dubai agency covering brand, web, SEO, AI visibility and automation, led by co-founders Ibrahim Shareef and Bisma Aslam.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      <AboutHero />
      <MissionStatement />
      <Values />
      <TeamSection />
      <Languages />
      <CTABanner />
    </>
  );
}
