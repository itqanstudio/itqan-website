export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  coverImage: string;
  /** Optional cover video used by listing cards. coverImage acts as the poster + fallback. */
  coverVideo?: string;
  mockups: string[];
  description: string;
  behanceUrl?: string;
  tags: string[];
  filters: string[];
  /** Set when the cover image already bakes in the project title, so the listing card suppresses its overlaid title/subtitle to avoid a double title. */
  coverHasTitle?: boolean;
}

// Array order is the order the cards appear on /work. Lemon Garden leads and
// Millow follows, so the system story is the first thing a visitor sees
// (site copy v2, section 7).
export const projects: Project[] = [
  {
    id: 'lemon-garden',
    title: 'Lemon Garden',
    subtitle: 'A booking platform for a seven-city restaurant chain',
    category: 'Application Development',
    coverImage: '/images/portfolio/lemon-garden/cover-collage.webp',
    mockups: [
      '/images/portfolio/lemon-garden/mobile.webp',
      '/images/portfolio/lemon-garden/console.webp',
      '/images/portfolio/lemon-garden/website.webp',
    ],
    description:
      'A self-hosted booking platform for a Swedish brunch chain with seven locations: live availability per seating, a two-factor staff console, an owner-run form builder, and a full email layer. Demo on day one, production within the week, live at boka.lemongarden.se.',
    tags: ['Application Development', 'Hospitality', 'Booking'],
    filters: ['Application Development', 'UI/UX Design'],
  },
  {
    id: 'millow',
    title: 'Millow',
    subtitle: "A living website for Sweden's fermented oat protein platform",
    category: 'ui-ux',
    coverImage: '/images/portfolio/millow/cover-collage.webp',
    mockups: [
      '/images/portfolio/millow/website.webp',
      '/images/portfolio/millow/fs-hero.webp',
      '/images/portfolio/millow/fs-film.webp',
    ],
    description: "A living website for Sweden's fermented oat protein platform.",
    tags: ['UI/UX', 'Web Design', 'Food Tech'],
    filters: ['UI/UX Design', 'Brand & Identity'],
  },
  {
    id: 'mutqin',
    title: 'Mutqin',
    subtitle: 'AI Startup Companion',
    category: 'Application Development',
    coverImage: '/images/portfolio/mutqin/hero.webp',
    coverHasTitle: true,
    mockups: [
      '/images/portfolio/mutqin/wizard.webp',
      '/images/portfolio/mutqin/portal.webp',
      '/images/portfolio/mutqin/mobile.webp',
    ],
    description:
      'An AI startup companion that turns one onboarding chat into a living company portal — coaching, investor-grade documents, and a readiness score. Designed, branded and engineered end to end at Itqan on React, TypeScript, Supabase and Claude. Live at mutqin.xyz.',
    tags: ['Application Development', 'Product Design', 'AI'],
    filters: ['Application Development', 'Brand & Identity', 'UI/UX Design'],
  },
  {
    id: 'shareefico',
    title: 'Shareefico',
    subtitle: 'A personal brand, a 3D-creator site, and a custom CMS',
    category: 'branding',
    coverImage: '/images/portfolio/shareefico/new-cover-poster.jpg',
    coverVideo: '/videos/shareefico-cover.mp4',
    mockups: [
      '/images/portfolio/shareefico/new-home.jpg',
      '/images/portfolio/shareefico/new-work.jpg',
      '/images/portfolio/shareefico/new-brand.jpg',
    ],
    description:
      'A personal brand, a full brand evolution, and an Awwwards-grade 3D-creator personal site — plus the custom CMS and content engine behind it.',
    behanceUrl: 'https://www.behance.net/gallery/238575625/Shareefico-Personal-Brand',
    tags: ['Branding', 'Identity', 'Web Design'],
    filters: ['Brand & Identity'],
  },
  {
    id: 'project-you',
    title: 'Project You',
    subtitle: 'A calm life-OS that begins at first light',
    category: 'Application Development',
    coverImage: '/images/portfolio/project-you/cover-poster.webp',
    coverHasTitle: true,
    mockups: [
      '/images/portfolio/project-you/today.webp',
      '/images/portfolio/project-you/quran.webp',
      '/images/portfolio/project-you/habits.webp',
    ],
    description:
      "A calm life-operating-system with a faith soul — goals, habits, projects, journal, focus, health, finance and a verse-by-verse Qur'an companion in one gentle place that begins each day at first light. Rebranded from 'Aurora' to 'Noor' and built end to end at Itqan on React, TypeScript, Supabase and Claude. Live at projectyou.app.",
    tags: ['Product Design', 'Brand & Identity', 'Application Development'],
    filters: ['Application Development', 'Brand & Identity', 'UI/UX Design'],
  },
  {
    id: 'medacs',
    title: 'Medacs',
    subtitle: 'Healthcare Platform',
    category: 'ui-ux',
    coverImage: '/images/portfolio/medacs/cover.png',
    mockups: [
      '/images/portfolio/medacs/mockup-1.png',
      '/images/portfolio/medacs/mockup-2.png',
      '/images/portfolio/medacs/mockup-3.png',
    ],
    description: 'A modern healthcare platform designed for clarity and ease of use.',
    tags: ['UI/UX', 'Web Design', 'Healthcare'],
    filters: ['Brand & Identity', 'UI/UX Design'],
  },
  {
    id: 'nexilink',
    title: 'Nexilink',
    subtitle: 'Digital Platform',
    category: 'ui-ux',
    coverImage: '/images/portfolio/nexilink/cover.png',
    mockups: [
      '/images/portfolio/nexilink/mockup-1.png',
      '/images/portfolio/nexilink/mockup-2.png',
      '/images/portfolio/nexilink/mockup-3.png',
    ],
    description: 'A seamless digital platform connecting users with essential services.',
    tags: ['UI/UX', 'Web Design', 'Platform'],
    filters: ['Brand & Identity'],
  },
  {
    id: 'oud-closet',
    title: 'Oud Closet',
    subtitle: 'Luxury Modest Fashion',
    category: 'branding',
    coverImage: '/images/portfolio/oud-closet/cover.png',
    mockups: [
      '/images/portfolio/oud-closet/mockup-1.png',
      '/images/portfolio/oud-closet/mockup-2.png',
      '/images/portfolio/oud-closet/mockup-3.png',
    ],
    description:
      'Brand identity, AI-generated imagery & video, and a bespoke Shopify storefront for a founder-led luxury abaya house.',
    tags: ['Branding', 'Web Design', 'E-commerce', 'Luxury'],
    filters: ['Brand & Identity'],
  },
  {
    id: 'itqan-crm',
    title: 'Itqan Studio CRM',
    subtitle: 'Custom CRM & Operations Platform',
    category: 'Application Development',
    coverImage: '/images/portfolio/ITQAN-CRM-MKP-MCBK2.png',
    mockups: [
      '/images/portfolio/ITQAN-CRM-MKP-MCBK.png',
      '/images/portfolio/ITQAN-CRM-MB-MKP.png',
      '/images/portfolio/ITQAN-CRM-MB-MKP2.png',
    ],
    description:
      'A bespoke internal operations platform built for Itqan Studio — managing projects, pipeline, invoicing, expenses, and financial reporting in one unified system. Built with Next.js 14 and Supabase.',
    tags: ['Application Development', 'CRM', 'Platform'],
    filters: ['Application Development'],
  },
];
