import type { SiteDict } from './types';

/*
 * Voice rules (itqan-brain): plain sentences with a thing, a number or a name in
 * each. No em or en dashes. No moral closer. No "elevate, empower, seamless,
 * end-to-end, cutting-edge, leverage, unlock, journey", and "solutions" is never
 * a noun for what we sell. Every number here is sourced: Millow and Nexilink from
 * src/data/case-studies.ts and nexilink.se (8 Oct 2026), prices and terms from
 * the signed-off concept and the Itqan service levels.
 */
export const en: SiteDict = {
  lang: 'en',
  dir: 'ltr',
  meta: {
    title: 'Itqan. Private AI for manufacturing, retail and food and beverage',
    description:
      'Itqan builds AI agents for operations, supply chain and customer teams and runs them inside your own cloud account. Your data stays in your region. Dubai and Gothenburg.',
  },
  nav: {
    home: 'Itqan, home',
    links: [
      { href: '/#industries', label: 'Industries' },
      { href: '/#build', label: 'What we build' },
      { href: '/#security', label: 'Security' },
      { href: '/#work', label: 'Work' },
      { href: '/#company', label: 'Company' },
    ],
    cta: 'Book a briefing',
    menu: 'Menu',
    close: 'Close menu',
    switchTo: 'عربي',
    switchLabel: 'اقرأ الموقع بالعربية',
    skip: 'Skip to content',
  },
  hero: {
    kicker: 'Private AI · Manufacturing · Retail · Food and beverage',
    title: ['Private AI for the companies that ', 'make, move and sell.'],
    lead: 'Itqan builds AI agents for operations, supply chain and customer teams, and runs them inside your own cloud account. The data stays in your region. A person on your team approves anything an agent sends.',
    primary: 'Book a 30-minute briefing',
    secondary: 'How we handle your data',
    meta: ['Your cloud', 'Your region', 'Your keys'],
    hint: 'Move through the pixels',
    canvasLabel: 'The Itqan symbol, assembled from scattered pixels',
  },
  strip: {
    label: 'Works with',
    items: ['AWS', 'Microsoft Azure', 'Google Cloud', 'OpenAI', 'Anthropic', 'Mistral', 'Open-weight models'],
  },
  industries: {
    kicker: 'Industries',
    title: ['We start where the ', 'paperwork is heaviest.'],
    lead: 'For each industry there is a first agent we can pilot in three weeks. These are the jobs we look at first.',
    focus: 'Focus',
    items: [
      {
        key: 'manufacturing',
        icon: 'buildings',
        focus: true,
        title: 'Manufacturing',
        sub: 'Supplier email, quality logs and shift reports.',
        items: [
          'Supplier email read, the purchase order found, a reply drafted',
          'Quality and maintenance logs you can question in Arabic or English',
          'Operating procedures answered on the floor, with the page they came from',
          'Shift and production reports written from the line data',
        ],
        first: 'Good first agent: supplier email · 3-week pilot',
      },
      {
        key: 'retail',
        icon: 'store',
        focus: true,
        title: 'Retail',
        sub: 'Store questions, customer messages and product data.',
        items: [
          'Store managers get answers from your own procedures, day or night',
          'Customer replies on WhatsApp and email in Arabic, English and Swedish',
          'Product descriptions and catalogue fields filled from supplier sheets',
          'Returns and complaints sorted and sent to the right person',
        ],
        first: 'Good first agent: store operations · 3-week pilot',
      },
      {
        key: 'fnb',
        icon: 'coffee',
        focus: false,
        title: 'Food and beverage',
        sub: 'Supplier orders, recipes and catering requests.',
        items: [
          'Supplier orders and stock questions answered from the stock sheet',
          'One recipe and spec library for every kitchen and franchise',
          'Booking and catering requests answered and logged',
          'Food safety logs checked for gaps every evening',
        ],
        first: 'Good first agent: catering requests · 3-week pilot',
      },
    ],
  },
  run: {
    kicker: 'One agent, one run',
    title: ['Watch an agent handle ', 'a real morning task.'],
    lead: 'Pick an industry. Each run ends the same way: a person decides.',
    note: 'An illustration. The company, the order and the numbers are made up.',
    replay: 'Play again',
    waiting: 'Waiting for a person',
    runs: [
      {
        key: 'manufacturing',
        tab: 'Manufacturing',
        title: 'A supplier moves a delivery date',
        steps: [
          { time: '07:42', verb: 'Reads', text: 'An email from the resin supplier: purchase order 4471 now arrives on 21 October, not 14 October.' },
          { time: '07:42', verb: 'Checks', text: 'Finds PO 4471 in the ERP: 6 tonnes, booked for the line 2 run on 17 October.' },
          { time: '07:43', verb: 'Flags', text: 'The new date misses the run by four days. Marked urgent for the buyer.' },
          { time: '07:43', verb: 'Drafts', text: 'A reply asking for 2 tonnes by 16 October and the rest on the 21st, in the supplier’s language.' },
          { time: '07:44', verb: 'Hands over', text: 'Nothing is sent. The buyer approves, edits or rejects the draft.', waits: true },
        ],
      },
      {
        key: 'retail',
        tab: 'Retail',
        title: 'A store manager asks about a return',
        steps: [
          { time: '09:15', verb: 'Reads', text: 'The Al Ain store asks: can we take back an opened blender after 20 days?' },
          { time: '09:15', verb: 'Searches', text: 'Finds section 4.2 of the returns policy and its exception for small appliances.' },
          { time: '09:15', verb: 'Answers', text: 'Yes, if it is faulty and the customer has the receipt, up to 30 days. Quotes the section.' },
          { time: '09:16', verb: 'Logs', text: 'Adds the question to the weekly list of what stores ask most.' },
          { time: '09:16', verb: 'Hands over', text: 'If the policy does not cover a case, it asks the regional manager instead of guessing.', waits: true },
        ],
      },
      {
        key: 'fnb',
        tab: 'Food and beverage',
        title: 'A catering request comes in',
        steps: [
          { time: '11:02', verb: 'Reads', text: 'Lunch for 120 people on 30 October. Two vegetarians, one nut allergy.' },
          { time: '11:02', verb: 'Checks', text: 'Kitchen capacity on the 30th, the catering menu and the allergen sheet.' },
          { time: '11:03', verb: 'Drafts', text: 'A quote with three menus, a nut-free plan for one guest and the deposit terms.' },
          { time: '11:03', verb: 'Hands over', text: 'The catering manager approves the price before anything reaches the customer.', waits: true },
        ],
      },
    ],
  },
  build: {
    kicker: 'What we build',
    title: ['Four things we build, ', 'then run for you.'],
    tiles: [
      { icon: 'message-processing', title: 'Agents and workflows', body: 'Agents that read the inbox, draft the order, answer the store and file the report. A person approves what goes out.' },
      { icon: 'file-flash', title: 'Search over your documents', body: 'Procedures, specs, contracts and past orders, answered in plain language with a link to the page.' },
      { icon: 'server', title: 'Private models', body: 'Open-weight models tuned on your records and hosted in your region, for when a general model is not good enough or not allowed.' },
      { icon: 'sliders', title: 'Running it', body: 'Weekly test runs, model upgrades, a monthly cost ceiling and a written note on the fifth of each month.' },
    ],
  },
  security: {
    kicker: 'Security',
    title: ['Your data stays ', 'in your account.'],
    lead: 'Your security team sees the architecture, the data flow and the controls before we index a single document. Nothing goes live until they sign off.',
    flow: {
      label: 'Where your data goes',
      systems: { title: 'Your systems', chips: ['ERP', 'Email', 'WhatsApp', 'Files'] },
      core: {
        title: 'Your cloud account, your region',
        chips: ['Agent', 'Model', 'Search index', 'Audit log'],
        note: 'Nothing leaves your account unless a person approves it.',
      },
      people: { title: 'Your people', chips: ['Approve', 'Edit', 'Hand over'] },
    },
    controls: [
      { icon: 'server', title: 'Your cloud account', body: 'We deploy in your AWS, Azure or Google Cloud account. You hold the keys, the code and the logs.' },
      { icon: 'map', title: 'Your region', body: 'Processing in the UAE or the EU when the model allows it. When it does not, we tell you in writing before we start.' },
      { icon: 'lock', title: 'No training on your data', body: 'We only use providers and settings that keep your content out of model training.' },
      { icon: 'card-id', title: 'Access by role', body: 'Single sign-on and roles. A store manager sees store documents, not payroll.' },
      { icon: 'analytics', title: 'An audit trail', body: 'Every agent action, source and approval is logged, and you can export it.' },
      { icon: 'users', title: 'A person approves', body: 'Anything that leaves the company goes past a person first.' },
      { icon: 'shield', title: 'Attacked before launch', body: 'We test every agent for prompt injection and data leaks before go-live, then rerun the tests every week.' },
      { icon: 'message-processing', title: 'It says it is AI', body: 'When a customer talks to an agent, the agent says so. Article 50 of the EU AI Act requires this from 2 August 2026.' },
    ],
    review: 'For your security review we send the architecture, the data-flow diagram, a data processing agreement and our list of controls.',
    reviewCta: 'Request the security pack',
  },
  how: {
    kicker: 'How we work',
    title: ['From a first call to ', 'an agent that runs.'],
    steps: [
      { n: '01', title: 'Briefing', body: 'Thirty minutes with your leadership. We ask where the hours go and what AI should never touch.', meta: '30 minutes · free' },
      { n: '02', title: 'AI Map', body: 'We pick the three jobs an agent should take first, and write down the hours each returns, the data each needs and the risks.', meta: '1 week · $750' },
      { n: '03', title: 'Pilot', body: 'One agent on one workflow in your cloud, with a test set and a person approving every output.', meta: '3 weeks · fixed price, set in the map' },
      { n: '04', title: 'Run', body: 'More agents, private models where they pay off, and a written note on the fifth of each month.', meta: 'Monthly · 30 days notice' },
    ],
  },
  work: {
    kicker: 'Work',
    title: ['Two products we helped build, ', 'with the numbers.'],
    lead: 'Before AI we built software, and the same release discipline carries over. Our AI case studies go up as each client signs them off.',
    read: 'Read the case',
    cases: [
      {
        slug: 'millow',
        kicker: 'Food producer · Gothenburg, Sweden',
        title: 'Millow',
        body: 'Millow ferments Swedish oats and mycelium into protein. We are the design partner on their two-language website, working beside their in-house engineer and releasing every week.',
        image: '/v3/img/millow-cover.jpg',
        imageAlt: 'The Millow website: oat-protein meatballs under a spotlight',
        imagePosition: '0% 50%',
        stats: [
          { value: '56', label: 'design rounds tracked with the founder' },
          { value: '113', label: 'browser tests before every release' },
          { value: '575', label: 'unit tests in the release gate' },
          { value: '2', label: 'languages, weekly releases since July 2026', gradient: true },
        ],
        external: { href: 'https://millow.co', label: 'millow.co' },
      },
      {
        slug: 'nexilink',
        kicker: 'Onboarding and training software · Sweden',
        title: 'Nexilink',
        body: 'Nexilink gives Swedish municipalities digital onboarding and training on real situations for new staff in welfare services. We helped build the product, from the brand and the research to the web app and dashboard design.',
        image: '/v3/img/nexilink-cover.jpg',
        imageAlt: 'A hand holding a printed Nexilink brochure',
        imagePosition: '50% 30%',
        stats: [
          { value: '1st', label: 'place at the 2024 investor competition', gradient: true },
          { value: '3', label: 'weeks, against an 8 to 16 week norm' },
        ],
        quote: {
          text: 'They didn’t just redesign the product. They rebuilt it into a clean, functional and user-focused experience that perfectly matched our direction.',
          by: 'Abdi Mohamud, Nexilink',
        },
        external: { href: 'https://nexilink.se', label: 'nexilink.se' },
      },
    ],
    inHouse: {
      label: 'We run on it',
      text: 'Our own studio runs on five agents: inbox triage every morning, a sales call turned into a proposal draft, compliance reminders, an end-of-day close and a weekly review.',
    },
    alsoLabel: 'Also shipped',
    also: [
      { name: 'Lemon Garden', note: 'booking platform for a seven-city restaurant chain' },
      { name: 'Oud Closet' },
      { name: 'ShadowFly' },
      { name: 'Avidnote' },
    ],
  },
  faq: {
    kicker: 'Questions',
    title: ['What leadership ', 'asks us first.'],
    items: [
      { q: 'Do you need access to our production systems?', a: 'Read access to the systems the first agent works with, through an account your IT team creates and can switch off. Write access only where a person approves each action.' },
      { q: 'Who owns what you build?', a: 'You do. The code, the prompts, the test sets and the cloud account are yours from day one. If you stop working with us, we hand everything over within 30 days, with no exit fee.' },
      { q: 'Which AI model do you use?', a: 'The one that passes your test set at the lowest cost in the right region. That can be OpenAI, Anthropic, Mistral or an open-weight model on your own servers. When a new model comes out, we rerun the tests.' },
      { q: 'What does it cost?', a: 'The AI Map is $750 and takes a week. The pilot is a fixed price that we write into the map, so you see it before you commit. Running costs are a monthly fee plus your cloud and model bills, passed on at cost.' },
      { q: 'Which languages do you work in?', a: 'Arabic, English and Swedish, for the agents and for the people you talk to at Itqan.' },
      { q: 'How soon can we start?', a: 'The briefing can be this week. After the AI Map is paid, kickoff is within five working days.' },
    ],
  },
  company: {
    kicker: 'Company',
    title: ['Itqan is Arabic for ', 'work done properly.'],
    portraitAlt: 'Ibrahim Shareef, founder and CEO of Itqan, in a white kandura and ghutra under rose light',
    quote:
      'A demo is easy. What we get paid for is the agent that still answers your suppliers correctly in month twelve, after the price list has changed twice and the model has been upgraded once. That is the one we build.',
    quoteBy: 'Ibrahim Shareef, founder and CEO',
    people: [
      { name: 'Ibrahim Shareef', role: 'Founder and CEO · engineering, agents and delivery · Dubai' },
      { name: 'Bisma Aslam', role: 'Co-founder · design, brand and how our agents write · Gothenburg' },
    ],
    offices: [
      { city: 'Dubai', note: 'Clients in the Gulf, in Arabic and English' },
      { city: 'Gothenburg', note: 'Clients in the Nordics, in Swedish and English' },
      { city: 'Ras Al Khaimah', note: 'Itqan Studio FZ-LLC, the registered company' },
    ],
  },
  cta: {
    // U+2011 non-breaking hyphen keeps "30-minute" on one line in the large heading.
    title: ['Start with a ', '30‑minute briefing.'],
    lead: 'For the people who run operations, supply chain, IT and customer service in manufacturing, retail and food and beverage.',
    button: 'Pick a time',
    or: 'Or write to',
  },
  footer: {
    line: 'We build the AI your business runs on, and we stay to run it.',
    cols: [
      {
        title: 'Industries',
        links: [
          { href: '/#industries', label: 'Manufacturing' },
          { href: '/#industries', label: 'Retail' },
          { href: '/#industries', label: 'Food and beverage' },
        ],
      },
      {
        title: 'Trust',
        links: [
          { href: '/#security', label: 'Security' },
          { href: '/book?topic=security', label: 'Security pack' },
          { href: '/privacy', label: 'Privacy' },
        ],
      },
      {
        title: 'Company',
        links: [
          { href: '/#company', label: 'About' },
          { href: '/#work', label: 'Work' },
          { href: '/book', label: 'Book a briefing' },
          { href: 'https://www.linkedin.com/company/110338926/', label: 'LinkedIn', external: true },
          { href: 'https://www.instagram.com/madebyitqan/', label: 'Instagram', external: true },
        ],
      },
    ],
    legal: 'Itqan Studio FZ-LLC · Ras Al Khaimah · Dubai · Gothenburg',
    rights: 'Terms · Cookies',
  },
  caseNav: { back: 'All work', next: 'Next case', cta: 'Book a briefing' },
  cases: {
    millow: {
      slug: 'millow',
      metaTitle: 'Millow case study',
      metaDescription:
        'How Itqan works as the design partner on Millow’s two-language website: 56 design rounds, 113 browser tests and 575 unit tests behind weekly releases.',
      kicker: 'Case · Food producer · Gothenburg, Sweden',
      title: ['Millow: a website that ships ', 'every week.'],
      lead: 'Millow AB ferments Swedish oats and mycelium into clean-label protein. We are their design partner, working beside their in-house engineer in tracked weekly rounds with the founder.',
      facts: [
        { label: 'Client', value: 'Millow AB, Gothenburg' },
        { label: 'Our role', value: 'Design partner beside the in-house engineer' },
        { label: 'Running', value: 'Weekly releases since July 2026' },
        { label: 'Stack', value: 'Next.js · Payload CMS · Tailwind · Playwright · AWS' },
      ],
      heroImage: '/v3/img/millow-site.jpg',
      heroAlt: 'The Millow website on a desktop screen',
      briefTitle: 'The brief',
      brief: [
        'The site already worked. The founder wanted it to feel like the product, and it has to sell to two people at once: a school-kitchen buyer and an investor.',
        'The brand book is strict. Aubergine on light backgrounds, mascots never on salmon, headings of eight words or fewer.',
      ],
      didTitle: 'What we did',
      did: [
        'Turned the brand handbook into six UI rules the engineers build against',
        'Rebuilt the Food Service page around the four numbers a buyer asks for, with a self-playing 30 fps production film',
        'Took the landing hero through three concepts to a light that follows the cursor',
        'Merged the partner logos into one rolling banner of official marks',
        'Put every release behind a local test gate with a Lighthouse performance budget',
      ],
      gallery: [
        { src: '/v3/img/millow-foodservice.jpg', alt: 'The Millow Food Service page with a film hero over oat fields' },
        { src: '/v3/img/millow-cover.jpg', alt: 'Millow product shots arranged as a collage' },
      ],
      resultTitle: 'The numbers',
      stats: [
        { value: '56', label: 'design rounds tracked with the founder' },
        { value: '113', label: 'end-to-end browser tests on every release' },
        { value: '575', label: 'unit tests in the release gate' },
        { value: '2', label: 'languages, Swedish and English', gradient: true },
      ],
      whyTitle: 'Why it is on an AI studio’s site',
      why: 'The release gate. Nothing reaches Millow’s visitors until 113 browser tests pass. We hold every agent we ship to the same rule: a test set it has to pass before it touches your customers, and again every week after.',
      external: { href: 'https://millow.co', label: 'Visit millow.co' },
    },
    nexilink: {
      slug: 'nexilink',
      metaTitle: 'Nexilink case study',
      metaDescription:
        'How Itqan helped build Nexilink, onboarding and training software for Swedish welfare services: brand, research and product design in three weeks, first place at the 2024 investor competition.',
      kicker: 'Case · Onboarding and training software · Sweden',
      title: ['Nexilink: a product built in ', 'three weeks.'],
      lead: 'Nexilink gives Swedish municipalities digital onboarding and training on real situations, so new staff in welfare services find their role faster. We helped build the product.',
      facts: [
        { label: 'Client', value: 'Nexilink, Sweden' },
        { label: 'Our role', value: 'Brand, research and product design' },
        { label: 'Timeline', value: '3 weeks, against an 8 to 16 week norm' },
        { label: 'Result', value: '1st place, 2024 investor competition' },
      ],
      heroImage: '/v3/img/nexilink-site.jpg',
      heroAlt: 'The Nexilink website: new staff need time to feel confident, and Nexilink makes that time shorter',
      briefTitle: 'The brief',
      brief: [
        'In 2024 the founder had an investor competition 21 days away and nothing to show: no product, no brand and no deck.',
        'Today Nexilink is used in Swedish welfare services, where municipalities handle sensitive data. Its data sits on European servers in Amsterdam and every customer can sign a data processing agreement.',
      ],
      didTitle: 'What we did',
      did: [
        'Week 1: brand strategy, a positioning brief, the investor story and the visual identity',
        'Week 2: research with employers, personas and the journey of a new hire',
        'Week 3: the full product design for the web app and the dashboard, tested with users and ready to build',
      ],
      gallery: [
        { src: '/v3/img/nexilink-sign.jpg', alt: 'The Nexilink symbol mounted on an office building' },
        { src: '/v3/img/nexilink-cover.jpg', alt: 'A hand holding a printed Nexilink brochure' },
      ],
      resultTitle: 'The numbers',
      stats: [
        { value: '1st', label: 'place at the 2024 investor competition', gradient: true },
        { value: '3', label: 'weeks from nothing to a tested product' },
        { value: '21', label: 'days between the brief and the stage' },
      ],
      quote: {
        text: 'We brought Itqan in to solve major challenges in our UI and UX, and the results exceeded expectations. They didn’t just redesign the product. They rebuilt it into a clean, functional and user-focused experience that perfectly matched our direction. Itqan is a partner we trust for both speed and quality.',
        by: 'Abdi Mohamud, Nexilink',
      },
      whyTitle: 'Why it is on an AI studio’s site',
      why: 'Three weeks is the length of our AI pilot, for the same reason. A short, fixed window with a decision at the end tells you more than a six-month programme.',
      external: { href: 'https://nexilink.se', label: 'Visit nexilink.se' },
    },
  },
};
