import type { Project } from './projects';

export type FounderPillar = 'identity' | 'system' | 'automation';

export interface CaseStudyPhase {
  pillar: FounderPillar;
  /** e.g. "Days 1-30" or "Week 1-2" — string, not enum, so older shorter engagements can describe their own cadence */
  days: string;
  /** What actually shipped in this phase */
  deliverables: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  category: string;
  coverImage: string;
  /** Optional cover video that replaces coverImage on the detail-page hero. coverImage stays the poster + the fallback for listing cards. */
  coverVideo?: string;
  mockups: string[];
  /** Optional brand/character showcase images (e.g. a brand cover + a mascot/expression sheet). Renders an extra "Brand & character" section on the detail page. Only set for projects with a brand system worth showing on its own. */
  brandShowcase?: string[];
  /** Copy for the brandShowcase section. Optional — defaults to the original Mutqin copy so
   *  existing entries render unchanged. `title.accent` is the italic accent word(s). */
  brandShowcaseCopy?: {
    eyebrow: string;
    title: { lead: string; accent: string };
    body: string;
  };
  challenge: string;
  approach: string;
  result: string;
  services: string[];
  testimonialQuote: string;
  testimonialName: string;
  testimonialCompany: string;
  testimonialImage?: string;
  behanceUrl?: string;
  /** Public-facing live URL for the shipped work, e.g. https://shareefi.co. Surfaces as a "Visit live site" CTA. */
  liveUrl?: string;
  /** Extra external links (e.g. Behance case studies) — surface as pills beside the live-site CTA. */
  links?: Array<{ label: string; href: string }>;
  /** Real duration string, e.g. "3 weeks", "<30 days" */
  duration?: string;
  /** Industry average for comparable scope, e.g. "8-16 weeks" */
  industryAverage?: string;
  /** Quantified outcome — headline stat. e.g. "Won 1st place at investor competition" */
  outcomeMetric?: string;
  /** One-liner scope summary for the at-a-glance strip. e.g. "Brand + product UX redesign" */
  scope?: string;
  /** Optional tech stack for build-type projects. Surfaces as an at-a-glance stat. e.g. "React, TypeScript, Supabase, Claude" */
  stack?: string;
  /** Client's voice about the pain that triggered the engagement */
  beforeQuote?: string;
  /** Phases of the 90-Day Founder OS that ran for this client. Only the ones in scope. */
  phases?: CaseStudyPhase[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'millow',
    title: 'Millow',
    subtitle: "A living website for Sweden's fermented oat protein platform",
    industry: 'Food tech',
    category: 'UI/UX',
    coverImage: '/images/portfolio/millow/cover-collage.webp',
    liveUrl: 'https://millow.co',
    mockups: [
      '/images/portfolio/millow/website.webp',
      '/images/portfolio/millow/fs-hero.webp',
      '/images/portfolio/millow/fs-film.webp',
    ],
    brandShowcase: [
      '/images/portfolio/millow/brand-type.webp',
      '/images/portfolio/millow/brand-color.webp',
    ],
    brandShowcaseCopy: {
      eyebrow: 'The design language',
      title: { lead: 'Six laws,', accent: 'everywhere' },
      body: "Millow's brand handbook is strict, and we treated that as the point. We translated it into six UI laws: type, color on surfaces, pillow seams, the bare biscuit, hard offset shadows and the du-form voice. Every future page starts from rules, not vibes.",
    },
    challenge:
      'Millow AB ferments Swedish oats and mycelium into clean-label protein in Gothenburg. Their site already worked; the founder wanted it to feel like the product: crafted, warm, alive. The brand book is strict (aubergine on light, mascots never on salmon, headings of eight words or fewer) and the site sells to two rooms at once, a school-kitchen buyer and an investor.',
    approach:
      "ITQAN joined as the design partner beside Millow's in-house engineer, working in tracked weekly rounds with the founder. We translated the brand handbook into six UI laws, rebuilt Food Service around the buyer's four numbers and a self-playing 30 fps production film, took the landing hero through three concepts to a cursor-chasing 'biscuit of light', and merged the partner ecosystem into one rolling banner of official marks.",
    result:
      "A living site in two languages behind a serious gate: 575 unit tests, 113 end-to-end browser tests, a Lighthouse performance budget and secret scanning on every merge. The first release shipped mid-August; the full V2 lands early September. The client's own words are on their way; until then the founder's verdict stands below.",
    services: [
      'Design direction',
      'Design system & motion',
      'Page design & build',
      'Local CI & release gates',
    ],
    testimonialQuote:
      'Millow is the best thing I have been part of. Every pixel got argued about, tested, and earned its place.',
    testimonialName: 'Ibrahim Shareef',
    testimonialCompany: "Founder & CEO, ITQAN Studio. The studio's own verdict; the client's testimonial is in collection.",
    testimonialImage: '/images/testimonials/ibrahim-shareef.png',
    duration: 'weekly releases since July 2026',
    outcomeMetric:
      '56 tracked design rounds with the founder, every release behind a green 113-test gate',
    scope: 'Design system · Motion · Food Service rebuild · Landing concepts · Partners',
    stack: 'Next.js · Payload CMS · Tailwind · Playwright · AWS',
    beforeQuote:
      'The brief, August 2026: the site is "MVP++" - now take it to one of a kind.',
    phases: [
      {
        pillar: 'identity',
        days: 'The language · Weeks 1-2',
        deliverables: [
          'The brand handbook translated into six UI laws for the build',
          'Type and color made law: the script always sits under the heading, and every color stays on its approved surfaces',
          'Pillow seams at every color boundary, the bare biscuit, hard offset shadows, and the du-form voice',
        ],
      },
      {
        pillar: 'system',
        days: 'The pages · Weeks 3-5',
        deliverables: [
          "Food Service rebuilt: a film hero over oat fields, the buyer's four numbers, and a self-playing 30 fps story film with claim stickers",
          'Three landing hero concepts, ending in a biscuit of light that chases the cursor',
          'The partner ecosystem merged into one master banner of official marks',
        ],
      },
      {
        pillar: 'automation',
        days: 'The machine · Every week',
        deliverables: [
          'A local CI gate on every release: 575 unit tests, 113 end-to-end browser tests, and a Lighthouse performance budget',
          'The 30 fps pipeline behind the self-playing production film',
          'Tamed the Liquid Glass bar tinting in iOS 26 Safari',
        ],
      },
    ],
  },
  {
    id: 'mutqin',
    title: 'Mutqin',
    subtitle: 'AI Startup Companion',
    industry: 'Product — our own AI companion',
    category: 'Application Development',
    // AI film batch (2026-07-05): Kling loop from a generated title-free plate — a
    // lantern trail climbing a plum dune toward the light (the founder's journey).
    // journey.webp is its poster; the titled hero.webp stays on the /work grid card.
    coverImage: '/images/portfolio/mutqin/journey.webp',
    coverVideo: '/videos/mutqin-journey.mp4',
    liveUrl: 'https://mutqin.xyz',
    mockups: [
      '/images/portfolio/mutqin/wizard.webp',
      '/images/portfolio/mutqin/portal.webp',
      '/images/portfolio/mutqin/mobile.webp',
    ],
    brandShowcase: [
      '/images/portfolio/mutqin/brand.webp',
      '/images/portfolio/mutqin/character.webp',
    ],
    challenge:
      "Founders stall in the gap between 'I have an idea' and 'an investor would fund this.' The tools that promise to close it are cold and form-heavy — a deck builder here, a task app there, a financial model in a spreadsheet nobody opens. Nothing walks a founder from raw idea to a story worth backing, and nothing remembers what they said yesterday.",
    approach:
      'Own the whole loop in one founder-owned product — and give it a face. Mu, a 3D companion, asks a few warm questions instead of printing a form. Those answers auto-populate a living portal: a readiness score, a focused task list, an AI coach that pushes back, generated investor-grade documents, and a public readiness link to share. We designed the brand and the character, built the product on React, TypeScript, Supabase and Claude, and produced every 3D asset in-house.',
    result:
      'Mutqin is live at mutqin.xyz — one onboarding chat becomes a portal a founder actually returns to. It is the clearest proof of how Itqan builds: a brand kit, an in-repo design system and a character system, shipped with the product instead of bolted on afterwards.',
    services: [
      'Product Design',
      'Brand & Character Direction',
      'Full-Stack Engineering',
      'AI Asset Production',
    ],
    testimonialQuote:
      'Every founder we coached hit the same wall — a real idea, but no story an investor would back. So we built the companion we wished they had, and gave it a face. Mutqin is the sharpest example of how we work: brand, system and product shipped as one thing.',
    testimonialName: 'Ibrahim Shareef',
    testimonialCompany: 'Founder, Itqan Studio',
    testimonialImage: '/images/testimonials/ibrahim-shareef.png',
    outcomeMetric:
      'Live AI product — one onboarding chat becomes an investor-ready portal',
    scope: 'AI product — brand, character, product UX and full-stack build',
    stack: 'React, TypeScript, Supabase, Claude',
    beforeQuote:
      'Founders kept stalling between idea and investor-ready. Every tool that promised to help was cold, form-heavy, and forgot them the moment they closed the tab.',
    phases: [
      {
        pillar: 'identity',
        days: 'The soul',
        deliverables: [
          'Mutqin brand identity — name, mark and a mauve-on-plum system',
          'Mu, the 3D founder companion — a six-pose expression system',
          'In-repo design system: tokens, components, voice and motion',
        ],
      },
      {
        pillar: 'system',
        days: 'The skeleton',
        deliverables: [
          'The onboarding wizard — Mu asks warm questions, never a form',
          'The founder portal — readiness score, tasks, progress and documents',
          'Full-stack build on React, TypeScript and Supabase, shipped to mutqin.xyz',
          'Responsive down to a thumb-friendly mobile portal',
        ],
      },
      {
        pillar: 'automation',
        days: 'The heartbeat',
        deliverables: [
          'An AI coach on Claude that pushes back instead of cheerleading',
          "Investor-grade documents generated from the founder's own answers",
          'A live readiness score plus a shareable public readiness link',
        ],
      },
    ],
  },
  {
    id: 'lemon-garden',
    title: 'Lemon Garden',
    subtitle: 'A booking platform for a seven-city restaurant chain',
    industry: 'Hospitality & F&B',
    category: 'Application Development',
    coverImage: '/images/portfolio/lemon-garden/cover-collage.webp',
    liveUrl: 'https://boka.lemongarden.se',
    // Website FIRST — the cover collage leads with it and the gallery confirms it
    // immediately, instead of hiding the concept work at the bottom of the page.
    mockups: [
      '/images/portfolio/lemon-garden/website.webp',
      '/images/portfolio/lemon-garden/mobile.webp',
      '/images/portfolio/lemon-garden/console.webp',
      '/images/portfolio/lemon-garden/formbuilder.webp',
    ],
    brandShowcase: [
      '/images/portfolio/lemon-garden/website.webp',
      '/images/portfolio/lemon-garden/website-mobile.webp',
    ],
    brandShowcaseCopy: {
      eyebrow: 'The website concept',
      title: { lead: 'A garden you can', accent: 'feel.' },
      body: 'Alongside the platform we designed a full website concept for the chain: hand-drawn lemon branches that sketch themselves in as you scroll, postage-stamp buttons, wavy awning bands and a city marquee. Pitched with an interactive live demo — shown here as designed.',
    },
    challenge:
      'Seven brunch restaurants across Sweden, and every table booked by phone or Instagram DM. No shared view of who was coming, no way to cap a sitting before the kitchen drowned, and every "can we cancel?" was a call someone had to answer mid-service. The chain needed real booking infrastructure — and owning it, not renting a per-cover SaaS that charges for every guest.',
    approach:
      "We shipped a working demo on day one and a production system within the week: a bilingual booking page where guests pick city, day and time against live availability, and a hidden staff console behind email-code two-factor login. Every rule the restaurant actually runs is in the owner's hands — opening hours per weekday, party-size windows per city, a minimum booking lead time, even the booking form itself: staff add their own fields (like an allergy question) and choose whether each is optional or mandatory, enforced server-side. Then we kept shipping from the owner's feedback, week after week.",
    result:
      'Live at boka.lemongarden.se on the client\'s own AWS — no per-booking fees, ever. Guests book, reschedule and cancel themselves through signed email links; the kitchen sees exact covers per 90-minute seating; every location has its own login and inbox routing. Overbooking is impossible by design (capacity is checked atomically at write time), and every release passes a multi-model security review before deploy.',
    services: [
      'Full-Stack Engineering',
      'Product Design',
      'Cloud Infrastructure',
      'Web Design Concept',
    ],
    testimonialQuote:
      'Ibrahim from Itqan was very professional and easy to communicate with through the whole project. He made my ideas come to reality in a way I had not expected. Really enjoyed the process and happy with the final result!',
    testimonialName: 'Sarmad Alsadi',
    testimonialCompany: 'Founder, Lemon Garden',
    testimonialImage: '/images/testimonials/lemon-garden.png',
    duration: '1 week to production',
    industryAverage: '3-6 months',
    outcomeMetric: 'Live in production — seven cities booking through one system',
    scope: 'Booking platform · staff console · email layer · website concept',
    stack: 'Next.js, React, TypeScript, PostgreSQL, AWS',
    beforeQuote:
      'Seven restaurants, and every booking lived in a phone call or a DM. Nobody could see the whole day, and nobody could change a rule without asking a developer.',
    phases: [
      {
        pillar: 'identity',
        days: 'The concept',
        deliverables: [
          'A proposed website redesign: hand-drawn lemon branches that sketch themselves in',
          'Postage-stamp CTAs, wavy awning bands, and a city marquee — a garden you can feel',
          'Pitched as a full concept with an interactive live demo (shown here as designed)',
        ],
      },
      {
        pillar: 'system',
        days: 'Day 1-7',
        deliverables: [
          'Guest booking page — live availability per 90-minute seating, bilingual Swedish/English',
          'Hidden staff console with email-code two-factor login, one account per city',
          'Atomic capacity checks so two guests can never book past a sitting\'s limit',
          'Deployed to production on the client\'s own AWS — zero per-booking fees',
        ],
      },
      {
        pillar: 'automation',
        days: 'The service weeks',
        deliverables: [
          'Confirmation, reminder and cancellation emails routed to each city\'s own inbox',
          'Self-service reschedule and cancel through signed links — no login, no phone call',
          'Owner-run form builder: add a field, pick its type, make it optional or mandatory',
          'Per-weekday opening hours, per-city party-size windows, owner-tunable booking lead time',
          'GDPR by design: data-retention purge, minimal public API, rate-limited endpoints',
        ],
      },
    ],
  },
  {
    id: 'nexilink',
    title: 'Nexilink',
    subtitle: 'Digital Platform',
    industry: 'Recruitment & Talent',
    category: 'UI/UX',
    coverImage: '/images/portfolio/nexilink/cover.png',
    mockups: [
      '/images/portfolio/nexilink/mockup-1.png',
      '/images/portfolio/nexilink/mockup-2.png',
      '/images/portfolio/nexilink/mockup-3.png',
    ],
    challenge:
      'No product. No brand. No deck. A competition deadline in 21 days. The founder needed to walk on stage with something investors could actually see, click, and believe.',
    approach:
      'We compressed a 4-month engagement into 3 weeks. Brand strategy + identity in Week 1. UX research with real recruiters + employers in Week 2. Full UI design + tested prototype in Week 3. No phase ran past its deadline.',
    result:
      "Nexilink walked into the 2024 investor competition with a brand investors couldn't ignore and a product they could click through. They placed first. The full identity + UX system became the foundation for the next phase of growth.",
    services: [
      'Brand Strategy & Identity',
      'UX Research',
      'Creative Direction',
      'Market Research & Analysis',
    ],
    testimonialQuote:
      "We brought Itqan in to solve major challenges in our UI and UX, and the results exceeded expectations. They didn't just redesign the product. They rebuilt it into a clean, functional and user-focused experience that perfectly matched our direction. Their ability to listen, analyse and execute quickly made a huge difference for us. Itqan is a partner we trust for both speed and quality.",
    testimonialName: 'Abdi Mohamud',
    testimonialCompany: 'Nexilink',
    testimonialImage: '/images/testimonials/abdi-mohamud.jpeg',
    duration: '3 weeks',
    industryAverage: '8-16 weeks',
    outcomeMetric: 'Won 1st place at investor competition (2024)',
    scope: 'Brand + investor-ready product UX',
    beforeQuote:
      "We had no product, no brand, and no investor story. We needed it all — and we needed it before the competition.",
    phases: [
      {
        pillar: 'identity',
        days: 'Week 1',
        deliverables: [
          'Brand strategy + naming validation',
          'Positioning brief + investor narrative',
          'Visual identity system (logo, type, color)',
        ],
      },
      {
        pillar: 'system',
        days: 'Weeks 2-3',
        deliverables: [
          'UX research with recruiters + employers',
          'User personas + journey mapping',
          'Full product UI design (web + dashboard)',
          'Usability-tested prototype ready for build',
        ],
      },
    ],
  },
  {
    id: 'shareefico',
    title: 'Shareefico',
    subtitle: 'A personal brand, a 3D-creator site, and a custom CMS',
    industry: 'Personal Brand',
    category: 'Branding',
    coverImage: '/images/portfolio/shareefico/new-cover-poster.jpg',
    liveUrl: 'https://shareefi.co',
    mockups: [
      '/images/portfolio/shareefico/new-home.jpg',
      '/images/portfolio/shareefico/new-work.jpg',
      '/images/portfolio/shareefico/new-brand.jpg',
    ],
    challenge:
      "One founder, two podcasts, zero infrastructure. Every episode rebuilt from scratch in a notebook, every clip lost in a folder. Shareefico needed a brand, a system, and a personal site that could carry all three — engineer, designer, storyteller — without picking a favourite. And it had to ship while he ran client work in parallel.",
    approach:
      "We ran it in chapters. First the identity for Shareefico + Barakah Blueprint as two coexisting marks. Then a custom CMS covering idea → script → episode → clip → publish, and an automation layer that distributes across platforms without manual touchpoints. The latest chapter is a full brand evolution and a motion-forward, 3D-creator personal site — a magnetic character that follows you down the page, a scroll-driven wall of real work, and sticky case-study cards — that turns the portfolio itself into the pitch.",
    result:
      "Shareefico runs as a productized content engine, not a founder's pile of notebooks — and now it has a home that looks the part. The new shareefi.co is an Awwwards-grade build: a smiling 3D character, a live marquee of shipped work, and an engineering-spine HUD that proves the operator behind it. Two brands ship 4+ pieces per week from one CMS, and the site itself has become the strongest sales asset. The work is the case study.",
    services: [
      'Brand Identity & Evolution',
      'Motion-Forward Web Design & Build',
      'Content Creation Ecosystem',
      'Automation & CRM Workflow',
    ],
    testimonialQuote:
      'Itqan built the entire Shareefico brand experience with precision and intention. They created a clear identity, visual direction and digital presence that all work together seamlessly. Every detail feels thoughtfully crafted, and the final result elevated the brand far beyond what we imagined at the start. A thorough and highly professional execution.',
    testimonialName: 'Ibrahim Shareef',
    testimonialCompany: 'Shareefico',
    testimonialImage: '/images/testimonials/ibrahim-shareef.png',
    behanceUrl: 'https://www.behance.net/gallery/238575625/Shareefico-Personal-Brand',
    duration: 'under 30 days',
    industryAverage: '12-24 weeks',
    outcomeMetric:
      'Brand, custom CMS, and an Awwwards-grade 3D-creator personal site — shipped end to end',
    scope: 'Brand · brand evolution · personal site · custom CMS · content engine',
    beforeQuote:
      "I was running everything from one notebook. No system, no consistency. Every episode took twice as long as it should have.",
    phases: [
      {
        pillar: 'identity',
        days: 'Week 1',
        deliverables: [
          'Personal brand strategy + voice guidelines',
          'Visual identity system + creative direction',
          'Two-brand architecture (Shareefico + Barakah Blueprint)',
        ],
      },
      {
        pillar: 'system',
        days: 'Weeks 2-3',
        deliverables: [
          'Custom CMS for idea → script → episode → clip workflow',
          'Episode management + clip tracking modules',
          'Content distribution pipeline across both brands',
        ],
      },
      {
        pillar: 'automation',
        days: 'Week 4',
        deliverables: [
          'Automated content scheduling + cross-platform repurposing',
          'CRM workflow integration',
          'Hand-off documentation so future hires can run it',
        ],
      },
    ],
  },
  {
    id: 'project-you',
    title: 'Project You',
    subtitle: 'A calm life-OS that begins at first light',
    industry: 'Product — our own SaaS',
    category: 'Application Development',
    coverImage: '/images/portfolio/project-you/dawn.webp',
    // Phase C — AI film: a Kling-generated dawn loop (title-free source, no text
    // warp) as the cinematic case hero. Old day/night clip kept as a fallback file.
    coverVideo: '/videos/project-you-dawn.mp4',
    liveUrl: 'https://projectyou.app',
    mockups: [
      '/images/portfolio/project-you/today.webp',
      '/images/portfolio/project-you/quran.webp',
      '/images/portfolio/project-you/habits.webp',
      '/images/portfolio/project-you/coach.webp',
      '/images/portfolio/project-you/finance.webp',
      '/images/portfolio/project-you/health.webp',
    ],
    challenge:
      "Every productivity app treats faith as an afterthought — Qur'an memorisation in one app, prayer in another, goals and habits in a third. People carry a whole life in scattered, loud apps that all compete for the same tired attention, with streaks to defend and badges to chase. And the part that matters most — time with the Qur'an, the rhythm of the day's prayers — sits outside all of it, in yet another app that knows nothing about the rest of their life.",
    approach:
      "One calm system, faith woven in, framed as a journey through light. Goals become weeks, weeks become a short list for today; habits, journal, focus, health, finance and calendar share one gentle system instead of ten loud apps. A verse-by-verse Qur'an reader with reading tracking and khatm progress sits beside your goals, and the ambient background follows the five daily prayers, Fajr through Isha. An AI coach reflects on your week and offers the smallest next step — never another alarm. One discipline runs through all of it: never gamified.",
    result:
      "Project You is live at projectyou.app — one quiet home for a whole life, and the first to treat the deen as a first-class citizen rather than a side widget. Two hand-tuned themes, day and night, led by one breathing orb of light, backed by a versioned in-repo design system. A private beta with invitations rolling out — and proof that the Itqan way, a brand kit and a design system shipped with the product, works on our own products before we sell it.",
    services: [
      'Brand & Identity Direction',
      'Product Design',
      'Full-Stack Engineering',
      'AI Asset Production',
    ],
    testimonialQuote:
      "Our first build was 'Aurora' — premium, executive, and a little cold. Exactly the wrong feeling for an app you open at 6am on the day you've fallen behind. So we kept the engineering and swapped the soul: Noor — نور, light. Same code, warmer heart, framed around the moment the day begins at first light.",
    testimonialName: 'Ibrahim Shareef',
    testimonialCompany: 'Founder, Itqan Studio',
    testimonialImage: '/images/testimonials/ibrahim-shareef.png',
    outcomeMetric:
      "Live product — a whole life in one calm place, with the Qur'an beside your goals",
    scope: 'Consumer SaaS — brand pivot, product UX and full-stack build',
    stack: 'React, TypeScript, Supabase, Claude',
    beforeQuote:
      "Every productivity app I tried treated Qur'an and prayer as afterthoughts. Nothing connected the deen with the to-do list. So we built it.",
    phases: [
      {
        pillar: 'identity',
        days: 'The soul',
        deliverables: [
          'The pivot from Aurora (cool mauve, executive, cold) to Noor (warm dawn, faith-rooted)',
          'The orb — sun by day, crescent by night, no face: logo, app icon, loader and in-app companion at once',
          'A warm dawn palette with one accent that means light; Nunito for the UI, Amiri for the Arabic',
          'The signature "hill" curve and a bespoke, emoji-free icon family',
        ],
      },
      {
        pillar: 'system',
        days: 'The skeleton',
        deliverables: [
          'A dashboard that opens at your real time of day; goals → projects → tasks',
          'Gentle habits with a weekly review, a journal, focus sessions, health and finance',
          "A verse-by-verse Qur'an reader with reading tracking and khatm progress, beside your goals",
          'Two hand-tuned themes (day + night) on React, TypeScript and Supabase, shipped to projectyou.app',
          'A versioned in-repo design system that mirrors the live code — the Itqan standard',
        ],
      },
      {
        pillar: 'automation',
        days: 'The heartbeat',
        deliverables: [
          'An AI coach (Anthropic Claude) that reflects on your week, grounded in your own data',
          'An ambient sky that follows the five daily prayers, Fajr through Isha',
          'Higgsfield-generated dawn art for the landing and the cover',
          'Gentle daily nudges — an open door when you miss a day, never a broken streak',
        ],
      },
    ],
  },
  {
    id: 'oud-closet',
    title: 'Oud Closet',
    subtitle: 'Luxury Modest Fashion',
    industry: 'Modest Fashion & Luxury',
    category: 'Branding',
    // AI film batch (2026-07-05): title-free Seedance editorial loop (desert trio at
    // golden hour) as the cinematic case hero; desert-still.webp is its poster frame.
    // The titled cover.png stays on the /work grid card (projects.ts).
    coverImage: '/images/portfolio/oud-closet/desert-still.webp',
    coverVideo: '/videos/oud-closet-desert.mp4',
    liveUrl: 'https://oudcloset.se',
    links: [
      {
        label: 'Website on Behance',
        href: 'https://www.behance.net/gallery/251406253/Oud-Closet-Luxury-Modest-Fashion-Website-Design',
      },
      {
        label: 'Brand identity on Behance',
        href: 'https://www.behance.net/gallery/251390379/Oud-Closet-Brand-Identity-for-Modest-Fashion-Luxury',
      },
    ],
    mockups: [
      '/images/portfolio/oud-closet/mockup-1.png',
      '/images/portfolio/oud-closet/mockup-2.png',
      '/images/portfolio/oud-closet/mockup-3.png',
    ],
    challenge:
      "A founder-led abaya label on a generic Shopify template, behind a logo the founder was embarrassed to show. In a modest-luxury market crowded with look-alikes, Oud Closet needed to feel as warm as the Gulf and as disciplined as quiet luxury — end to end, from the mark to the checkout.",
    approach:
      "We built the house from one idea: the Arabic letter ʿayn (ع), the first letter of عود, oud. A full identity came first — symbol, bilingual logo system, a warm two-temperature palette and type. Then AI-generated editorial imagery and video, so every garment could be shown without a photoshoot. Finally, a bespoke Shopify storefront — designed and hand-built from scratch.",
    result:
      "Oud Closet now reads as a luxury house at every touchpoint — packaging, editorial imagery, and a cinematic storefront with a split-screen product page, hover-to-add sizing and an on-brand slide-in bag. A complete brand and commerce system the founder can scale, piece by piece.",
    services: ['Brand Identity & Strategy', 'Creative Direction', 'AI Imagery & Video', 'E-commerce Design & Build'],
    testimonialQuote:
      'Itqan understood the essence of our brand from the very beginning. They treated our product with respect for its heritage while giving it a modern, premium presence. The outcome felt intentional, refined, and truly representative of who we are.',
    testimonialName: 'Oud Closet',
    testimonialCompany: 'Oud Closet',
    duration: '2 weeks',
    industryAverage: '8-12 weeks',
    outcomeMetric: 'Brand, AI imagery & storefront shipped end-to-end',
    scope: 'Brand identity · AI imagery & video · e-commerce build',
    beforeQuote:
      "We had a beautiful product and a logo we were embarrassed by, on a template that didn't match the house we were trying to build.",
    phases: [
      {
        pillar: 'identity',
        days: 'Weeks 1-2',
        deliverables: [
          'Brand strategy + Khaleeji-luxury positioning',
          'The ʿayn (ع) symbol + bilingual logo system',
          'Warm palette, type system & art direction',
          'AI editorial imagery & video — no photoshoot',
        ],
      },
      {
        pillar: 'system',
        days: 'Weeks 2-3',
        deliverables: [
          'Bespoke Shopify theme, hand-built in Liquid',
          'Split-screen editorial PDP + hover-to-add sizing',
          'On-brand slide-in cart + mobile-first build',
          'Packaging suite + brand guidelines',
        ],
      },
    ],
  },
  {
    id: 'medacs',
    title: 'Medacs',
    subtitle: 'Healthcare Platform',
    industry: 'HealthTech',
    category: 'UI/UX',
    coverImage: '/images/portfolio/medacs/cover.png',
    mockups: [
      '/images/portfolio/medacs/mockup-1.png',
      '/images/portfolio/medacs/mockup-2.png',
      '/images/portfolio/medacs/mockup-3.png',
    ],
    challenge:
      'Three user types — patients, providers, administrators. Four different workflows. One UI that none of them could navigate. Engineering was ready to build, but nobody was sure what to build. Two weeks to find out.',
    approach:
      'Research first — sat with each stakeholder type and watched them actually try to book, schedule, and coordinate care. Mapped the journeys until the friction points were obvious. Designed flows that respected each role without forking the codebase. Tested the prototype with real users before hand-off.',
    result:
      'Engineering unblocked. The product team walked into the build with validated flows for all three stakeholder types and a usability-tested prototype to reference. The 4-month UX phase that was originally scoped became a 2-week sprint.',
    services: [
      'UI/UX',
      'User Interface Design',
      'UX Research',
      'Usability Testing',
      'Prototyping',
    ],
    testimonialQuote:
      'Working with Itqan brought a level of clarity we needed for a complex healthcare product. Their UX research and design process helped us simplify difficult systems into intuitive user journeys. The collaboration was smooth, thoughtful, and highly professional, and the results made a real difference in how our platform functions.',
    testimonialName: 'Adel Habib',
    testimonialCompany: 'Medacs',
    testimonialImage: '/images/testimonials/adel-habib.jpeg',
    duration: '2 weeks',
    industryAverage: '10-16 weeks',
    outcomeMetric: 'Multi-stakeholder flows validated + dev-ready in 14 days',
    scope: 'Healthcare platform UX + UI',
    beforeQuote:
      "Three stakeholder types, four different workflows, and a UI nobody could navigate. We needed clarity before we could build.",
    phases: [
      {
        pillar: 'system',
        days: 'Weeks 1-2',
        deliverables: [
          'UX research with patients, providers, administrators',
          'Validated user journeys across all three stakeholder types',
          'Full UI design + usability-tested prototype',
          'Hand-off package for engineering',
        ],
      },
    ],
  },
  {
    id: 'itqan-crm',
    title: 'Itqan Studio CRM',
    subtitle: 'Internal operations platform',
    industry: 'Internal — we eat our own cooking',
    category: 'Application Development',
    coverImage: '/images/portfolio/ITQAN-CRM-MKP-MCBK2.png',
    mockups: [
      '/images/portfolio/ITQAN-CRM-MB-MKP.png',
      '/images/portfolio/ITQAN-CRM-MKP-MCBK2.png',
      '/images/portfolio/ITQAN-CRM-MB-MKP2.png',
    ],
    challenge:
      "We were running Itqan across five disconnected tools. Every Friday I rebuilt the project P&L by hand. Invoices lived in one place, expenses in another, project health in a third. A full day of every week disappeared into reconciliation.",
    approach:
      "We stopped duct-taping and built the system we wanted. One platform — projects, pipeline, tasks, invoices, expenses, financial reporting. UAE-compliant e-invoicing built in from day one, not bolted on. Every screen designed for how the studio actually runs.",
    result:
      "Friday reconciliation collapsed from 8 hours to 15 minutes. Every metric — pipeline value, project margin, cash position — live, on phone or laptop. The studio runs on one system instead of five, and the tool now ships as a product to other studios.",
    services: [
      'Application Development',
      'System Architecture',
      'UI/UX',
      'Internal Tools',
    ],
    testimonialQuote:
      "We didn't adapt our workflow to fit a tool. We built the tool to fit how we actually work. The difference is felt every single day.",
    testimonialName: 'Ibrahim Shareef',
    testimonialCompany: 'Founder, Itqan Studio',
    duration: '6 weeks',
    industryAverage: '4-6 months',
    outcomeMetric: 'Replaced 5 tools. Friday P&L: 8h → 15 min.',
    scope: 'Studio CRM, invoicing, financial reporting, e-invoicing',
    beforeQuote:
      "I was running the studio across five tools. Every Friday I rebuilt the project P&L by hand. I was losing a full day a week to reconciliation.",
    phases: [
      {
        pillar: 'system',
        days: 'Weeks 1-4',
        deliverables: [
          'Full data model — projects, pipeline, tasks, invoices, expenses',
          'Mobile + desktop UI built end-to-end',
          'Project P&L + studio cash position dashboards',
          'Migration from 5 legacy tools',
        ],
      },
      {
        pillar: 'automation',
        days: 'Weeks 5-6',
        deliverables: [
          'UAE-compliant e-invoicing built in (not bolted on)',
          'Automatic credit notes + expense categorization',
          'Real-time KPI digests piped to founder phone',
        ],
      },
    ],
  },
];

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.id === id);
}

export function getAdjacentProjects(id: string): {
  prev: CaseStudy | null;
  next: CaseStudy | null;
} {
  const index = caseStudies.findIndex((cs) => cs.id === id);
  return {
    prev: index > 0 ? caseStudies[index - 1] : null,
    next: index < caseStudies.length - 1 ? caseStudies[index + 1] : null,
  };
}
