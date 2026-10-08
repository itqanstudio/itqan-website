# Itqan Studio Website

## Brand v3 (7 Oct 2026): read this first

The brand below this section is the OLD brand and is retired for anything new. From 7 Oct 2026 the
brand is v3, "Resolve, the signal i": a pixel stem and square rose dot (the i of itqan) with the arc
radiating in a dusk gradient; Ink #0B0A0D, Bone #F5F1EA, Itqan Rose #EF3A78; Geist, Geist Mono and
Readex Pro for Arabic. Itqan is now an AI studio for decision makers in manufacturing, retail and F&B.

The full spec, assets and the migration checklist live in the private repo `itqanstudio/itqan-brand`
(this repo is public: never copy prices or strategy from there into here). A push to main deploys
production, so push only with Ibrahim's go.

### How the v3 site is built (8 Oct 2026)

- **One root layout per language.** `src/app/(en)/` (lang en) and `src/app/ar/` (lang ar, dir rtl),
  plus `src/app/(admin)/` and `src/app/(legacy)/`. There is no `app/layout.tsx`; each `[...missing]`
  catch-all renders that language's 404. Moving between layouts is a full page load, by design.
- **Copy** lives in `src/content/v3/` (`en.ts`, `ar.ts`, `booking.ts`), typed by `types.ts` so a missing
  Arabic string fails the typecheck. Voice rules: no em or en dashes, no banned words, a fact in
  every sentence, never an invented number. Headings are `[before, highlighted, after]`.
- **Components** in `src/components/v3/`, styles in `src/styles/v3/` (plain CSS with logical
  properties; the symbol never mirrors). The hero canvas and every animation honour reduced motion.
- **Booking**: `src/lib/scheduling/` (SQLite via `node:sqlite` at `/app/.data/itqan.db` on a Coolify
  persistent volume, slot engine, zod validation, SES mail, ics). Public `/book`, `/ar/book`, cancel
  links `/book/cancel/<token>`. Admin at `/admin`: emailed one-time sign-in link for addresses in
  `ADMIN_EMAILS` (default ibrahim@itqanstudio.com), weekly hours, rules, days off, bookings.
  Optional env: `BOOKING_MEETING_URL` (video link in confirmations), `BOOKING_NOTIFY_EMAIL`.
- **Legacy** (old brand, untouched): feedback, support, magnet, thank-you, brand portal.
- Tests: `npm run test:unit` (vitest). Old routes redirect in `next.config.mjs`.

## Brand Identity (old, pre-7 Oct 2026)
- **Company**: Itqan Studio FZ LLC
- **Meaning**: "Itqan" = Excellence in Arabic
- **Tagline**: "Your brand has potential. We give it direction."
- **Tone**: Professional, confident, premium — not corporate or stiff

## Brand Colors
- Primary Dark: #2f1c2c (dark purple backgrounds)
- Primary Accent: #cca4c2 (light pink) — use on DARK backgrounds only
- Accent on Light: #6d4a66 (deeper mauve) — use on LIGHT/CREAM backgrounds only
- Secondary Accent: #d1c2a5 (beige)
- Cream/Warm White: #fffbf5 (card backgrounds)
- Text Primary: #1a1a1a
- Text Secondary: #666666
- Text on Dark: #fffbf5

### Dual Accent Color System
**CRITICAL:** #cca4c2 doesn't read well on light/cream backgrounds. Always apply:
- `text-brand-accent` (#cca4c2) — when element sits on `brand-dark` or any dark section (hero, benefits, CTA banner, dark headers, case study hero)
- `text-brand-accent-on-light` (#6d4a66) — when element sits on `brand-cream`, white, or light-tinted sections (bg-brand-accent/[0.18], bg-brand-cream)

This applies to: Playfair Display italic lines, section label icons, accent-colored UI elements.

## Typography
- **Headings (Primary)**: Manrope Bold — Bold, clean
- **Headings (Editorial/Accent)**: Playfair Display Italic — Used for
  taglines, pull quotes, highlighted phrases (e.g., the mauve-colored
  italic text like "Clarity, Precision & Results")
- **Body**: Manrope — Regular weight, 16px base
- **UI/Navigation**: Manrope — Medium weight

## Design Principles

Follow the design skills in /skills/taste-skill/SKILL.md and /skills/premium-skill/SKILL.md

- Dark sections alternate with light sections
- Cards have subtle rounded corners (8-12px)
- Generous whitespace — let the work breathe
- Purple/mauve gradient accents on dark sections
- Hover states on all interactive elements
- Smooth scroll behavior
- Mobile-first responsive design

## Animation Guidelines
- Page transitions: subtle fade-in
- Scroll animations: elements slide up with opacity
- Hover: scale(1.02) on cards, color transitions on buttons
- Keep animations under 400ms — elegant, not flashy

## Pages & Structure

### Homepage
1. Hero: headline + CTA + hero image
2. Social proof: "Trusted by Leading Brands" logo bar
3. Testimonial carousel
4. Services overview (3 cards linking to details)
5. Process steps (4 steps)
6. Benefits comparison ("With Itqan" vs "Without Itqan")
7. Portfolio preview (3-4 featured projects)
8. CTA section

### About
1. Hero with "About Itqan" headline
2. Mission: "Itqan comes from Arabic meaning Excellence"
3. Values: Excellence in Craftmanship, Precision, Function
4. Team section (REAL photos — Ibrahim, Bisma, Jonny)
5. Languages section
6. CTA

### Work/Portfolio
1. Header with project count and results claim
2. Project grid (filterable by category is a nice-to-have)
3. Each project card links to Behance OR internal case study

### Contact
1. "Book A Call with Us" headline
2. Contact form (Name, Email, Company, Website, Budget, Phone, Message)
3. Testimonial slider alongside form
4. Alternative: "Send Us an Email" + "Schedule a Call" buttons

## Technical Requirements
- Next.js 14+ with App Router
- Tailwind CSS v3+
- Framer Motion for animations
- React Hook Form for contact form
- Responsive: mobile, tablet, desktop
- Target Lighthouse score: 90+ across all metrics
- Deploy to Netlify via Git