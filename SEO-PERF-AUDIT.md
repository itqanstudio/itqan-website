# Itqan Studio — SEO + Performance Audit (2026-07-08)

Scope: technical SEO, on-page, Core Web Vitals. Tool: Lighthouse (mobile, real
Chrome) against `https://itqanstudio.com` + live-header/DOM inspection.

## Executive summary

The **SEO foundation is excellent** — Lighthouse SEO **100**, Best-Practices **100**,
a centralized entity graph (Organization + WebSite + Person + Service + Breadcrumb +
FAQ + CreativeWork), correct canonicals, clean sitemap/robots, AI-crawler allowlist.
The problems were all **performance + a few hygiene items**, now largely fixed.

### Lighthouse (mobile) — before → after

| Category | Before | After |
|---|---|---|
| Performance | 61 | **72 → ~90** (CLS fix lands this deploy) |
| Accessibility | 97 | **100** |
| Best-Practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 3.4s | **1.3s** |
| LCP | 4.4s | **2.0s** (good) |
| CLS | 0.19–0.39 | **0** (measured, prod build) |

## Fixed this pass

1. **Render-blocking fonts → `next/font`** (HIGH). The external Google Fonts
   `<link>` was the single biggest paint block. Self-hosted Manrope + Playfair via
   `next/font` (size-adjusted fallback). FCP 3.4→1.3s, Speed Index 8.8→2.0s.
2. **Hero CLS → 0** (HIGH). The AI-visibility panel reserved one line but streamed
   3–4 and varied per cycle, reflowing the hero on every keystroke. Now reserves the
   tallest exchange (invisible ghost + absolute streaming overlay). CLS 0.39→0.
3. **Accessibility contrast** (MEDIUM). Footer secondary text (`/70`,`/80` opacity)
   was below WCAG AA; bumped to full token. A11y 97→100 (sitewide via footer).
4. **`www` → apex 301** (MEDIUM). `www.itqanstudio.com` served a duplicate 200;
   added a permanent redirect in `next.config.mjs` (canonical was already apex).
5. **Security headers** (LOW/best-practice). Added HSTS, X-Content-Type-Options,
   X-Frame-Options, Referrer-Policy, Permissions-Policy.
6. **Dead `/magnet/*` funnel → 404** (separate task, same window). Was 500ing in
   prod (needs `NOTION_TOKEN`, unset); gated behind that flag so it 404s cleanly.

## Remaining / recommended (not blocking)

- **Meta descriptions slightly long** (LOW). DONE 2026-09-26: descriptions are now home
  143, /about 157, /work 158, /services 128 characters; titles with the " | Itqan Studio"
  suffix are /work 60, /about 57, /services 60. Was: home/about/work ~180–192 chars
  (truncate ~160), titles on /work (77c) and /about (71c) truncating at ~60.
- **Unused JS ~295 KiB** (LOW): framer-motion / shader / posthog. TBT is already
  30ms so it's not blocking; consider lazy-loading more of framer-motion if perf is
  chased further.
- **`http → https` is 302** (LOW): Traefik does a temporary redirect; a 301 is
  marginally better. Traefik-level config, not app code.
- **Off-site (the real growth lever, Ibrahim's TODO):** GBP + reviews, GoodFirms/
  Clutch profiles + the 2 Behance decks, "best agencies in Dubai" listicles. These
  move "agency Dubai" + AI-visibility far more than any on-site tweak now.
- **Hreflang / Arabic:** not needed yet (English-only site). If an `/ar` locale ships
  later, add subdirectory locales + reciprocal hreflang + `x-default` (see notes).

## What was already strong (no change needed)

Entity JSON-LD graph, per-page canonicals (self-referencing), sitemap (data-driven,
canonical URLs only), robots (AI crawlers allowed, `/api` disallowed), OG/Twitter
cards, one H1 per page, keyword-aligned titles, `llms.txt`, TTFB ~140ms.
