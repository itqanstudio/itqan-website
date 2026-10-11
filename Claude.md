# Itqan Studio Website

## Brand v3 (7 Oct 2026): read this first

The brand is v3, "Resolve, the signal i": a pixel stem and square rose dot (the i of itqan) with the
arc radiating in a dusk gradient; Ink #0B0A0D, Bone #F5F1EA, Itqan Rose #EF3A78; Geist, Geist Mono
and Readex Pro for Arabic. Itqan is an AI studio for decision makers in manufacturing, retail and F&B.
The old brand (plum #2f1c2c, mauve #cca4c2, cream, Manrope, Playfair, "Your brand has potential") is
retired everywhere since 11 Oct 2026; never use it, and `BRAND.md` is kept only as history.

The full spec, assets and the migration checklist live in the private repo `itqanstudio/itqan-brand`
(this repo is public: never copy prices or strategy from there into here). The public brand manual
is the portal at /brand (brand.itqanstudio.com), driven by `src/data/brand-spec.ts`. A push to main
deploys production, so push only with Ibrahim's go.

### How the v3 site is built (8 Oct 2026)

- **One root layout per area.** `src/app/(en)/` (lang en), `src/app/ar/` (lang ar, dir rtl),
  `src/app/(brand)/` (the brand portal) and `src/app/(admin)/`. There is no `app/layout.tsx`; each
  `[...missing]` catch-all renders that language's 404. Moving between layouts is a full page load.
- **Copy** lives in `src/content/v3/` (`en.ts`, `ar.ts`, `booking.ts`), typed by `types.ts` so a missing
  Arabic string fails the typecheck. Voice rules: no em or en dashes, no banned words, a fact in
  every sentence, never an invented number. Headings are `[before, highlighted, after]`.
- **Components** in `src/components/v3/` and `src/components/portal/`, styles in `src/styles/v3/`
  (plain CSS with logical properties, no Tailwind; the symbol never mirrors). The hero canvas and
  every animation honour reduced motion.
- **Booking**: `src/lib/scheduling/` (SQLite via `node:sqlite` at `/app/.data/itqan.db` on a Coolify
  persistent volume, slot engine, zod validation, SES mail, ics). Public `/book`, `/ar/book`, cancel
  links `/book/cancel/<token>`. Admin at `/admin`: emailed one-time sign-in link for addresses in
  `ADMIN_EMAILS` (default ibrahim@itqanstudio.com), weekly hours, rules, days off, bookings.
  Optional env: `BOOKING_MEETING_URL` (video link in confirmations), `BOOKING_NOTIFY_EMAIL`.
- **Feedback, support, thank-you, magnet** pages run in the `(en)` layout; feedback.itqanstudio.com
  shows the feedback form without the site nav (host header from middleware).
- **Brand assets** for the portal's library are synced from source folders outside the repo by
  `npm run brand:sync` (see `scripts/sync-brand-assets.mjs`); zips are built at prebuild.
- Tests: `npm test` (vitest unit tests plus the brand data, prune and routing checks). Old routes
  redirect in `next.config.mjs`.

## Technical requirements
- Next.js 14 App Router, TypeScript, plain CSS, framer-motion for interactive motion.
- Responsive from 375 px; Lighthouse 90+ is the target.
- Deploys from `main` to the self-hosted AWS box via Coolify (see `DEPLOYMENT.md`).
