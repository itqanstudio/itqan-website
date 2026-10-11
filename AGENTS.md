# Itqan Studio Website — Agent Instructions

> Source of truth for how work is done in this repo. If you change a convention,
> update this file in the same PR. `Claude.md` covers brand and design intent;
> this covers engineering practice.
>
> Sections 3 and 4 are the ones that actually save time. They exist because
> someone already lost an afternoon to each entry.

## Project overview

Marketing site for Itqan Studio (`itqanstudio.com`) — Next.js 14 App Router,
React 18. Content for the lead-magnet funnel comes from Notion. The `/support`
page posts tickets into the CRM.

**Hosting — read [`DEPLOYMENT.md`](DEPLOYMENT.md) before any deploy work.** It is
authoritative and this section is only a pointer. In short: the site runs on
**AWS EC2 `52.212.71.212` (eu-west-1), managed by Coolify** (app `itqanstudio`,
nixpacks, :3001). It moved **off Netlify in 2026-06**. Deploy = `git push origin
main`; a GitHub webhook rebuilds in Coolify. Env vars live in Coolify, not in a
`.env` on the box.

## Tech stack

- **Framework:** Next.js 14.2 App Router, React 18, TypeScript 5
- **Styling:** Tailwind, self-hosted fonts via `next/font`
- **Motion:** `framer-motion`, `lenis` (smooth scroll), `next-view-transitions`
- **Content:** `@notionhq/client`
- **Analytics:** self-hosted **Umami** (cookieless) + **PostHog** (consent-gated)
- **Email:** `nodemailer`

## Common tasks

```bash
npm run dev          # localhost:3001
npm run typecheck    # tsc --noEmit
npm run build        # next build
npm test             # vitest + brand data, prune and routing script tests
```

---

## 1. What "done" looks like

- `npm run typecheck` and `npm run build` pass. CI
  (`.github/workflows/ci.yml`) runs exactly those, plus gitleaks over full
  history (**blocking**), `npm audit` (advisory) and Semgrep (advisory).
- Performance is a feature here, not a nice-to-have: `1c693ee` and `a36b73c`
  were spent getting CLS to 0 and a11y to 100. Do not regress them casually —
  reserve space for anything that loads late.
- Conventional commit prefixes: `feat(scope):`, `fix(scope):`, `perf(scope):`,
  `docs:`.
- `handover.md` updated.

## 2. Conventions specific to this codebase

- **Analytics config is read at REQUEST time, not build time.** See §3.
- **Fonts are self-hosted through `next/font`** (`a36b73c`). Do not add a Google
  Fonts `<link>` — it reintroduces the render-blocking request and the CLS that
  commit removed.
- **Anything user-submitted goes through the API routes in `src/app/api/`**,
  which validate before forwarding. See §4 on the relay.
- Pages live in `src/app/<route>/page.tsx`; shared chrome in
  `src/components/layout/`; providers in `src/components/providers/`.

## 3. Things that look weird but are intentional

