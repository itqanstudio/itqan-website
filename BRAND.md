# Itqan Studio — Brand System

> **Retired on 7 Oct 2026.** This file describes the old brand (plum, mauve, Manrope and Playfair).
> The brand is now v3, "Resolve, the signal i"; its spec and assets live in the private repo
> `itqanstudio/itqan-brand`. Keep this file only as the reference for the live site until it is rebuilt.

**Company:** Itqan Studio FZ LLC
**Meaning:** "Itqan" = Excellence (Arabic)
**Positioning:** Premium brand, product, and systems agency for founders who demand precision.
**Benchmark:** [won.agency](https://won.agency) — matched in craft quality, not visual identity.

---

## Color system

### Primary palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Espresso Plum | `#2f1c2c` | `brand-dark` | Dark backgrounds, primary buttons, nav, footer |
| Mauve | `#cca4c2` | `brand-accent` | Accent on **dark backgrounds only** — headings, icons, highlights |
| Deep Mauve | `#6d4a66` | `brand-accent-on-light` | Accent on **light/cream backgrounds only** — same role as mauve but readable on light |
| Warm Sand | `#d1c2a5` | `brand-accent-secondary` | Secondary accent — borders, subtle highlights |
| Cream | `#fffbf5` | `brand-cream` | Light backgrounds, card backgrounds, text on dark |

### Text colors

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Primary | `#1a1a1a` | `text-primary` | Body text on light backgrounds |
| Secondary | `#666666` | `text-secondary` | Supporting text, descriptions, metadata |
| Light | `#fffbf5` | `text-light` | Text on dark backgrounds |

### Dual accent rule (critical)

`#cca4c2` has poor contrast on light/cream backgrounds. Always apply:
- `text-brand-accent` — on `brand-dark` or any dark section (hero, CTA banner, dark headers)
- `text-brand-accent-on-light` — on `brand-cream`, white, or light-tinted sections (`bg-brand-accent/[0.18]`, `bg-brand-cream`)

### Section rhythm

Alternate dark and light sections. The pattern:
- Dark (`brand-dark`) > Light (`brand-cream` or `brand-accent/[0.18]`) > Dark > Light
- Never place two dark sections adjacent unless separated by a visual break

---

## Typography

### Font stack

| Role | Family | Weights | Tailwind |
|---|---|---|---|
| Primary (headings + body) | Manrope | 400, 500, 600, 700 | `font-sans` |
| Editorial accent | Playfair Display | 400 italic, 700 italic | `font-serif italic` |

### Hierarchy

| Level | Size (desktop) | Weight | Font | Usage |
|---|---|---|---|---|
| H1 | 4rem (64px) | Bold | Manrope | Page hero headlines |
| H1 accent | 4rem (64px) | Regular italic | Playfair Display | Second line of hero, editorial emphasis |
| H2 | 2.5-2.75rem (40-44px) | Bold | Manrope | Section headlines |
| H2 accent | Same as H2 | Regular italic | Playfair Display | Accent line within section headlines |
| H3 | 1.25rem (20px) | Semibold | Manrope | Card titles, subsection heads |
| Body | 1rem (16px) | Regular | Manrope | Paragraphs, descriptions |
| Small | 0.875rem (14px) | Regular/Medium | Manrope | Card body text, UI elements |
| Micro | 0.625rem (10px) | Bold, tracking-wide | Manrope | Section labels, category badges |

### Playfair usage rules

- Always italic, never upright
- Used for: tagline accent lines, pull quotes, editorial emphasis within a headline
- Never for body text, buttons, or navigation
- Max one Playfair line per section headline
- Color: `brand-accent` on dark, `brand-accent-on-light` on light

---

## Voice & copy principles

### Benchmark

Won.agency writes: *"Beautiful sites are easy. Sites that actually convert? That takes strategy, speed, and someone who's done it a hundred times."*

Itqan should match this level of directness and confidence while keeping its own identity.

### Core principles

1. **Outcome-first.** Every headline promises a result, not a process. "We engineer brands that outlast trends" not "We transform your vision into a cohesive digital identity."

2. **Confident, not boastful.** Sound like you don't need to convince anyone. Won says "someone who's done it a hundred times" — no qualifiers, no hedging. Itqan should speak the same way.

3. **No adjective stacking.** Ban phrases like "strategic brand design and digital execution, crafted for founders who value detail, direction, and distinction." One adjective per noun, maximum. Alliteration is not a substitute for meaning.

4. **Short sentences win.** Mix 5-word fragments with 15-word sentences. Never go past 25 words. Let periods do the work that commas used to do.

5. **Speak to the client's ambition, not Itqan's capabilities.** "Your brand, built to close deals" > "We provide comprehensive branding services."

6. **Use sentence fragments as power moves.** "Clean. Intentional. Built to last." — this is permitted and encouraged in headlines and section intros. Not in body paragraphs.

7. **Kill filler words.** Remove: "seamless," "bespoke," "elevate," "leverage," "tailored," "crafted for." Replace with specific, concrete language.

### CTA language

| Old | New | Why |
|---|---|---|
| "Book a meeting" | "Start a conversation" or "Book a discovery call" | "Meeting" is heavy and formal. "Conversation" or "discovery call" is lighter. |
| "Get started" | "Let's talk" | Lower commitment, more human |
| "View our services" | "What we do" or "See the work" | Shorter, more direct |
| "View All Projects" | "All work" or "See more" | Tighter |

---

## Sections removed from homepage (and why)

### Removed: Brand Statement section
**Was:** "Your Brand, Engineered for Performance" + body copy + "Book a meeting" CTA + client logos + testimonial carousel.
**Why:** Repeated the hero's message in different words. Client logos and testimonials were buried inside it instead of standing on their own. The hero should do the hero's job; social proof should follow immediately after, not be nested inside a filler section.
**Where content moved:** Client logos and testimonials moved to a dedicated social proof section directly under the hero.

### Removed: Process Steps section
**Was:** 4 steps — "Select a Plan" > "Request Your Designs" > "We Start Development" > "And We Deliver."
**Why:** Framing made Itqan sound like a design subscription service (Design Pickle, Penji), not a premium agency. "Select a Plan" and "Request Your Designs" are order-taking language, not strategic-partner language. Won.agency has no process section — they let the work demonstrate competence.
**Alternative:** If a process section returns in a future iteration, use strategic framing: "Understand > Define > Design > Deliver" with language emphasizing collaboration and thinking.

### Removed: Benefits comparison section
**Was:** "With Itqan" (checkmarks) vs "Without Itqan" (X marks) — 4 comparison rows.
**Why:** The "with us vs without us" pattern is a template cliche that signals insecurity. Premium agencies don't compare themselves to the absence of themselves. The specific claims ("Junior Designers" vs "Senior Designer") are valid but should be made through social proof and copy confidence, not a comparison chart.

### Removed: FAQ section (from homepage)
**Was:** 7 accordion FAQ items + help box with email/phone CTAs.
**Why:** FAQ on a homepage signals "people have questions about hiring us" rather than "hiring us is the obvious choice." Neither won.agency, Pentagram, Collins, nor Ramotion put FAQ on the homepage. The FAQ content is valuable but belongs on the contact page or a standalone page.
**Where content moved:** FAQ will be added to the contact page in Phase 3 of the rebuild.

---

## Homepage structure (post-redesign)

1. **Hero** — Commanding headline + one-line subhead + single primary CTA + background project imagery
2. **Social proof** — Client logos + one key metric + 2-3 testimonial snippets
3. **Services** — 3-4 service cards, one punchy sentence each, outcome-oriented
4. **Selected work** — Portfolio preview, image-dominant cards, minimal metadata
5. **CTA banner** — Aspirational headline + single CTA on dark background
6. **Footer** — (not a section, but the natural page end)

Six sections. Each one earns its place by doing something the previous section didn't.

---

## Animation guidelines

### Motion library

All animation primitives live in `src/lib/motion.ts`. Use these constants — don't create ad hoc timing values.

| Constant | Value | Use for |
|---|---|---|
| `DURATION_FAST` | 0.28s | Hovers, micro-interactions |
| `DURATION_DEFAULT` | 0.55s | Scroll reveals, section entries |
| `DURATION_SLOW` | 0.8s | Hero entrances, clip-path reveals |
| `SPRING_SNAPPY` | stiffness: 300, damping: 24 | Button presses, card interactions |
| `SPRING_SOFT` | stiffness: 100, damping: 20 | Gentle movements, parallax |

### Restraint rules

- **Hero gets the premium treatment:** SplitText, TextReveal, Parallax, MagneticButton — all permitted
- **Everything else gets fade-up.** `ScrollReveal direction="up"` is the default for all non-hero content
- **Max 2 parallax elements per page** (hero background + one featured project image)
- **No SplitText outside the hero.** Word-by-word reveals lose impact through repetition
- **Always respect `prefers-reduced-motion`** — already implemented in Parallax and MagneticButton components

---

## Design tokens (Tailwind)

Defined in `tailwind.config.ts`. No custom spacing or breakpoint overrides — use Tailwind defaults.

```ts
colors: {
  brand: {
    dark: '#2f1c2c',
    accent: '#cca4c2',
    'accent-on-light': '#6d4a66',
    'accent-secondary': '#d1c2a5',
    cream: '#fffbf5',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    light: '#fffbf5',
  },
},
fontFamily: {
  sans: ['Manrope', 'sans-serif'],
  serif: ['Playfair Display', 'serif'],
},
```

---

## Technical notes

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS v3 with custom theme extensions
- **Animation:** Framer Motion v11, centralized in `src/lib/motion.ts`
- **Forms:** React Hook Form + Formspree (contact), Kit.com (newsletter)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Deploy:** Netlify via Git
- **Target:** Lighthouse 90+ across all metrics