- **`/api/analytics-config` exists instead of a `NEXT_PUBLIC_` variable.** The
  site is statically generated, so a `NEXT_PUBLIC_*` value is inlined at BUILD
  time — if it is absent when the image is built, the tracker is baked in as
  "absent" for the life of that deploy and a restart changes nothing. That is
  the trap `ANALYTICS-SETUP.md` documents for the PostHog key ("you must
  rebuild, not just restart"). The route reads env per request, so toggling
  analytics is an env change plus a restart.
- **Umami runs OUTSIDE the cookie-consent gate; PostHog runs inside it.** Not an
  oversight. Umami sets no cookies, writes no localStorage, and keeps no
  persistent identifier, so there is nothing to consent to — and gating it would
  reduce the numbers to "people who click Accept", which is a biased subset.
  PostHog does set cookies, so it stays gated. Full reasoning in
  `src/components/providers/UmamiAnalytics.tsx`.
- **`netlify.toml` is still in the repo but the site has not run on Netlify
  since 2026-06.** Its build/redirect rules are dead config. Do not wire new
  build behaviour into it and assume it takes effect — nothing reads it.
- **A stale Netlify GitHub integration is still connected** and builds a preview
  on every PR (it shows up in `gh pr checks` as `netlify/...`). It is not
  production and nothing serves from it. Disconnecting it is a housekeeping
  task, not an emergency — but until then, do not read a green Netlify check as
  meaning anything.
- **`ANALYTICS-SETUP.md` (PostHog) and
  `docs/analytics/2026-08-13-umami-self-hosted-runbook.md` are both current.**
  They describe two different trackers that coexist.
- **The `linkedin-client-id` entry in `.gitleaks.toml` is a phosphor icon
  import.** gitleaks fires on a 14-char token next to the word "linkedin", which
  is the exact shape of `import { LinkedinLogo, ... }`. There is no LinkedIn
  OAuth client in this repo.

## 4. Things to never do

- **Never redeploy this site to Netlify or Vercel.** It runs on the AWS/Coolify
  box (`DEPLOYMENT.md`). Both were migrated off in 2026-06 and their remaining
  GitHub integrations are stale.
- **Never add ESLint without reviewing the first run.** `npm run lint` maps to
  `next lint`, and with no ESLint config it drops into an **interactive setup
  prompt** — in CI that hangs the runner until timeout. That is why CI has no
  lint job. Adopt it in its own PR:
  ```bash
  npm i -D eslint@8 eslint-config-next@14.2.29
  printf '{"extends":"next/core-web-vitals"}\n' > .eslintrc.json
  ```
  then add the step.
- **Never derive an outbound email link from Notion content.** `cef196f` and
  `e8b33ca` closed an open spam/phishing relay in `/api/leads/capture` where a
  Notion-supplied URL was emailed to arbitrary addresses. Derive links from the
  site's **own** origin.
- **Never make analytics values `NEXT_PUBLIC_`.** It reintroduces exactly the
  build-time baking problem `/api/analytics-config` exists to solve.
- **Never edit `.gitleaks.toml` to make CI green.** Read the finding first. The
  allowlist is for confirmed non-secrets, each with a written reason.
- **Never add a heavy above-the-fold element without reserving its height.**
  `1c693ee` got hero CLS to 0 by reserving the AI panel's tallest exchange.

## 5. Domain glossary

- **Magnet** — the gated lead-magnet funnel (`/magnet/[slug]`), content from
  Notion. Currently dormant; `ebd9a93` made it 404 rather than 500.
- **Support page** — `/support`, posts tickets into the CRM's ticket desk
  (`a9eb02e`). The CRM side is the `itqan-crm` repo.
- **Umami website id** — the public UUID identifying this site in Umami. Public
  by nature, like a GA measurement id.

## 6. Where bugs and feedback live

- **`handover.md`** — the running session log and the first thing to read.
- Audit reports at the repo root: `AUDIT-2026-04.md`, `SEO-PERF-AUDIT.md`,
  `WEBSITE_V2_ITERATION_REPORT.md`.
- **GitHub PRs on this repo** are the review surface.

## 7. Things that surprised a new contributor recently

- Coolify deploy gotchas are recorded in `df98e85`: **`NODE_OPTIONS` at 512 MB
  OOMs the build**, and **concurrent builds are not supported**.
- The build needs **no environment at all** (verified 2026-08-13) — there is no
  `.env` file in the repo, and the analytics config is request-time. If you add
  a build-time env dependency, add dummy values to CI in the same PR.
- There are no tests. `@playwright/test` is a devDependency but there is no
  `playwright.config.ts` and no specs. Treat "CI is green" as "it compiles and
  builds", not "it works".

---

## Repository home (2026-08-15)

This repo lives in the **`itqanstudio`** GitHub organisation, not on a personal
account. It moved there on 2026-08-15 along with `itqan-crm` and `itqan-infra`.

```
https://github.com/itqanstudio/itqan-website
```

GitHub redirects the old `ibrahimshareef96-sys/...` URLs, so nothing breaks
immediately — but do not rely on it. A redirect stops working the moment a repo
with the old name is created on the personal account, and the failure surfaces
as a deploy that cannot clone. Coolify's git remote was updated explicitly for
the same reason (`git_repository: itqanstudio/itqan-website`).

If you cloned before the move: `git remote set-url origin https://github.com/itqanstudio/itqan-website.git`

`shareefico-website` deliberately did NOT move — it is Ibrahim's personal brand,
not the agency's, and it stays on the personal account.
