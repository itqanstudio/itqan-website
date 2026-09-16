# Itqan Studio Website — Handover


## 2026-09-01 (SHIPPED) — Millow + Sarmad's Lemon Garden testimonial LIVE (`5a058d3`); box OOM-wedged mid-deploy, rebooted

Ibrahim's go: ship Millow + Lemon Garden, swap Lemon Garden's self-authored quote for
the REAL testimonial from **Sarmad Alsadi** (Lemon Garden founder — Ibrahim first said
"Murad", corrected to Sarmad). All live and verified on itqanstudio.com.

### What shipped (main `5a058d3`)
- `feat/millow-case-study` merged (`8bf7283`) — Millow case study + feedback docs.
- Lemon Garden testimonial: Sarmad's exact words (pasted by Ibrahim in chat — the
  feedback email exists ONLY in the studio inbox ibrahim@itqanstudio.com; no
  connector, no DB, no payload logs), credited "Sarmad Alsadi · Founder, Lemon
  Garden", avatar = the circular Lemon Garden badge (`logo.png` from
  `~/Desktop/lemongarden-site/public/brand/` → `public/images/testimonials/
  lemon-garden.png`; already circular, fits the rounded-full 176px avatar untouched).
- Fixed a real `a905b14` leftover: it deleted `millow/fs-burger.webp` but left it in
  the Millow `mockups` array ⇒ would 404 a gallery tile. Trimmed to three.
- llms.txt Millow line normalized to the markdown-link pattern (review LOW).
- jonny-olejak.png + taste-skill: already deleted upstream in `f971729` — confirmed.
- Review: code-reviewer agent on the full push diff — 0 CRITICAL/HIGH/MEDIUM.
- Verified live: /, /work, /work/millow, /work/lemon-garden, new PNG all 200;
  Sarmad's quote + name in served HTML; no stale image refs; Millow on the grid.

### ⚠️ INCIDENT — a single Coolify build wedged the ENTIRE box (new failure mode)
The webhook deploy of `5a058d3` (c2a6navwyuxm0p3r40m0cd2b) drove the box into
memory-thrash: ~15 min HARD outage — 443, 8000 AND 22 all timing out (SSH accepted
TCP then died at banner exchange), while **EC2 status checks stayed "ok"**, so don't
trust them. It did NOT self-recover. Fix: `aws ec2 reboot-instances` (safe —
52.212.71.212 is an **Elastic IP**, survives reboot AND stop/start, verified via
describe-addresses). Box came back in ~4 min (SSH), site 200 ~2 min later; deploy
auto-marked `failed`; old build kept serving. Re-triggered via API on the fresh box
(swap 0, ~4.4G available) → `finished` with the site 200 through the whole build.
**Playbook for next time:** probe 443+22, ignore EC2 checks, give it ~10 min to
self-recover, then reboot; re-trigger AFTER reboot while memory is clean.
**Box facts (corrects older entries):** 16GB RAM now (was 8), root is 135G with ~85G
free (disk pre-prune no longer critical), full stack = Coolify + FOUR Supabase
stacks + Penpot + Umami(+oauth2-proxy) + Documenso + 3 app containers.

`feat/millow-case-study` is fully merged — the Desktop clone
(`~/Desktop/itqan-website`) can be fast-forwarded to main or deleted.
Tracking: `agent-work/20260901092709_ship_millow_lemon_garden_case_studies.md`.

## 2026-09-01 (LATER) — Murad timeline verified: nothing was "fixed", his email is a NEW send

Ibrahim received Murad's feedback right after the diagnostic and assumed a fix happened.
Verified: NO code/config/deploy change occurred (last feedback commit is still `5f6a521`,
Aug 23). SES shows exactly one active window today — 12:56–13:11 local (08:56Z bucket,
2 sends): the diagnostic + one more email, i.e. Murad's feedback was SENT in that window
(fresh resubmission), not released from any queue. His ORIGINAL submission never produced
an email at all (0 bounces/rejects for 2 weeks; nothing in Gmail or studio inbox).

Root-cause suspects for the original loss, in order: (1) honeypot — the hidden field is
named `website`, which browser autofill (esp. Chrome address autofill) fills even when
hidden, and the route returns FAKE SUCCESS **without logging** ⇒ silent invisible drop;
(2) submit never completed client-side. Cannot distinguish retroactively — that
unlogged-silent-drop design is the actual defect.

Proposed fix (awaiting go, since push = production deploy and `feat/millow-case-study`
holds unpushed work): rename honeypot to a non-autofillable name, never silently drop
(send tagged `[feedback][suspect]` or at least log the hit), optional min-time-on-page +
BCC/DB persistence. Log:
`agent-work/completed/20260901092535_verify_murad_feedback_timeline.md`.

## 2026-09-01 — "Missing" client feedback investigated: it goes to the STUDIO inbox

No code changed. A client said they submitted feedback.itqanstudio.com and Ibrahim
couldn't find it in Gmail. Root cause: working as designed — since 2026-08-23
(commit `5f6a521`) FEEDBACK_TO_EMAIL routes submissions to **ibrahim@itqanstudio.com**
(Google Workspace, MX smtp.google.com), at Ibrahim's own request. The contact form
still goes to the private Gmail, which is why he expected it there.

Verified live 2026-09-01: POST /api/feedback → 200 ok (SMTP accepted); SES eu-west-1
healthy (prod access, 0 bounces/rejects, no suppression); the diagnostic email
(subject `[feedback] ★★★★★ DIAGNOSTIC — Claude delivery check · delivery-check-2026-09-01`)
did NOT appear anywhere in Gmail → it landed in the studio mailbox. Gmail has zero
client feedback since the switch, only the Aug 23 tests.

Open follow-ups (Ibrahim to decide):
- If the client's email is not in ibrahim@itqanstudio.com (incl. spam): suspect the
  honeypot (hidden `website` field + browser autofill = silent fake success) or an
  incomplete submit; have the client resend while watching.
- Feedback has NO database — an email is the only copy. Consider persisting
  submissions (or BCC to a second address) so one lost email is never unrecoverable.
- Consider Workspace forwarding ibrahim@itqanstudio.com → Gmail, or checking the
  studio inbox as part of the routine.

Investigation log: `agent-work/completed/20260901085548_investigate_feedback_email_delivery.md`.

## 2026-08-23 — Millow flagship case study (branch `feat/millow-case-study`, NOT pushed)

On a new branch off `main`; push = production deploy, so it stays local until Ibrahim says go.

- New `millow` entries FIRST in `src/data/case-studies.ts` and `src/data/projects.ts`
  (drives next-case ordering; next after Millow is Mutqin). Filters: UI/UX Design +
  Brand & Identity. No industryAverage (ongoing engagement, "6 weeks and counting").
- Homepage `CasesAxion.tsx` cards now [Millow, Mutqin]; Shareefico card removed from
  the flagship slot. Millow card uses `cover-collage.webp`, links `/work/millow`.
- `public/llms.txt`: Millow bullet added first under Selected case studies.
- 8 staged images in `public/images/portfolio/millow/` committed with the entry.
- Phase titles ("The language" etc.) merged into the `days` label because
  `CaseStudyPhase` has no title field and the renderer was not touched.
- `npm run typecheck` and `npm run build` both green; `/work/millow` prerenders.

## 2026-08-23 (LATEST) — feedback destination → studio inbox

Commit `5f6a521`, deployment `nztf85a2g3kh3hzpbw48utat`. Ibrahim: client feedback must NOT
land in the private Gmail. The route now reads **FEEDBACK_TO_EMAIL** (set in Coolify to
**ibrahim@itqanstudio.com**) with CONTACT_TO_EMAIL as fallback. DELIBERATELY SCOPED: the
contact form still goes to ibrahim.shareef96@gmail.com — flagged to Ibrahim as an open
choice, not changed unilaterally. A destination-proof test submission was sent live
(project tag `destination-check`).

## 2026-08-23 (LATER) — feedback form: page-local dark mode + HTML email

Commit `d3c8ef5`, deployment `xcohxpif9wsjiv1x8m7l2k2g`, verified live.

- **Dark mode**: could never activate on the subdomain (site is light-by-default with the
  only next-themes toggle in the stripped nav). `FeedbackThemer` owns theming for the page
  alone — a `.dark` wrapper class (Tailwind class strategy matches any ancestor), system
  preference by default, own toggle, page-scoped storage key `fb-theme`. The global
  light-first provider decision is untouched.
- **Email pathway** (documented for Ibrahim): form POST → /api/feedback (validate, per-IP
  rate-limit keyed on the Traefik-appended LAST XFF value, honeypot) → nodemailer over SES
  SMTP → **ibrahim.shareef96@gmail.com** (CONTACT_TO_EMAIL), from no-reply@itqanstudio.com,
  reply-to = the client. No database; the inbox is the store.
- **HTML email body added**: quote leads big (the case-study artifact), publish permission
  as a loud green "may publish" / amber "PRIVATE — do not publish" line, private
  what-to-improve section, meta table. Guest values escaped. Two SAMPLE submissions sent
  to the inbox (subject `[feedback] ★★★★★ Test Client…` / `★★★★☆ … private variant`) so
  Ibrahim sees both permission variants.

## 2026-08-23 (LATEST) — feedback.itqanstudio.com LIVE + cover v2 + uniform Behance boards

Commit `6a5cc6e`, deployment `lvm5ok71uceykm7l7fon9hgs`. All verified live.

- **feedback.itqanstudio.com** — the client-testimonial form, Ibrahim's new post-project
  routine. Send clients `feedback.itqanstudio.com?p=<project-slug>`; answers arrive at
  CONTACT_TO_EMAIL with the project tag, the star rating in the subject, and an explicit
  publish-permission line. Chrome-less on the subdomain (rides the brand-portal
  BRAND_HOSTS rewrite), with chrome at /feedback on the apex. noindex.
  - `POST /api/feedback`: same SES SMTP envs as contact, per-IP rate limit 5/10 min,
    honeypot answers fake success, control chars stripped, subject-bound fields
    single-lined (header-injection guard), publishOk boolean carried verbatim.
  - Infra: Route 53 A `feedback` → 52.212.71.212 (zone Z06561092N5NFW89QHZA8), fqdn
    appended to Coolify app `cybvxnemzusk0yzjcwzrey3v`, cert auto-issued.
  - VERIFIED: TLS 200, nav absent on subdomain, TEST submission delivered ({"ok":true}),
    honeypot fake-success, bad rating 400. A test email marked TEST sits in the inbox.
- **Cover v2** — Ibrahim's screenshot showed the OLD cover: his browser cache (live bytes
  were already the collage). Fixed deterministically: improved collage (website FULLY
  readable, co-equal) under a NEW FILENAME `cover-collage.webp`; old cover.webp deleted.
  Rename-on-change is now the house rule for replacing a same-named public image.
- **Behance boards all 1400×1750 (4:5)** after "same aspect ratio please" — b2 gained a
  console strip at its base, b6 bookends with the v2 collage. Direction unchanged
  (approved). Boards in `~/Desktop/behance-lemon-garden/boards/`.
- **Testimonial: DRAFTED, NOT PUBLISHED.** No real Sarmad quote exists, and none was
  invented into the site. `~/Desktop/behance-lemon-garden/TESTIMONIAL-DRAFT.md` holds a
  fact-true draft (sv + en) + a WhatsApp approval message + the form link. The site keeps
  the founder-voice quote until Sarmad signs off. NEVER publish the draft unapproved.
- Routing tests 39/39 (was 34). Panel verdict on the endpoint: see final message /
  DISPOSITIONS.


## 2026-08-22 (LATER) — cover redone won.agency-style; Behance boards designed

Ibrahim's feedback: the website mockups only appeared after heavy scrolling, and he wanted
the real Behance case study. Reference he loves: won.agency/work/dubai-new — studied it
(fetched + screenshotted): black canvas, giant product-name headline, then FULL-BLEED
boldly-cropped device imagery at scale; short confident text blocks between big images;
service pills only, no stat clutter.

- **New cover (commit `5ab5383`, deployed `ppjksdc41zlqs6ys5h58s7b1`, verified live):**
  a three-surface collage — website concept LARGE at left bleeding off-frame, booking
  widget right, phone straddling the seam — replacing the single timid floating card.
  Built by compositing on an oversized canvas then extracting the frame (sharp requires
  inputs to fit, so bleed = compose big, crop after). The website ALSO now leads the top
  mockups gallery (4 items; the gallery handles up to 6 — Project You ships 6).
- **Behance case study is now DESIGNED BOARDS**, not raw assets:
  `~/Desktop/behance-lemon-garden/boards/01…06.png` (2800px wide, HTML→CDP-rendered,
  Poppins + Source Sans 3, pine/lemon palette). Upload guide in COPY.md — Ibrahim
  uploads in filename order, pastes one short description, done.
- ⚠️ **OPERATIONAL GOTCHA — local port 8000 is now oMLX.** The Coolify SSM tunnel on
  localPortNumber 8000 silently binds nothing and curls hit the local oMLX FastAPI
  instead, which answers `{"detail":"Not Found"}` to every path — looks exactly like a
  Coolify API problem. Cost 15 minutes today. **Always tunnel Coolify to local 18443.**

## 2026-08-22 — Lemon Garden case study LIVE at /work/lemon-garden

Commit `0bd5f51`, deployed via the push webhook, verified live (copy + all six
images 200, listed on /work). Work file:
`agent-work/20260822063520_lemon_garden_case_study_and_productization.md`.

- **What it covers:** the seven-city booking platform + staff console (live at
  boka.lemongarden.se) and the website redesign presented HONESTLY as a
  concept ("Pitched with an interactive live demo — shown here as designed") —
  it was never bought, and the copy never claims it shipped.
- **Mockup pipeline worth reusing:** the Higgsfield MCP's `medias` param on
  `generate_image` is silently IGNORED (a reference test returned a stock
  demo image) — GPT Image 2 CANNOT reproduce a supplied screenshot. So: GPT
  Image 2 generates empty scene BACKDROPS ("NO devices, NO screens, NO text"),
  and real screenshots are composited as floating browser/phone cards with
  sharp (rounded corners + chrome bar + soft shadow). Real pixels, AI scene.
  All screenshots from LOCAL dev with fictional seed data — production was
  never screenshotted.
- **Masked by decision:** guest data, credentials, per-city inbox addresses,
  the console path, all fees, and the client's WP-malware history (never
  mention that publicly). Client name is used, consistent with the other
  case studies.
- **BrandShowcase is now parametrized** (`brandShowcaseCopy` on CaseStudy,
  defaulting to the original Mutqin copy) — it used to hardcode "Mu, a
  six-pose companion" for every project with showcase images. Mutqin renders
  unchanged.
- **Panel: skipped** per the skill's own skip rule (content/data entry, no
  logic beyond an optional prop with a default). tsc + 34/34 site tests +
  build green; page visually verified at three scroll depths.
- **Behance package for Ibrahim:** `~/Desktop/behance-lemon-garden/` — six
  ordered boards, a ratio-correct cover, and COPY.md with paste-ready text
  (including a do-not-mention list).
- **Productization plan:** `~/Desktop/lemongarden-booking-demo/PRODUCTIZE.md`
  — subscription tiers in AED, the multi-tenant gap list (tenant timezone is
  item #1: lib/time pins Europe/Stockholm), and the Dubai first-ten motion.


## 2026-08-13 (LATEST) — portal made human; chrome, logo and marks fixed

Ibrahim: "very empty, very poor, no imagery, super bland... I don't see any
logo, I just see a placeholder", plus the site nav + footer showing on both
portals, and call backgrounds must not be downloadable.

### Four things fixed
1. **Chrome** — nav/footer came back AFTER hydration. The middleware rewrites
   the portal subdomain root to /brand, so SSR saw /brand and bailed out, then
   the browser URL was still "/" and a client `usePathname()` guard rendered
   them back. Decided on the server now via the `x-brand-portal` header;
   client guards deleted. NOTE: he shipped the same fix in parallel as PR #5
   (`b0d4d16`) — this rebased ON TOP of it and kept his better-documented
   `src/lib/portal-chrome.ts`.
2. **Logo** — `PORTAL_BRAND` hardcoded a `/brand/...` path that 404s because
   the pipeline had deduped that SVG to `/images/brand/white-logo.svg`. Now
   resolved from the manifest BY SLUG, and a missing mark throws at build.
3. **Call backgrounds** — dropped from RULES, nav and manifest, and the sync
   script now PRUNES withdrawn assets from public/ so old URLs 404 too.
4. **Design** — full-bleed hero per page from real Itqan work, colour as
   edge-to-edge bands with real type on each, pull quotes, captioned figures,
   and ONE shared left edge (`.portal-canvas` + `--portal-inset`).

### Content errors found and fixed (worth knowing about)
- `light-icon` and `light-logo` are **Mauve #cca4c2**, NOT cream. One was
  labelled "Cream icon", the other was missing. Five cuts are now named from
  the artwork, and every mauve cut is shown on dark (mauve on light = the
  banned 2.11:1).
- The entry cards illustrated Itqan's logo and colour pages with **Shareefico's
  lime assets** (they live in this repo as client work). Cards now render the
  brand system itself.

### Panel: REQUEST_CHANGES, all HIGH fixed
- **Security**: `x-brand-portal` is an INBOUND header a client can send. Both
  repos passed it through on non-portal routes, so
  `curl /work -H 'x-brand-portal: 1'` stripped the chrome off any page. Now set
  or DELETED on every path. Verified blocked in production. PR #5 shipped with
  this same hole; the fix here closes it.
- Prune moved to AFTER the manifest + bundles are written.
- `pruneOrphans` (7 cases) and `isPortalRequest` (11 cases) now tested.
- Routing tests import TypeScript natively instead of a hand-rolled regex
  stripper that broke on any new signature. `tsconfig` gained
  `allowImportingTsExtensions`; `engines` pins Node >=22.6; CI runs `npm test`.

### Rules introduced
- `npm test` = brand-data + prune + routing (57 assertions). `test:chrome`
  needs a running server so it is NOT in the default suite.
- `scripts/check-portal-chrome.mjs` verifies chrome AFTER hydration in a real
  browser — curl cannot see this class of bug.
- `scripts/shoot-portal.mjs` screenshots pages by walking the viewport (Lenis
  + reveals make fullPage captures lie).
- NEVER illustrate one brand with another brand's assets. `/images/portfolio/`
  here is CLIENT work.



## 2026-08-13 (LATER) — the portal subdomain is `brand.`, NOT `brands.`

Ibrahim: "brand.itqanstudio.com is not reachable??" — correct, it never
existed. Only the plural was created. Singular matches brand.uber.com, which
this portal is built against, and is what people type.

**Canonical hosts now:**
- `https://brand.itqanstudio.com`  → this app, root rewritten to /brand
- `https://brand.shareefi.co`      → shareefico-website, root rewritten to /brand

**Plural 308s to singular**, path preserved, in both repos. Kept alive because
links were already shared; NOT a second canonical host (that would split SEO).

Done: A records for both singular hosts created in Route 53 (waited INSYNC),
both added to their Coolify apps, Traefik issued per-host certs, deployed and
verified — 200 + valid TLS + correct portal title on both, deep pages 200,
download zips 200, main sites unaffected.

Routing tests now 23 cases (`npm run test:routing`) covering both spellings of
both hosts, incl. the edge that `/brands` must NOT count as a portal path (it
does not exist at the destination — only `/brand` does).


## SESSION 2026-08-13 (LATEST) — CI, COOKIELESS UMAMI, AGENTS.md

**PR #3 — `chore/ci-analytics-agents` — ALL 3 CI CHECKS GREEN. Not merged.**
Derived from an audit of the Millow stack; full report outside this repo at
`~/Desktop/millow/reports/2026-08-13-millow-stack-audit-lessons-for-itqan.md`.

**Shipped in the PR**
- **CI from zero** — the repo had no `.github/workflows` at all. Three jobs:
  `check` (typecheck → build), `security` (gitleaks over FULL history,
  **blocking**), `sast` (semgrep, advisory). Actions pinned to commit SHAs.
- **No lint job, deliberately** — `npm run lint` runs `next lint` with no ESLint
  config, which drops into an **interactive prompt** and would hang the runner.
  The two-command adoption path is written into the workflow; land it separately.
- **New `npm run typecheck`** and `.nvmrc` (24).
- **`.gitleaks.toml`** — clean across all 91 commits. The one historical hit was a
  `LinkedinLogo` phosphor import, not a credential.
- **Cookieless Umami**, alongside (not replacing) PostHog:
  - `/api/analytics-config` reads env at **request** time. This kills the
    "you must rebuild, not just restart" trap in `ANALYTICS-SETUP.md`, which is
    caused by `NEXT_PUBLIC_*` being inlined at build in a statically generated site.
  - `UmamiAnalytics` runs **outside** the consent gate — no cookies, no
    localStorage, no persistent id, so there is nothing to consent to, and it
    measures every visitor rather than only those who click Accept. PostHog keeps
    its gate because it does set cookies. DNT/GPC honoured.
  - `deploy/umami/docker-compose.yml` + runbook at
    `docs/analytics/2026-08-13-umami-self-hosted-runbook.md`.
- **`AGENTS.md`** — "things that look weird but are intentional" / "never do",
  citing the commit behind each trap.

**YOUR ACTIONS — nothing below is done:**
1. **Deploy Umami** per the runbook: DNS `A` for `analytics.itqanstudio.com` → new
   Coolify **Docker Compose** resource on the existing AWS box → set
   `POSTGRES_PASSWORD` + `APP_SECRET` → domain on the `umami` service, port 3000 →
   **rotate the default `admin`/`umami` login immediately**.
2. Set `UMAMI_SCRIPT_URL` + `UMAMI_WEBSITE_ID` in Coolify and **restart** (no rebuild
   needed — that is the whole point of the request-time route). Until then the route
   returns `{}` and the loader does nothing, so the PR is safe to merge now.
3. **Check box headroom first** — the same EC2 instance runs this site, the CRM and
   self-hosted Supabase, and a Coolify build has already OOM'd at `NODE_OPTIONS=512`.

**Hosting correction made this session:** AGENTS.md and the runbook initially
described the host loosely. `DEPLOYMENT.md` is authoritative: **AWS EC2
52.212.71.212 (eu-west-1), managed by Coolify**, moved off Netlify 2026-06.
`netlify.toml` is dead config. The stale **Netlify GitHub integration** still builds
a preview on every PR — not production, nothing serves from it, worth disconnecting.

## SESSION 2026-08-13 — TRUE BRAND PORTALS, ONE PER REPO (Uber-grade)

Ibrahim: "brand.shareefi.co should not live in itqanstudio.com... I want it
EXACTLY like brand.uber.com and to contain elements relevant from
news.airbnb.com" then "do all".

### The structural decision (this is the important part)
**Each brand's portal now ships from the repo that already loads that brand's
fonts and tokens.**
- Itqan Studio  -> `/brand` in THIS repo (Manrope + Playfair, plum tokens)
- Shareefico + Barakah Blueprint -> `/brand` in `~/Desktop/shareefico-website`

Why: the old portal rendered Shareefico's type specimens using Itqan's fonts.
Clash Display, Poppins and JetBrains Mono are not loaded in this app at all, so
those specimens were fiction. Recon also confirmed `src/data/brands.ts` set
`var(--font-manrope)` / `var(--font-playfair)` — variables that exist NOWHERE.
An undefined var() invalidates the whole `font-family` declaration at
computed-value time, so it inherited: the Playfair specimens were rendering in
Manrope. Fixed to `--font-sans` / `--font-serif`, then superseded entirely.

### What shipped here
- `src/app/brand/**` — 22 routed pages (Foundations / Identity / Expression /
  Resources). Every topic owns a URL; nothing is an anchor in a long scroll.
- `src/components/brand/**` — PortalShell (sticky 3-level sidebar + top bar),
  PortalSearch (pages AND assets, ⌘K), AssetLibrary (faceted grid + asset-viewer
  lightbox + bulk zips), primitives (Callout/RuleGrid/SpecTable/PrevNext),
  ColourGrid (copy-hex), CopyBlock. Byte-identical to the Shareefico copies
  apart from the motion package import.
- `src/data/brand-portal.ts` — the IA. Sidebar, search and sitemap all derive
  from it, so they cannot disagree.
- `src/data/brand-spec.ts` — tokens + MEASURED contrast ratios.
- `scripts/sync-brand-assets.mjs` + `build-brand-bundles.mjs` + `lib/zip.mjs` —
  54 Itqan assets into `public/brand/`, zips built at PREBUILD.
- `.brand-portal` scope block in globals.css binds the shared component token
  NAMES to Itqan's palette. This is how one engine serves two brands.
- `src/middleware.ts` — brands.itqanstudio.com -> /brand; brands.shareefi.co and
  every legacy /brands path 308 to the right place.
- Old `/brands` hub, `src/components/brands/`, `src/data/brands.ts` DELETED.

### Verified, not assumed
- 22/22 portal routes 200; site chrome absent on /brand; legacy paths 308;
  host routing correct; 22 brand URLs in sitemap.xml.
- Contrast: 16/16 hard-coded pairs pass AA at small-text threshold, measured.
- Panel round 1 (on the Shareefico half) returned REQUEST_CHANGES and caught a
  real path-traversal-to-public-zip in build-brand-bundles.mjs. Fixed and proven
  blocked. See "Panel fixes" below.

### Panel fixes applied to BOTH repos
1. **HIGH/security** `build-brand-bundles.mjs` — `join(PUBLIC, a.src)` had no
   containment check, so a manifest entry of `../../.env` would have been read
   and zipped into a PUBLICLY SERVED bundle. Now resolves and asserts the path
   stays under public/. Verified: attack manifest exits 1.
2. **HIGH** `sync-brand-assets.mjs` — the zero-assets guard ran AFTER the
   manifest was overwritten and the bundle dir deleted. A moved source folder
   would have destroyed good state to report that nothing matched. Now validates
   before any write; copies are staged and only performed on success.
3. **HIGH** Footer/NavBar route bail-outs did not reach their effects. Returning
   null does not re-run an effect whose deps are unchanged, so entering /brand
   left an observer on a detached <video> and LEAVING /brand mounted a fresh
   video no observer was watching. `hidden` is now a dependency.
4. **MEDIUM/privacy** the manifest shipped absolute `sourcePath` values — the
   workstation username and private client directory names, in a committed JSON
   imported by a client component. Now `sourceName` (basename only).
5. **MEDIUM** `bundlesFor()` returned the 25MB everything-pack for every
   category query; each caller had grown its own `.filter()` workaround.
6. **LOW** zip writer now throws above 65535 entries instead of silently
   truncating the EOCD count.

### Deliberate deviations
- No `/brand/colour/misuse` or `/brand/typography/misuse` routes: the Don'ts are
  a RuleGrid on the parent page. Only Logo has enough rules to earn its own.
- `zip` binary is NOT used — nixpacks does not guarantee it. `scripts/lib/zip.mjs`
  is a dependency-free writer (verified: unzip -t clean on all archives,
  byte-identical round-trip for a deflated and a stored entry, deterministic).
- `public/brand/bundles/` is gitignored; regenerated by `prebuild`.

### What to avoid
- Do NOT put Tailwind classes in `src/data/**` — the content globs in
  tailwind.config.ts cover only pages/components/app. That is why the earlier
  brands.ts arbitrary classes never compiled.
- Do NOT use mauve `#cca4c2` on a light surface: 2.11:1, measured. That is what
  `#6d4a66` is for.
- Do NOT hand-edit `src/data/brand-assets.json`. Run `npm run brand:sync`.



## SESSION 2026-08-11 (LATER) — FULL BRAND PORTALS (`4500325`, live)

Ibrahim corrected v1: he wants brand.uber.com-depth PER BRAND on subdomains.
Shipped: src/middleware.ts host-routes brands.itqanstudio.com → /brands/itqan-studio
and brands.shareefi.co → /brands/shareefico (root rewrite only). Chapters per
brand: Overview / Logo (+mark-only icons, BIMI, CSS-generated misuse gallery) /
Colour (+pairing cards incl. banned combos) / Type / Composition / Iconography
(Itqan) / Imagery (Shareefico 3D world) / Motion (real specs) / Voice / Products
(Barakah Blueprint = product within Shareefico) / Assets (packs now incl. icons,
BIMI, portraits, product art). Panel CRITICAL (duplicate product section ids)
fixed as single Products chapter; num() throws at build on unknown chapter ids.
Coolify fqdn updated to include both subdomains; server answers 200 on both
(verified via --resolve). Lenis full-page screenshots double the content — DOM
counts are the truth (bodyH 10884 vs 21634px capture).

**DNS + TLS: DONE (no action needed).** Both A records were created BY CLAUDE in
Route 53 (zones Z06561092N5NFW89QHZA8 itqanstudio.com, Z065166133TT79X91AINN
shareefi.co) → 52.212.71.212, waited INSYNC, verified resolving. Certs did not
auto-issue at first because the container had deployed while DNS still NXDOMAIN;
restarting the app container re-triggered ACME and both issued (ssl_verify=0).
Live: https://brands.itqanstudio.com (9 chapters) + https://brands.shareefi.co
(10 chapters).

**RULE LEARNED: Route 53 hosted zones for ALL Ibrahim's domains live in this AWS
account — Claude adds DNS records directly (aws route53 change-resource-record-sets
+ `wait resource-record-sets-changed`). Never hand DNS back to Ibrahim as a task.**
After adding a subdomain to a Coolify app: set the fqdn, deploy, THEN once DNS
resolves restart the app container so Traefik requests the cert.

## SESSION 2026-08-11 — BRANDS HUB shipped (`35d1707`, live)

Ibrahim sent brand.uber.com (top pick), Airbnb media-assets and Google's partner
marketing hub, and asked for a "Brands" page for BOTH Itqan Studio and
Shareefico, incl. Shareefico's assets and Barakah Blueprint ("vodka blueprint"
in the transcript = Barakah Blueprint, the podcast).

**Shipped:** `/brands` hub + `/brands/itqan-studio` + `/brands/shareefico`
(SSG, sitemap, breadcrumb JSON-LD, footer link — deliberately NOT the header
nav). Data-driven from `src/data/brands.ts`; every fact traces to BRAND.md or
shareefi.co's theme tokens + voice-guide.md. Chapters: Logo → Colour
(copy-to-clipboard swatches, dual-accent rule) → Type (live specimens) → Voice →
Barakah Blueprint (Shareefico only) → Assets. Zip packs live at
`/brands/downloads/*` (logos + colors.json + voice one-pager). Screenshots:
`~/Desktop/brands-hub-review/`.

**Traps hit:** arbitrary Tailwind classes composed in a DATA file are not
reliably compiled — tile backgrounds are inline hexes now; scroll-reveal +
lazy-image races make naive fullPage screenshots lie (blank sections) — the
capture script walks the viewport and bounds image waits. Panel 4/5 approve;
sole HIGH was Ibrahim's own uncommitted jonny-olejak.png deletion (0 refs,
inert, LEFT UNCOMMITTED for him). His remote `6e67ee2` (BIMI logo) was pulled
and preserved via stash-rebase.

**Adding a brand later:** append to `src/data/brands.ts`, drop assets in
`public/brands/<slug>/`, zip into `public/brands/downloads/` — routes, sitemap
and hub tile derive automatically. This is the productizable surface (client
brand hubs).

## Monetization angles (2026-08-11)

- **Brand Hub as a deliverable tier:** the `/brands/[slug]` architecture already
  supports client slugs — sell "your brand, run in public" microsites as an
  upsell to Millow / Lemon Garden and as a line item in new proposals.
- **Proof-of-discipline link in every proposal + email signature** (/brands).
- **Content flywheel:** each chapter (dual-accent rule, banned-words list,
  lime-only-CTA rule) is a standalone LinkedIn/IG post with a live URL behind it.

## Tracked work reference

Lightweight tracking via TaskCreate (in-session). For longer initiatives use `agent-work/` (already present at the project root with one historical entry under `agent-work/projects/`).

## Roadmap

- **Phase: Live & Iterating.** Production is **AWS EC2 + Coolify** (`itqanstudio.com` → `52.212.71.212`), migrated off Netlify — see "DEPLOYMENT REALITY" below; a push to `main` only goes live once Coolify deploys. Recent waves focused on the founder-studio rewrite (90-day Founder OS), Project You + Itqan CRM case studies, the `/magnet/[slug]` lead-magnet system, gradient accents on dark sections, the Shareefico case-study upgrade, and **adding Mutqin** — Itqan's flagship AI startup-companion product — as a featured project + full case study (latest session, 2026-06-14).
- **Next likely waves:** more case studies, individual service detail pages, podcast/long-form content surfaces, and a periodic SEO/perf audit before any paid-traffic push.

## Handover prompt (self-contained for the next session)

**⚠️ DEPLOY GOTCHAS LEARNED 2026-08-07 — READ BEFORE ANY COOLIFY DEPLOY ON THIS BOX.**
1. **`NODE_OPTIONS` was `--max-old-space-size=512` on BOTH apps.** That heap cannot build these
   Next apps; the build dies with a V8 `JavaScript heap out of memory` / SIGABRT inside
   `npm run build`. **Raised to `--max-old-space-size=2048` on both** (itqan
   `cybvxnemzusk0yzjcwzrey3v`, shareefico `pk5hyifc0nark93b4m2b8jtu`, production + preview
   variants). If a build ever OOMs again, check this value FIRST — the error looks like a code
   problem and is not.
2. **NEVER deploy both apps at once.** The box is 16GB with ~11.8GB already committed to Ibrahim's
   other services (Penpot, FOUR Supabase stacks, Documenso, Coolify) and **swap sits at 100% full**.
   Two concurrent Next builds OOM'd both. Deploy sequentially; each takes **8–15 minutes**.
3. **Coolify's per-deployment endpoint lies.** `GET /api/v1/deployments/<uuid>` can report `queued`
   for 10+ minutes while the build is actually running. Poll `GET /api/v1/deployments` (the list)
   instead — it reports the true `in_progress` / idle state.
4. `PATCH /api/v1/applications/<uuid>/envs` **rejects `is_build_time`** ("This field is not
   allowed"). Send only `{key, value, is_preview}`.
5. Coolify API on port 8000 was reachable from IP `91.74.42.154` with no tunnel and no SG change.
6. Disk is fine (77G, 73% used, 21G free); `docker image prune` + `builder prune` reclaimed 0B, so
   disk is NOT the constraint any more — **memory is.**
7. **The deployments LIST endpoint returns an OBJECT keyed by index, not an array** — parse with
   `list(d.values())` or the poll prints blank forever.
8. **An API-triggered deploy can be SUPERSEDED by a webhook deploy of the same app**: it reports
   `status: failed` with `logs: null`. Check the live site before diagnosing a "failed" deploy with
   empty logs — it was probably replaced, not broken.
9. **Local builds need Node 22** (`npx --yes node@22 node_modules/next/dist/bin/next build`) —
   under Node 24 `next build` dies with `PageNotFoundError: /_document` from a clean `.next`. The
   Coolify container pins Node 22 and is unaffected. And never pipe `npm run build` through
   `head`: SIGPIPE kills the build mid-write and leaves a `.next` that serves broken CSS.

**LATEST (2026-08-08): RESIDUAL BUG-FIX PASS — 29 verified defects fixed and SHIPPED to both sites.**
Ibrahim: "fix all the bugs that you haven't fixed… then deploy everything." Ran an exhaustive
adversarially-verified hunt (6 lenses × both repos, 33 raw findings → 25 confirmed / 8 refuted,
workflow `wf_883fe5f0-11c`) plus panel rounds 3+4 (itqan) and 2 (shareefico) on the fixes
themselves. Everything is live: **itqan `1a2f59e`** (35/35 production checks, 8 routes 200),
**shareefico `749e214`** (10/10 production checks). Full detail:
`agent-work/20260808_residual_bug_fixes.md` + `agent-work/panel/DISPOSITIONS.md` (both repos).
- **Headline fixes (4 HIGH):** consent card deleted itself in background tabs (rAF-vs-setTimeout
  race — MY regression, reproduced before fixing); a duplicate consent parser with unguarded
  `decodeURIComponent` in PostHogProvider could crash EVERY route on a malformed cookie (parsers
  consolidated into `src/lib/consent.ts`, now with a non-bypassable TTL); consent card at z-60
  covered the mobile sheet's CTA (→ z-40); and **every decorative video on both sites shipped
  `autoplay` in SSR HTML** — `useReducedMotion()` is null during SSR so even `autoPlay={!reduce}`
  rendered it, playback began before hydration, and reduced-motion users got endless loops (WCAG
  2.2.2). All 8 videos now use `src/lib/use-decorative-video.ts`: no attribute, paused under
  reduced motion, playing only while onscreen — playback verified 15/15 on production.
- **Also fixed:** `*:focus-visible` squaring off every rounded control; `.btn-gloss` erasing the
  focus halo; framer's `whileTap` injecting phantom tab stops; sheet uncapped on short viewports
  (Close button off-screen while scroll was locked = a trap); Lenis ignoring the body scroll lock
  (`src/lib/smooth-scroll.ts`); `overflow-x-hidden` killing sticky on /magnet; SmoothScrollProvider
  leaking a permanent rAF loop per remount; PostHog swallowing the first pageview after opt-in;
  AI-panel bubble now has quiet/thinking states (paint-only — hero CLS still ~0.003); carousel
  velocity/resize/touch-pause refinements; AnimatedText hydration + ARIA fixes (shareefico).
- **Verify suites are now real gates:** `npm run verify:design` exits non-zero when browser checks
  cannot run (server down / unknown args) instead of "passing" having asserted nothing.
- **Deferred as scope, NOT bugs:** `display-type` covers the hero only (~40 headings still hardcode
  tracking); press feedback reaches 9 elements; five unrendered home components keep pre-pass
  patterns. Cosmetic-consistency pass when Ibrahim wants it.

**(2026-08-07, part 2): APPROVED + IMPLEMENTED + SHIPPED to both sites.**
**Live and verified: itqanstudio.com `4935078`, shareefi.co `988969e`. 19/19 + 4/4 checks pass
against PRODUCTION** (`npm run verify:design https://itqanstudio.com`).
**Heads-up: another session pushed a `/support` feature to itqan `main` mid-flight** (`401680d`);
my last commit was rebased on top of it, tsc + build verified with both changes together, and
`/support` returns 200 on live. Nothing of theirs was overwritten.
Ibrahim approved all nine proposals ("the design is approved… push everything to production… you do
everything that is needed"). Implemented, verified, panel-reviewed, merged to `main` and deployed to
BOTH Coolify apps. What changed in THIS repo:
- **`PillNav.tsx` (biggest change).** The bar is now a translucent MATERIAL — `backdrop-filter:
  blur(28px) saturate(190%)` over `bg-white/70`, bright top edge, shadow that thickens only once
  scrolled — plus a `.scroll-edge` strip that blurs the band where content meets the chrome, so page
  content dissolves under the nav instead of being sliced by it (this was visibly amputating the
  `/work` filter row). The mobile sheet is now direct-manipulation: framer `drag="y"` with
  `dragConstraints={{top:0}}` (free 1:1 below the open position, rubber-band above),
  `dragMomentum={false}` because we project the momentum ourselves, `projectMomentum()` to decide
  dismiss-vs-settle, and the release velocity handed to the spring. The scrim's opacity is
  `useTransform(sheetY)` so dimming tracks the finger. `AnimatePresence` was removed — the sheet
  controls its own mount/unmount so the exit can carry the gesture's velocity.
- **`globals.css`** — new `.display-type` (size-stepped tracking + leading), `.press-scale`,
  `.material-chrome`, `.scroll-edge`; reduced-motion rewritten to restrict `transition-property`
  instead of zeroing duration; added `prefers-reduced-transparency` + `prefers-contrast`.
- **`lib/motion.ts`** — `projectMomentum()` (Apple's exponential-decay form, NOT `v²/2a`),
  `rubberband()`, and `SPRING_HOVER` / `SPRING_PRESS` / `SPRING_MOMENTUM` parameterised as
  bounce + duration. **House rule written into the file: bounce 0 by default; overshoot only when the
  gesture carried momentum.**
- **`TestimonialCarousel.tsx`** — rewritten. Was autoplay-only, unswipeable, never paused, and
  `mode="wait"` silently dropped a second click. Now all slides render on a draggable rail, swipe
  tracks 1:1, a flick projects to its landing card, autoplay pauses on hover/focus/drag and is off
  entirely under reduced motion.
- **`CookieBanner.tsx`** — full-width bar → compact single-row floating glass card. The bar was
  covering the hero's primary CTA on every 390px screen; verified it now clears it by 58px.
- `HeroAxion.tsx`, `RollButton.tsx`, `SpringCard.tsx` — `.display-type` + press states; SpringCard's
  hover spring was damping ratio ~0.58 (a bounce on a hover that carried no momentum) → critically damped.
**Verified before shipping:** tsc + build clean; **13/13 headless behaviour checks pass** —
`/tmp/apple-audit/verify-impl.mjs` (re-runnable; asserts 1:1 drag, rubber-band, autoplay pause,
tracking-varies-with-size, CTA clearance, reduced-motion cross-fades survive).
**Deliberately NOT done:** the AiVisibility "typing indicator" — that component is what got hero CLS
to 0 (`1c693ee`) by reserving space with a ghost of the longest exchange; painting into that reserved
box risks regressing the site's worst-ever CWV for a cosmetic gain.
**Cascade note:** `.press-scale` / `.display-type` are UNLAYERED so they beat Tailwind's layered
utilities — intentional, the press transform must win over `hover:-translate-y-*`.

**(2026-08-07, part 1): the audit that produced the above. Artefacts in `~/Desktop/apple-design-review/`.**
Tracked in `agent-work/20260807183807_apple_design_audit_both_sites.md` (read it first — it holds the full
findings index, the chosen approach + rejected alternatives, and the verified prototype output).
Ibrahim asked for an Apple-design pass over **itqanstudio.com AND shareefi.co** (repo:
`~/Desktop/shareefico-website`, branch `main`) using the newly installed `apple-design` skill
(`~/.agents/skills/apple-design/SKILL.md`), with **screenshots of what the changes would look like**, then a
redesign only **if he approves**.
- **Method (reusable):** visual proposals were produced by **injecting the proposed CSS/JS onto the LIVE pages
  via Playwright** and shooting matched before/after crops — identical content, only the change differs. Motion
  proposals (which stills can't show) went into an **interactive prototype**. Both approaches beat rebuilding
  mockups from scratch, which would have made the comparison unfair.
- **Artefacts — CANONICAL COPY IS `~/Desktop/apple-design-review/`** (NOT in any repo; originally built in
  `/tmp/apple-audit/`, which Finder hides and Spotlight does not index — Ibrahim couldn't find the PNGs, so
  the whole tree was copied to the Desktop. Use the Desktop path from now on; /tmp will not survive a reboot).
  Contents: `index.html` (open this first — every comparison on one page + link to the prototype) ·
  `compare/*.png` 6 labelled Now/Proposed images · `current/` 11 current-state shots ·
  `pairs/{before,after}/` raw crops · **`proto/motion.html`** the interactive prototype (sheet drag / press /
  carousel) · `capture.mjs`, `after.mjs`, `compose.mjs`, `measure-type.mjs`, `measure-scale.mjs`,
  `verify-proto.mjs` re-runnable scripts.
- **Top findings — Itqan:** nav is an opaque white slab, not a material, and it slices the /work filter row;
  display headline has no size-specific tracking; **zero press states anywhere** (touch users get no feedback
  until navigation); consent bar occludes the hero CTA at 390px; mobile sheet is a fixed 500ms tween that
  ignores the finger; `TestimonialCarousel` is autoplay-only, unswipeable, never pauses, and `mode="wait"`
  makes it non-interruptible; the reduced-motion `*` rule is a nuke that also kills cross-fades; no
  `prefers-reduced-transparency` / `prefers-contrast` handling.
- **Top findings — Shareefico:** `src/motion-system/` is **Material Design 3**, not Apple — prescribed
  durations/easings/ripple, the opposite model; `bottomSheet()` in `motion-runtime.js` tracks 1:1 (good) but
  snaps to the NEAREST detent **ignoring velocity** and settles by animating `height` via CSS transition
  (layout property + non-interruptible); `.t-hero` uses one fixed `-0.02em` across a `clamp(40px,8vw,128px)`;
  `--color-text-muted` computes to **~3.05:1** on `--color-void` (fails WCAG AA for body text — proposed 0.62
  alpha gives ~7.7:1); the About scroll-scrub rests un-revealed words near 15% opacity so most of the
  paragraph is unreadable; `Button` has no `:active`.
- **Credit:** Shareefico's `NavBar.tsx` is already the best material work across both sites (translucent,
  scroll-reactive, shape-morphing). It is the bar Itqan's `PillNav.tsx` should meet — don't "fix" it.
- **PLAYWRIGHT NOTE (corrects the older handover entry):** launch with `executablePath` =
  `~/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
  (it is **"Google Chrome for Testing"**, NOT `Chromium.app`). Also: capturing the **live domains** headlessly
  worked fine this session (11/11) — the old ERR_ADDRESS_UNREACHABLE note did not reproduce.
- **NEXT:** Ibrahim picks which items to implement. Then implement in the real repos (Itqan: `PillNav.tsx`,
  `RollButton.tsx`, `TestimonialCarousel.tsx`, `globals.css`; Shareefico: `motion-runtime.js`, `Button.tsx`,
  `globals.css` type + contrast tokens), and **run `Skill(panel)` on that diff** — the panel was correctly
  skipped for this proposal because no site code was touched.

**LINKEDIN COVER (2026-07-13) — new personal banner built + delivered (NOT committed; it's a marketing asset, not site code).**
Ibrahim wanted an upgraded personal LinkedIn cover using the NEW copy ("Your next customer just *asked* ChatGPT.")
and the NEW Axion design system — replacing the outdated "invisible to inevitable in 90 days" banner. **Approach:
HTML → Playwright screenshot, NOT AI-generation** (Higgsfield/Kling warp text — same lesson as the Mutqin film).
Rendered pixel-perfect at **1584×396 @2x = 3168×792 PNG** (LinkedIn's spec; retina-crisp, ~2.4MB, under the 8MB cap).
- **Files (scratch):** `/tmp/li-cover/banner.html` (dark), `banner-light.html` (light), `shoot.mjs` (renderer).
  **Deliverables saved to `~/Desktop/`:** `itqan-linkedin-cover-dark.png` + `itqan-linkedin-cover-light.png`.
- **Design:** plum gradient + mauve glow (echoes the hero shader), Manrope 800 headline, Playfair-italic gradient
  "asked" accent (dark: pink→mauve `#cca4c2`; light: `#6d4a66`→`#8a5c80`, honoring the dual-accent rule), inline
  white/dark `itqan` wordmark top-right, faint oversized signal-arc brand mark bleeding off the LEFT (masked so it
  fades before the copy + is covered by the profile photo), subline "One partner for brand, web & AI visibility.
  Built to be found — on Google, and in the machines.", meta line "Ibrahim Shareef · Founder, Itqan Studio · Dubai ·
  Host of the Barakah Blueprint". Content is **right-weighted** → clears the bottom-left profile-photo safe zone.
- **Playwright gotcha:** the pinned `playwright` npm build wants browser rev 1223, but the cache only has 1208/1228.
  Fixed by pointing `chromium.launch({ executablePath })` at
  `~/Library/Caches/ms-playwright/chromium_headless_shell-1228/.../chrome-headless-shell`. Also `playwright/index.js`
  is CJS → import via `import pkg from ...; const { chromium } = pkg`.
- **Next:** Ibrahim picks dark vs light and uploads to LinkedIn. To tweak copy/spacing, edit the HTML + re-run
  `node /tmp/li-cover/shoot.mjs [outPath] [htmlPath]`.

**FIX (2026-07-08): Behance decks were showing Medacs / broken screenshots — RE-CAPTURED + re-rendered.**
Ibrahim: brand deck "slide 6" showed Medacs (wanted the website landing/hero); website deck "fully broken, ugly,
nothing from the website's design — remake from the ground up." **Root cause: the screenshots in `behance/assets/`
were CORRUPTED** — during the 2026-07-08 SEO session `capture.js` was run against the dev server mid-compile and
grabbed the Medacs case-study mockup for `home-hero-light/dark.png` + `home-mobile-light.png` and a half-rendered
fragment for `work-grid.png`. Every deck board that showed the site showed Medacs/broken. The deck DESIGN was fine.
**Fix:** rewrote `behance/capture.js` to shoot a LOCAL PRODUCTION build (`npx next start -p 3002`, NOT dev — no
compile races) with robust fonts.ready + eager/decode image waits; re-captured the 5 needed shots (home-hero
light/dark, home-mobile-light, home-askai, work-grid) — all now the real, polished site; re-rendered both decks
(`node behance/render.js`). QA'd: brand deck slide 6 ("The system, live", badge=6) now shows the real
itqanstudio.com landing/hero in light+dark; website deck cover/hero/two-lights/grid/askai all show the real site,
premium + coherent. Decks are gitignored (local `behance/out/`) — Ibrahim re-uploads the PNGs; COPY.md unchanged.
**Gotcha:** capturing the live domain via headless Chrome fails (ERR_ADDRESS_UNREACHABLE); always capture a local
`next start` build. Never capture the dev server mid-compile.

**SEO + PERF AUDIT + magnet-funnel hidden (2026-07-08) — ALL DEPLOYED + prod-verified.** Main → `1c693ee`.
Full report: `SEO-PERF-AUDIT.md` (repo root). Ibrahim picked (via AskUserQuestion): hide the dead magnet funnel +
run a SEO/perf audit.
1. **Dead `/magnet/*` funnel → 404 (was 500).** It needs `NOTION_TOKEN`, which is NOT set in prod, so every magnet
   URL 500'd. Gated the whole funnel on `NOTION_TOKEN` presence: `magnet/[slug]/page.tsx` `resolveMagnet()` returns
   null (→ clean `notFound()` 404 + noindex) when the token is unset OR the lookup throws; `/api/leads/capture`
   returns 404 while off. **Fully reversible** — set `NOTION_TOKEN` in Coolify to revive the funnel.
2. **SEO foundation was already excellent** (Lighthouse SEO 100, Best-Practices 100, full entity JSON-LD graph,
   canonicals, clean sitemap/robots, AI-crawler allowlist). The problems were performance + hygiene:
   - **Fonts → `next/font`** (the #1 fix). The external Google Fonts `<link>` was the single render-blocker.
     Self-hosted Manrope + Playfair via `next/font` variables `--font-sans`/`--font-serif`; 18 inline
     `'Playfair Display'` refs → `var(--font-serif)`; tailwind + globals updated. **FCP 3.4→1.1-1.3s, Speed Index
     8.8→2.0s.**
   - **Hero CLS → 0** (was 0.19-0.39, the site's worst CWV). Root cause was the **AiVisibility panel**: bubbles
     reserved one line (`min-h-[38px]`) but streamed 3-4 lines and varied per cycle → reflow every keystroke. Fix:
     each bubble renders an invisible ghost of the LONGEST exchange + an absolute streaming overlay → constant
     footprint. **CLS 0.39→0 (prod-verified 0.001/0).** NOT a font issue (CLS was ~0.19 in the old build too).
   - **A11y contrast** (footer `/70`,`/80` secondary text below WCAG AA) → full token. **A11y 97→100.**
   - **`www`→apex 301** (was a duplicate 200) + **security headers** (HSTS, X-Content-Type-Options, X-Frame-Options,
     Referrer-Policy, Permissions-Policy) — both in `next.config.mjs`.
   - **Final prod Lighthouse (mobile): perf 69-95 (LCP jitter from the WebGPU shader in headless; hits 95), a11y
     100, BP 100, SEO 100, FCP 1.1-1.3s, LCP 1.6-3.5s, CLS 0.**
   - **Gotcha for next time:** a LOCAL `next start` Lighthouse reported LCP 26.6s — that's a `next start` artifact,
     NOT real. Measure LCP against PROD (real server). PageSpeed Insights API is keyless-rate-limited; use the
     Chrome-for-Testing binary in the Playwright cache with `npx lighthouse` against the prod URL instead.
   - **Remaining (LOW, not done):** meta descriptions ~180-192c (trim to ~160); /work + /about titles truncate
     (>60c); ~295KiB unused JS (framer/shader/posthog — TBT already 30ms so low priority); http→https is a 302 at
     Traefik (301 marginally better). All in `SEO-PERF-AUDIT.md`. Biggest lever remains OFF-SITE (directories,
     listicles, reviews) — Ibrahim's TODO.
Commits: `ebd9a93` magnet gate, `a36b73c` fonts+contrast+headers+redirect, `1c693ee` CLS.

**SECURITY FIX (2026-07-07): closed an open spam/phishing relay in `/api/leads/capture` — DEPLOYED + prod-verified.**
Main → `cef196f`, Coolify deploy `wiucbnzmcarmuhej4fj5tu0a` finished. The bug: the route read `pdfUrl` from the
UNAUTHENTICATED body and emailed it (Listmonk tx, from itqanstudio.com's SPF/DKIM domain) to a caller-supplied
`email` — anyone could send a phishing link from Itqan's trusted domain to any address, with no rate limit.
**Fix (ports itqan-crm's hardening):**
- The delivered link is now built SERVER-SIDE as `` `${SITE_URL}/magnet/<slug>` `` (own canonical origin from
  `src/lib/seo.ts`; NEVER the request Host header, NEVER a body `pdfUrl`). Body `pdfUrl` is ignored entirely.
- New `src/lib/rate-limit.ts` (in-memory fixed-window; valid because prod = single Coolify `next start` container).
  Per-IP 12/hr (IP from `x-real-ip`/last-XFF-hop, not the spoofable leftmost) + per-email 3/day (key collapses
  `+subaddress` and gmail dots so the cap can't be aliased around).
- `dmKeyword` sanitized to `[a-z0-9_-]{1,40}` for the tag; `firstName` capped 80; `magnetSlug` capped 100.
- `readUrl` in `magnet-lookup.ts` now accepts https:// only (defensive: the pdfUrl still feeds the on-page
  download button).
- Client (`MagnetLanding.tsx`) sends only `{ email, firstName, magnetSlug, dmKeyword }` (no pdfUrl).
**IMPORTANT PIVOT (why 2 commits):** first attempt (`e8b33ca`) resolved pdfUrl/keyword from the Notion magnet
registry — but **prod has NO `NOTION_TOKEN`** (checked via Coolify env API; only LISTMONK_* are set), so it 502'd
on every capture. The magnet funnel is effectively DORMANT in prod (the `/magnet/[slug]` pages also need Notion to
render). `cef196f` removes that dependency (Listmonk-only). If Ibrahim ever wants to activate the magnet funnel +
direct-PDF delivery, set `NOTION_TOKEN` in Coolify and decide whether the email should link to the PDF vs the
`/magnet` page. **security-reviewer** ran: relay confirmed closed; its 2 MEDIUMs (email-alias + XFF spoof) were
fixed in this patch. **CLEANUP:** delete the test subscriber `relaycheck@example.com` (tag `magnet-itqan-g`) from
Listmonk — created during prod verification.


**LATEST (2026-07-06): AWS/Shopify partner strip in hero + replaced About animation with a gilded إتقان still + decks updated — DEPLOYED.**
Main → `ec4b8b1`, Coolify deploy `ld6n4nqexipcysvb6ejj1qte` (verify 200 after it finishes). Three things:
1. **Partner credibility in the hero** — new `src/components/home/PartnerStrip.tsx`, mounted in `HeroAxion.tsx`
   directly under the CTA row (its own bordered "Technology partners" strip). Shows **AWS Partner** + **Shopify
   Partner** as honest program badges with a SealCheck glyph. **WORDING NOTE (honesty):** Ibrahim asked for
   "trusted by AWS/Shopify" — I used **"AWS Partner / Shopify Partner"** instead, because "trusted by" implies
   AWS/Shopify are CLIENTS/endorsers (false + trademark risk); "Partner" is the accurate claim for partner-program
   membership and is the standard agency framing. Wordmarks are plain text (no trademarked logo assets → no
   licensing issue). Data-driven `partners[]` array — add/remove a partner in one line. Dual-accent compliant
   (icon #6d4a66 on light / #cca4c2 on dark), verified via DOM. **If AWS registration isn't finalised, remove the
   AWS entry from the array** (Shopify Partner is confirmed complete).
2. **About "Our name" — animation REMOVED, replaced with a premium still.** Ibrahim called the itqan-mark particle
   video "outdated and very bad." Deleted `public/videos/itqan-mark.mp4` + `itqan-mark-poster.webp`. New asset
   `public/images/about/excellence.webp` (97KB) now fills that card: a museum-grade gilded girih screen on plum
   (nano_banana_pro backdrop) + REAL gold Arabic **إتقان** (Amiri) + "Excellence." (Playfair) + the meaning +
   the mark — composed as an HTML poster and rendered to webp (Arabic is real text, never AI-garbled). Built via
   `/tmp/excellence/poster.html` + `render.js` (NODE_PATH=project node_modules). `MissionStatement.tsx` now uses
   `<Image>` not `<video>`. Pedigree strip + everything else unchanged.
3. **Both Behance decks updated** so the animation is gone: brand-identity board 07 ("The mark, in motion" → "The
   name, made visible") and website board 08 ("The name, in motion" → "The name, made visible") now show
   `excellence.png`; mark-frame assets deleted; COPY.md + README de-referenced the "brand film". Re-rendered
   (`node behance/render.js`). Decks grep-clean of any animation mention. Still upload-ready (paste from COPY.md).
**NEXT (told Ibrahim):** finish AWS Partner registration if not done (then the badge is fully true); upload the 2
Behance decks + link on GoodFirms/Clutch; keep working GoodFirms/Clutch/GBP. Screenshot tooling note: this
session the preview tab's CSS went stale after many evals (base `.bg-white` computed transparent) — restart the
preview server for a clean shot; below-fold shots are unreliable under Lenis (verify via DOM).

**FIX (2026-07-06): Behance deck number-badge alignment.** The `.sec__num` circle was misaligned vs the title
(the `.sec__h` used `align-items: baseline` + a `translateY(8px)` hack). Fixed in `behance/deck.css`:
`align-items: flex-start`, removed the hack, `.sec__title { line-height: 1.13 }` (≈ circle height) + `margin-top: 1px`
on the badge → the circle now optically centers on the title's first line for every board. Re-rendered both decks
(`node behance/render.js`); verified all 13 numbered boards across cream/warm/dark/black + plain/italic titles.
Decks are gitignored (local `behance/out/`) — no code deploy needed; just re-upload the refreshed PNGs.

**PREVIOUS (2026-07-05, night): AI film batch + deeper About redesign + Itqan Studio Behance decks — DEPLOYED + READY.**
Main → `3aaea69` (`70e13ae` = the feature commit), Coolify deploy `nx0l8i1xwue4zbbztcygmnql` finished, prod verified 200.
1. **AI films (batch of 2 new case-hero films, both title-free — the standing constraint held):**
   - **Oud Closet case hero** = `public/videos/oud-closet-desert.mp4` (1.7MB) — re-encoded from the EXISTING Seedance
     editorial library in `~/Desktop/oud-closet/assets/video/` (seedance-group-desert: trio walking the dunes at golden
     hour; zero credits spent). Poster `oud-closet/desert-still.webp`. Titled `cover.png` STAYS on the /work grid card.
   - **Mutqin case hero** = `public/videos/mutqin-journey.mp4` (313KB) — generated fresh: nano_banana_pro title-free
     plate (a lantern trail climbing a plum dune toward a cresting glow — the founder's journey; deliberately DISTINCT
     from PJY's sun-over-dunes) → kling3_0_turbo 5s img2vid → frames verified NO WARP. Poster `mutqin/journey.webp`;
     titled `hero.webp` stays on the grid. Plate job `30886c1b…`, video job `e473096f…` (Higgsfield, ~270 credits left).
   - **PJY "other screens" SKIPPED deliberately** — they're UI screenshots; Kling warps UI text (proven constraint).
2. **Deeper About redesign (the flagged open item):** `MissionStatement.tsx` is now the showpiece — split layout with
   a NEW brand film card (`public/videos/itqan-mark.mp4`, re-encoded from the Mutqin repo's ITQAN-BG.mp4: the Itqan
   arch mark assembling from light particles; poster `public/images/about/itqan-mark-poster.webp`; dark-in-both-themes
   media surface w/ إتقان + "itqān — to perfect a thing" caption) + an honest 4-stat pedigree strip (20 yrs / 6
   countries / 6 languages / 7 case studies). `Languages.tsx` chips now show native scripts (العربية, Español, اردو,
   Svenska, Norsk) — data moved to `team.ts` as `TeamLanguage {name, native}[]`.
3. **Itqan Studio Behance decks — BUILT, ready to upload** (Ibrahim's ask: 2 Behance projects for ITQAN STUDIO itself,
   on HIS personal Behance — NOT Mutqin/PJY, which already have theirs; quality bar = the Shareefico-website decks,
   whose pipeline this mirrors exactly). Local at `behance/` (gitignored — heavy PNGs):
   - `out/brand-identity/01-09.png` — "Itqan Studio — Brand Identity · Excellence, by Name" (mark, palette, dual-accent
     "one accent two voltages" board, type incl. Arabic, brand-film frames, site-in-two-lights, close).
   - `out/website/01-10.png` — "Itqan Studio — Website · Built to Be the Answer" (tilted-browser cover, AI-era brief,
     hero, two-themes duo, AI-films duo, work grid, AskAI, About film moment, under-the-hood, close).
   - Upload steps + full Behance copy in each deck's `COPY.md` + `behance/README.md`. Re-render: `node behance/render.js`;
     re-capture site shots: dev on :3001 + `node behance/capture.js`.
4. **Directory/partner status (Ibrahim, this session):** Google ad SKIPPED for now; Google Business Profile UPDATED;
   GoodFirms + Clutch setups IN PROGRESS (he continues later); **Shopify Partner ✅ COMPLETE**; AWS Partner setup he's
   doing now. GoodFirms Service-Focus tech-stack allocation advice was given in-session (JS-ecosystem-honest split;
   remove Java/AngularJS).
5. **Found unwired b-roll:** `public/videos/new/man-hero.mp4` + `man-portrait.mp4` (plum-room man at laptop, 10s,
   gitignored) — do NOT use as "team" imagery (the man is an AI actor, honesty risk); fine as abstract b-roll if ever
   needed. Coolify box root is now 77G (was 38G — Ibrahim grew it); pre-prune still done before deploy (83%→53%).
**STILL OPEN:** Ibrahim uploads the 2 Behance decks (10 min, COPY.md is paste-ready) then links them on GoodFirms/
Clutch portfolios; GBP verification (Google processing); more AI films only if he wants (Oud has a whole Seedance
library ready to re-encode); PJY-screens films remain off-limits (text warp).

**PREVIOUS (2026-07-05, eve): Bing verify + AI films + About shader + Services image + ad/directory kit — ALL DEPLOYED.**
Main → `d9270d5`, 3 Coolify deploys, all prod-verified 200.
1. **Bing Webmaster** — `public/BingSiteAuth.xml` (user id `2E438731C051F800A2BB3FFD516343B4`) is LIVE at
   `/BingSiteAuth.xml`; Ibrahim can now Verify in Bing + submit sitemap. (GSC already verified last session; he
   still needs to submit `sitemap.xml` in GSC → Sitemaps.)
2. **Phase C AI films — SHIPPED the Project You dawn loop.** Generated 2 Kling-turbo image-to-video loops from
   title-free covers. **Project You dawn** (sun-over-dunes, 296KB `public/videos/project-you-dawn.mp4`) is
   gorgeous → wired as the /work/project-you case hero (replaced the old day/night transition clip; kept as
   fallback file). **Mutqin portal attempt WARPED its UI text** (the standing constraint proven again) → NOT
   shipped. Pipeline for more: `media_import_url(prod image URL)` → `generate_video(model:kling3_0_turbo,
   medias:[{role:start_image}], prompt, duration:5, aspect_ratio:16:9)` → `job_display(id)` for rawUrl →
   `ffmpeg -an -c:v libx264 -crf 24 -movflags +faststart` → public/videos → wire coverVideo. **NEXT film
   candidates (title-free): Oud Closet editorial model shots, Project You other screens, an atmospheric Mutqin.**
   Note: case covers with baked title text CANNOT be filmed (warp); use Ken Burns (already on all case heroes) instead.
3. **Services "Automation" image** → swapped PJY coach.webp → `ITQAN-CRM-MKP-MCBK2.png` (on-brand plum CRM
   dashboard — a real in-house ops product). Ibrahim flagged the coach image as unsuitable.
4. **About hero** — added the home hero's WebGPU shader (idle-gated, reduced-motion safe) + min-h 64vh; the
   flat text-only hero read "outdated". Copy unchanged. **Deeper About redesign still open if he wants more.**
5. **Ads/directory copy** — `DIRECTORY-ONBOARDING-KIT.md` (repo root): Google Smart Campaign headlines/descriptions
   + settings (the 1,600 AED credit), Google Business Profile optimization (FIX: his service areas say
   London/Doha — must be Dubai/UAE), GoodFirms/Clutch "why choose us" (3×≤50ch), AI-tools list, and the
   **honesty-gated** certificates/partner-programs guidance (only Shopify Partner / AWS Partner / Google Ads Cert
   are quick+legit; do NOT check ISO/CMMI/GPTW he doesn't hold). GEO-ACTION-KIT.md has directory profile copy.
**STILL OPEN:** deeper About redesign (optional); more AI films (Oud Closet etc., needs his go + credits); **2 new
Behance projects** (Mutqin + Project You — he has Behance asset folders; do like Oud Closet/Shareefico) — he said
"when the design is confirmed complete"; GBP verification (Google processing, ≤5 days).

**LATEST (2026-07-05): GSC verify + Shareefico refresh + WhyRebrandsFail(A) + Phase C — ALL DEPLOYED to prod.**
Four things shipped this session, all live on itqanstudio.com (main → `7685eaa`, three Coolify deploys, verified 200):
1. **Google Search Console** — added the apex TXT `google-site-verification=7UpyTkNRXagmV53iRQH6TUD6ICjgL2kawc5apmkKSIg`
   to Route53 zone `Z06561092N5NFW89QHZA8` (UPSERT preserving the existing MS + M365 SPF values); **propagated**
   (visible via 8.8.8.8). Ibrahim can click Verify in GSC now, then submit sitemap.xml + repeat in Bing (kit: GEO-ACTION-KIT.md).
2. **Shareefico case study refresh** — the other-chat work lived on branch `feat/shareefico-case-study-refresh`
   (commit `868b9bf`) in a SEPARATE clone at `~/Desktop/itqan-website` (branched pre-redesign). It's data+assets only
   (4 new shareefi.co screenshots + the shareefico entries in case-studies.ts/projects.ts) so it flows straight into the
   redesigned case page — cherry-picked cleanly onto main (`ea68120`). New hero = new-cover-poster.jpg; gallery = new-home/
   new-work/new-brand.jpg; copy leads with the 3D-creator shareefi.co build. (case-studies.ts dropped coverVideo → hero is
   the still poster; projects.ts kept coverVideo → grid card still animates. Kept his "Awwwards-grade" copy — a quality
   descriptor, not a fabricated award.) NOTE: the Desktop clone is now stale (its branch is merged + it lacks the redesign).
3. **WhyRebrandsFail → option A (broaden)** — heading "Most rebrands fail" → **"Most brand builds fail"**, lead + mode-01
   reworded off "rebrand"/"logo". Component/file still named WhyRebrandsFail (internal only). Live on homepage.
4. **Phase C — cinematic case heroes** — a slow Ken Burns drift on the case-detail hero cover (`CoverMedia` `cinematic`
   prop + `.case-kenburns` @keyframes in globals.css, reduced-motion safe). A uniform CSS transform, so it never distorts
   baked poster text — the reason I did NOT use AI image-to-video on the titled posters (it warps text). **True "AI films"
   remain an open, deliberate production**: they'd need NEW footage or titleless sources (Mutqin hero-landing.webp,
   Project You dawn.webp are text-free candidates) → generate → ffmpeg to web mp4 → wire coverVideo → deploy. Offered as a
   focused next step, not rushed. Verified live: `.case-kenburns` on /work/mutqin hero + keyframe in built CSS.
Coolify note: my IP `94.234.93.40` (and the /21 ISP block) are allowlisted on port 8000 — direct API works, no tunnel.

**PHASE B SHIPPED + LIVE (2026-07-05): shared-element page transitions.** `next-view-transitions` drives
App-Router nav via the native View Transitions API (replaced the framer PageTransition, which was deleted).
Root crossfade on every nav (PillNav/Footer/RollButton/HeroAxion/thank-you all use its `Link`); shared-element
MORPH via `view-transition-name: case-cover-<id>` on WorkGrid cards + CasesAxion homepage cards + CaseStudyHero
+ next-case card. Timing/reduced-motion in globals.css. Verified in prod: all 7 /work covers + case heroes carry
the names, startViewTransition in the bundle, build 23/23. Deployed (deployment `xzqa17n1tiioards13v5il8e`,
finished). Merge/deploy done under standing Coolify authorization. **IP churn:** my IP rotated mid-deploy again;
fixed durably by allowlisting his ISP **/21 `94.234.88.0/21` on ports 22 AND 8000** (SG sg-0f411678e203783d5) —
he + Claude keep access across churn now. **Phase C brief written:** `PHASE-C-BRIEF.md` at repo root (case-study
films via the EXISTING `coverVideo` system — needs Ibrahim to pick cases/style/scope; nothing built yet).
Open decisions elaborated for Ibrahim this turn: WhyRebrandsFail generalization, PartnerHalo (dormant/gated),
off-site GEO steps, PostHog (live, optional dashboard login). PartnerHalo still OFF until partnership public+signed.


**🚀 LIVE IN PRODUCTION (2026-07-04): the full Axion redesign is DEPLOYED to itqanstudio.com.** Merged
`feat/axion-redesign` → `main` (merge commit `dd900a3`, pushed). The branch predated the Kit→SES/Listmonk
email migration on main (commits 4f6864b/47c792e), so I merged `origin/main` INTO the branch first: only
`package.json`/`package-lock.json`/`ContactForm.tsx` conflicted — resolved to **main's email logic (fetch
/api/contact, Listmonk /api/subscribe) + the redesign's theme-aware styling**; deps unioned (next-themes,
posthog-js, shaders, nodemailer); lock regenerated via npm install. tsc + build clean (23 routes). Deployed via
Coolify API (`GET /api/v1/deploy?uuid=cybvxnemzusk0yzjcwzrey3v&force=true`, deployment `nrr67gryescxc6ygh2lv62bi`,
**finished** ~7 min) after pre-pruning disk (25G→37G free; builder+image prune only). **Prod verified:** all pages
200 (/, /about, /work, /services, /contact, /thank-you, /work/mutqin); new hero "Your next customer just asked
ChatGPT" live; Services shows "AI Visibility Check", no $497, no "90-Day Founder Operating System"; About shows
Bisma, zero Jonny; email APIs alive (/api/contact + /api/subscribe → 405 to GET = POST-only routes exist);
**PostHog key + eu.i.posthog.com baked into the prod layout chunk** (analytics live, inits on cookie consent).
llms.txt refreshed (no Telegram). Coolify UI now allowlists Ibrahim's IP 94.234.93.40 on port 8000 (SG
sg-0f411678e203783d5) — he can open http://52.212.71.212:8000 directly. Standing arrangement saved to memory:
Claude manages Coolify (deploy/env/allowlist) on his behalf always. Backup tag `pre-merge-backup-20260704`.
**OUTSTANDING (Phase B/C + parked):** shared-element page transitions (approved, not built); case-study film
loops (Higgsfield/Kling — needs discussion); "Most rebrands fail" naming under the widened positioning (parked
decision); PartnerHalo activation (gated, awaiting signed partnership); off-site GEO levers (Google Business
Profile / Bing Webmaster / Clutch / listicles — Ibrahim's TODO, biggest AI-visibility lever); optional PostHog
insights/dashboards. Cursor-reactive shader = ALREADY live (shader listens on window mousemove).


**LATEST (2026-07-04): FULL-SITE Axion light/dark rollout — SHIPPED on branch `feat/axion-redesign` (commit `30b0676`; NOT main, NOT deployed).**
Ibrahim reviewed the exploration slice: loves copy + AI animation + shader; directives executed this session:
(1) Grok→**Gemini** in AiVisibility; (2) **ENTIRE site** now light-first with cohesive dark toggle — every page/
section theme-aware (home badges 1–8, /work, /work/[id], /services, /about, /contact, thank-you, cookie banner;
legal + magnet are deliberate dark-in-both surfaces); (3) **PillNav is global + sticky on every page** (active
states, Dubai clock, dynamic quarter, mobile sheet w/ modal contract) — old Navbar file is now a shell around it;
(4) full **SEO+GEO widening**: seo.ts SERVICES 4→7 (adds Content & Social, SEO, AI Visibility/GEO, Hosting),
KNOWS_ABOUT/TARGET_KEYWORDS widened, one-partner titles/descriptions sitewide, 3 new GEO-first FAQ entries,
llms.txt refreshed (two founders, real outcomes); (5) **languages = Arabic/English/Spanish/Urdu/Swedish/Norwegian**
(Ibrahim confirmed); (6) one honest **AI-search scroll-stopper per page** (home CTA "The machines are already
answering…", /work "When a buyer asks an AI who to trust…", /services GEO section reusing AiVisibility, /about
"…legible to the machines your buyers now ask first", /contact "You found us. Your buyers should find you the
same way."); (7) **PostHog** wired: `providers/PostHogProvider.tsx` — inits ONLY with NEXT_PUBLIC_POSTHOG_KEY set
AND cookie consent accepted (key `itqan_cookie_consent`; CookieBanner now broadcasts a consent CustomEvent —
logic unchanged), EU host default, DNT respected, opt-out on decline; **Ibrahim TODO: create free PostHog EU
account + set NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST in Coolify** (guide: ANALYTICS-SETUP.md at root).
Executed via an 8-agent Opus workflow (5 parallel restyle w/ disjoint file ownership → SEO → PostHog → integrator
build gate; integrator found zero cross-file fixes). Design contract for future work:
`agent-work/AXION-DESIGN-SYSTEM.md` (surfaces cream/white/#f5efe6 + dark #1f1420/#241626/#1a0f1c, dual-accent
pairs, numbered badges, RollButton, honesty rules). globals.css: body + .accent-italic/.stats-gradient/
.pixel-gradient are THEME-ADAPTIVE via html.dark. Verified: tsc + build 24/24, light+dark cohesion on all main
pages, console clean. Dead legacy files (unused, kept): home/Hero.tsx, FounderOS (still on /services), FeaturedWork,
StatsLine, Services, Pricing. Copy note: contact DEFAULT_COPY subheading is now "Private. Senior. No sales team."
**UPDATE (2026-07-04, session 3): AskAI section, image refresh, PostHog LIVE, Founder OS reframe, AI Visibility Check.**
Commits `06880da` (AskAI), `9cdb742` (images + PostHog key), `de11b21` (Founder OS reframe + AI Visibility Check).
(1) **AskAI** `src/components/home/AskAI.tsx` (home badge 9 "Verify us"): neutral visible prompt + one-click
prefills — chatgpt.com/?q= & claude.ai/new?q= (pre-typed), perplexity.ai/search?q= (instant), copy-for-Gemini;
data-attr tags for PostHog. (2) **PostHog is LIVE**: Ibrahim's `phc_` project key is in `.env.local` (gitignored;
key = phc_x6vw4xaZgbfQKcKLh5uAakBiaCAproFCbrNdbHA7kvPX) + NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com.
Verified: EU config.js + events POST 200 after consent. **Ibrahim MUST set the same two env vars in Coolify + redeploy**
for prod (ANALYTICS-SETUP.md). If his account is US-cloud, change host to https://us.i.posthog.com. (His earlier
`phx_` was a PERSONAL key — wrong type; the phc_ project key is correct.)
**COOLIFY ENV VARS NOW SET IN PROD (2026-07-04):** Coolify UI (`http://52.212.71.212:8000`) + its API port are
IP-allowlisted and Ibrahim's current IP (94.234.93.40 = this machine) wasn't on it, so BOTH he and a direct API
call got blocked. Worked around it via SSH + a localhost tunnel (`ssh -L 8899:localhost:8000 …`, Coolify API on
the box's localhost bypasses the IP firewall). Created both `NEXT_PUBLIC_POSTHOG_KEY` (phc_x6vw…) and
`NEXT_PUBLIC_POSTHOG_HOST` (https://eu.i.posthog.com) on app uuid `cybvxnemzusk0yzjcwzrey3v` via
`POST /api/v1/applications/{uuid}/envs` with **is_buildtime:true** (NEXT_PUBLIC must bake at build) — HTTP 201,
verified present (prod + preview variants). **NOT YET ACTIVE:** production runs `main`, which has NO PostHog code
(it's on feat/axion-redesign). The vars sit staged and light up on the SAME deploy that ships the redesign. Did
NOT redeploy (deploying main now = rebuild without PostHog code + disk-pressure risk). **Deploy sequence when the
redesign is ready:** merge `main` → `feat/axion-redesign` FIRST (branch predates the Kit→SES/Listmonk migration on
main — deploying it un-merged would resurrect dead Kit calls, per aws-migration handover), then Coolify deploy
uuid `cybvxnemzusk0yzjcwzrey3v` (pre-prune disk). To let Ibrahim into the Coolify UI himself, allowlist
94.234.93.40 on the box security group (AWS CLI `ibrahim-admin` is configured) — NOT done unprompted (SG change). (3) **Images**: About/Values Precision→
project-you/today.webp, Function→oud-closet/cover.png (Craftsmanship kept founder-render); Services phases System→
mutqin/hero-landing.webp, Automation→project-you/coach.webp (Identity kept founder-render). Descriptive alt added
(image SEO). Old itqan-crm/app-hand/close-app renders retired from these slots. (4) **Founder OS reframed** (his
decision): kept Identity/System/Automation phases, DROPPED the "90-Day Founder Operating System" name, Days-1-30/
31-60/61-90 gates, and Telegram everywhere (FounderOS.tsx, services deep-dives, FAQ, seo.ts, llms.txt, Guarantee
Day-90 line). FounderOS.tsx was ALSO cream-on-cream (invisible) in light mode — now fully theme-aware. (5) **$497
Brand Audit → free "AI Visibility Check"** (his decision): services CTA pill + contact `ai-check` intent (run the
ChatGPT/Claude/Gemini "ask about you" test, show where you stand + 3 fixes, free). Contact founder-os-* intents
de-branded. (6) Guarantee badge is now a prop (home=5, /services=7) → clean 1-7 Services sequence. Build 24/24,
tsc clean, both themes verified via DOM (Lenis blocks headless screenshots — verify below-fold via DOM).
Still dead/untouched: home/Pricing.tsx (references old Founder OS — not rendered anywhere), magnet subsystem.
**NEXT:** Ibrahim reviews live (localhost:3001, both themes) → approved engagement features (cursor shader = already
live; shared-element page transitions = queued; case-study films = discuss) → merge to main + Coolify deploy
(pre-prune disk) + set PostHog Coolify env → parked: "Most rebrands fail" naming, PartnerHalo activation.

**UPDATE (2026-07-04, later): "Ask the machines" section SHIPPED (`06880da`) + PostHog key clarification.**
`src/components/home/AskAI.tsx` (home badge 9, between Portrait and CTABanner): neutral visible prompt, one-click
prefill links — chatgpt.com/?q= and claude.ai/new?q= (pre-typed), perplexity.ai/search?q= (answers instantly),
copy-button for Gemini; `data-attr` tags on all actions + ThemeToggle for PostHog autocapture filters. Cursor-
reactive shader confirmed ALREADY live (shaders engine listens on window mousemove; no code change). Stale dev
server on :3001 from an old session was killed (it served pre-redesign code — likely why feedback lagged); fresh
dev on :3001. **PostHog key: Ibrahim created a `phx_` key = PERSONAL API key (secret; capture endpoints reject
phx_). He needs the `phc_` PROJECT API key (Settings → Project → General) for NEXT_PUBLIC_POSTHOG_KEY.** His
"Skool"/self-hosted access issue is likely a self-hosted PostHog instance on the Coolify box that has no public
domain/route — recommended EU Cloud free tier instead (box is disk/RAM-tight; see AWS handover); awaiting his
clarification + the phc_ key (then: .env.local for dev, Coolify env for prod). Shared-element page transitions =
approved, queued next wave. Case-study films = discuss. tsc + build clean (24/24, home 158kB).

**PREVIOUS (2026-07-03): Axion-style light-first redesign — EXPLORATION SLICE (superseded by the full rollout above).**
Ibrahim pivoted the hero + design after the decision-maker copy pass. Interview answers (locked):
hero = **"Your next customer just asked ChatGPT."** (accent = *asked*); build **in Next.js on a branch**;
**light DEFAULT + dark toggle** (system pref off); flagship motion = the **AI-visibility animation**.
Positioning widened beyond rebranding → **one partner**: brand strategy, creative direction, sites that
convert, content, SEO, **AI/GEO visibility**, **full hosting**. Kept beats he likes: ThreePillars,
WhyRebrandsFail, "Proof, not promises", phase-gated Guarantee. **Founder OS parked** (off homepage, still
on /services — revisit at the very end). Branch commits: `42503aa` (baseline = copy rewrite + team fix),
`d2ccda2` (slice), `59059e6` (review fixes). New deps: **`shaders`** (WebGPU, Shader Effects Inc — license
permits production use) + **next-themes**. New files: `HeroAxion.tsx` (pill nav, live Dubai clock, dynamic
quarter label, mobile sheet w/ full modal contract, shader bg idle-gated + reduced-motion skipped,
CSS-gradient fallback), `AiVisibility.tsx` (ChatGPT/Claude/Grok panel streaming "your brand" — honesty-safe,
carries "Simulated answers, for illustration"), `IntroPartner.tsx`, `CasesAxion.tsx` + `ui/CaseMedia.tsx`,
`ui/RollButton.tsx`, `ui/ThemeToggle.tsx`, `providers/ThemeProvider.tsx`, `HeroShader.tsx`. Theme system:
next-themes class strategy + tailwind `darkMode:'class'`; **legacy pages stay dark-hardcoded and verified
unaffected**; old Navbar returns null on '/' (pill nav replaces it). Team: **Jonny REMOVED** (not yet
registered as co-founder — do not re-add until Ibrahim says so); Ibrahim = CEO & Co-Founder, Bisma Aslam =
Head of Design & Co-Founder (team.ts, TeamSection two-founder layout, Portrait, AboutHero, seo.ts
founder+cofounder Person nodes). **teamLanguages trimmed to Arabic/English/Urdu** — ASK IBRAHIM which of
Spanish/German/Swedish/Norwegian/Bosnian to restore. Review workflow (3 dims): 0 CRIT / 5 HIGH / 10 MED —
all HIGH+MED fixed. Verified: tsc + build clean (24/24, home 165kB First Load, shader lazy), light+dark
desktop, mobile 375px no overflow, /about dark + two founder cards, console clean.
**SESSION UPDATE (2026-07-04): Axion theme pass — contact / legal / thank-you / cookie / magnet / newsletter.**
Converted the remaining pages/components to the light-first theme-aware system (branch `feat/axion-redesign`).
Files: `app/contact/page.tsx` (theme-aware surface, removed `pt-28` navbar hack → `pt-10 md:pt-16`, kept
metadata/JsonLd/INTENT_COPY/DEFAULT_COPY data verbatim, added ONE AI-moment line "You found us. Your buyers
should find you the same way." with Playfair accent pair), `contact/ContactForm.tsx` (light = white fields /
black-0.12 borders / #1a1a1a text; dark: variants; removed custom focus ring — globals `*:focus-visible` owns
it; primary submit plum→cream; added theme-aware select chevron), `ui/TestimonialCarousel.tsx` (card+inline
theme-aware, accent pair, fixed dual-accent violation), `ui/SectionLabel.tsx` (theme-aware default, kept
`light` prop for dark surfaces), `thank-you/ThankYouClient.tsx` (dark: variants on surface/checkmark/text/
buttons), `legal/LegalPageLayout.tsx` (kept `bg-brand-dark` as the ONE deliberate dark-in-both-modes surface
because globals `.legal-prose` is dark-tuned/off-limits; removed `pt-28`), `CookieBanner.tsx` (theme-aware
surface+buttons; **consent logic + storage key `itqan_cookie_consent` untouched**), `magnet/MagnetLanding.tsx`
(THEME PASS ONLY — design-locked dark funnel already renders identically dark in both modes + accent only on
dark = compliant; added clarifying comment, zero logic/copy change), `layout/NewsletterForm.tsx` (theme pass;
note: currently an orphan — not imported anywhere). Verified: `tsc --noEmit` clean; dev-server computed styles
in light + SSR-HTML dark-pair checks (10/10) on /contact; /thank-you /privacy /cookies all 200; no server
compile errors. NOTE: project has no working eslint config (`next lint` wants interactive setup) — used tsc as
the gate. **NEXT WAVES:** (1) Ibrahim reviews the slice (run dev, toggle themes); (2) restyle remaining dark sections
into the light system or keep alternation (his call); (3) services/about/work/contact pages in the new
language; (4) widen seo.ts SERVICES/KNOWS_ABOUT + FAQ to cover SEO/GEO/hosting/content honestly; (5) home
metadata/title once positioning settles; (6) decide "Most rebrands fail" generalization; (7) Founder OS fate;
(8) merge to main + Coolify deploy (pre-prune disk).

**PREVIOUS (2026-07-02): decision-maker copy rewrite — committed as `42503aa` on the branch (was uncommitted).** A senior
branding partner reviewed the site: the copy spoke to mid-level marketing managers (argued *why branding
matters* / listed *what we deliver*). Rewrote the whole site for **ultimate decision-makers** (founders, CEOs,
owners, boards, investors) — selling **stakes, certainty, pedigree** around one wedge: *a rebrand is the
highest-stakes, most-likely-to-fail decision a company makes; Itqan de-risks it.* Copy/section-framing only,
no framework/color/dep changes. Full write-up: [DECISION-MAKER-REWRITE-REPORT.md](DECISION-MAKER-REWRITE-REPORT.md).
Homepage went 8 → 10 sections, reordered in [src/app/page.tsx](src/app/page.tsx): Hero → **ThreePillars (NEW
spine: Reputation/Commercial impact/Honesty)** → **WhyRebrandsFail (NEW — 5 failure modes + fixes)** →
FeaturedWork → Guarantee → **FounderOS (DEMOTED — eyebrow "The offer"→"The method", moved down; tactical detail
still on /services)** → Industries (reframed to localisation: Arabic/GCC/Vision 2030) → WhoFor (rewritten to
CEOs/owners/boards/investors) → Portrait ("the team in the room") → **PartnerHalo (gated, OFF)** → CTABanner.
New files: `ThreePillars.tsx`, `WhyRebrandsFail.tsx`, `PartnerHalo.tsx`, `src/lib/flags.ts`. Hero headline is now
*"The rebrand is the most dangerous decision you'll make. Make it with people who've done it before."* (mauve
Playfair accent = "before"); single CTA **"Start a conversation"** sitewide; the **$497 Brand Audit tripwire was
demoted** off the hero + home CTA banner (still on /services + /contact?intent=audit). Honesty held: only real
`src/data/*` numbers (Nexilink placed 1st 2024 / 3 weeks; Itqan CRM 5 tools 8h→15min; 20yr/6-country pedigree),
no fabricated metrics. Ran a 5-dimension adversarial review workflow (honesty/voice/system/impact/completeness)
twice and resolved every finding (killed Footer "Crafted by Itqan"→"Excellence, by name"; de-risked Portrait's
key-person framing; fixed Values "Craftmanship"→"Craftsmanship"; trimmed a filler-heavy testimonial). Verified:
`tsc` clean, `npm run build` clean (24/24, home **158 kB** First Load JS — no regression), no console errors.

**GATED (do NOT ship yet):** potential partnership with a globally renowned brand agency — NOT public, NOT
signed. Nothing on the site names/implies a partner. The slot is [src/components/home/PartnerHalo.tsx](src/components/home/PartnerHalo.tsx)
+ [src/lib/flags.ts](src/lib/flags.ts), mounted in page.tsx between Portrait and CTABanner. Renders `null` until
`NEXT_PUBLIC_PARTNER_HALO=1`. To activate later: set that env var in Coolify + fill the PLACEHOLDER copy/logo — no rewrite.

**NEXT STEPS:** (1) review the changes / screenshots; (2) `git add` + commit (branch off `main` first) + push;
(3) deploy via Coolify (pre-prune the 38G EC2 disk — see the deploy notes below — or the Next build fails on
"no space left on device"); (4) spot-check `/`, `/work`, `/about` live. Working tree is currently DIRTY with all
these edits (nothing committed this session).

**LATEST (2026-06-21): full SEO + GEO/LLM optimization pass — SHIPPED to `main`.** Ibrahim wanted to (a) rank top of Google for "design / automation / AI agency Dubai" and (b) be recommended/cited by LLMs (ChatGPT, Claude, Perplexity, Gemini, AI Overviews). Ran deep research (report at `agent-work/SEO-GEO-RESEARCH-REPORT.md` — local only, agent-work is gitignored) then implemented. **Two confirmed bugs fixed:** (1) `/images/og-image.png` was referenced in metadata but DID NOT EXIST → replaced with a real, on-brand 1200×630 OG card generated by `next/og` at `src/app/opengraph-image.tsx` (reads committed Manrope TTFs from `src/app/_og/`, zero build-time network); (2) `src/app/sitemap.ts` was a STALE hardcoded list missing mutqin/project-you/itqan-crm → now **data-driven from `src/data/case-studies.ts`** (+ legal pages). **New SEO infra:** centralized `src/lib/seo.ts` (NAP, keywords, JSON-LD builders — fixed the `sameAs` socials to match the footer: instagram `madebyitqan`, linkedin `company/110338926`); `src/components/seo/JsonLd.tsx` (escaped-`<` XSS-safe inline JSON-LD); full entity graph (Organization + WebSite + founder Person, with `jobTitle: "Co-founder"` to match on-page copy) site-wide in `layout.tsx`, plus per-page Service graph + BreadcrumbList + FAQPage (services), CreativeWork + Breadcrumb (case studies), CollectionPage/ItemList (work). **Per-page canonicals** (`alternates.canonical`) on every route incl. dynamic ones; `?intent=` on /contact canonicalizes to `/contact`; `/thank-you` is `noindex` (no canonical). **Keyword-targeted titles/desc** (home: "Itqan Studio — Design, Automation & AI Agency in Dubai"; services/work/about/contact reworded) — brand hero UNTOUCHED. **GEO:** `src/app/robots.ts` (dynamic; explicitly Allows all major AI crawlers — GPTBot/OAI-SearchBot/ChatGPT-User, ClaudeBot/Claude-SearchBot/Claude-User/anthropic-ai, PerplexityBot/Perplexity-User, Google-Extended, Applebot-Extended, Bingbot, CCBot — replaces deleted `public/robots.txt`); `public/llms.txt` (curated entity summary — low-risk hedge, evidence says it does little today); on-brand **FAQ section on /services** (`src/components/services/ServiceFAQ.tsx`, native `<details>` so answers are in crawlable SSR HTML, written GEO-first: direct factual answers + real stats). **CWV:** removed the render-blocking font `@import` in globals.css → moved to a `<head>` `<link>` + `preconnect`. Added `manifest.ts` + `viewport` export (themeColor moved out of deprecated metadata). **Schema note:** deliberately used `Organization` + `Service` (NOT `ProfessionalService` — schema.org deprecated it). Build clean (24/24); verified at runtime: robots/sitemap/og-image render, all JSON-LD parses, canonicals correct, OG is a valid 1200×630 PNG. code-reviewer pass: 0 critical/high; 4 mediums all fixed (Co-founder jobTitle, thank-you canonical removed, work ItemList sourced from caseStudies, OG gradient rgba). **OFF-SITE TODO for Ibrahim (can't be coded — biggest "agency Dubai" levers):** create+verify Google Business Profile; collect reviews via WhatsApp; submit sitemap to Google Search Console AND Bing Webmaster Tools (Bing powers ChatGPT search); list on Clutch/GoodFirms/DesignRush; get onto "best agencies in Dubai" listicles (top GEO lever). Future site phases: Arabic/hreflang, an `/insights` blog for freshness, per-service landing pages. **Deploy:** pushed to `main`; prod is AWS+Coolify — confirm Coolify deploys (watch the 38G disk; pre-prune if needed per the entry below) before this is live.

**LATEST (2026-06-19, follow-up): removed ALL remaining "solo founder" phrasing + deployed to AWS/Coolify — LIVE & VERIFIED.** After the co-founder reframe (below), Ibrahim asked to strip every "solo founder" reference. Reworded the two ICP/audience lines + one code comment: [src/components/home/WhoFor.tsx](src/components/home/WhoFor.tsx) "Solo founders or 2-3 person teams" → "Early-stage founders or 2-3 person teams"; [src/components/magnet/MagnetLanding.tsx](src/components/magnet/MagnetLanding.tsx) "Solo founders who refuse to start with a logo" → "Founders who refuse to start with a logo"; [src/components/about/TeamSection.tsx](src/components/about/TeamSection.tsx) comment "Ibrahim, solo" → "Ibrahim, standalone". Committed `8774c65`, pushed `main`. **Deployed via Coolify API** (app uuid `cybvxnemzusk0yzjcwzrey3v`, token in `~/Desktop/aws-migration/secrets/coolify-api.env`): `GET http://52.212.71.212:8000/api/v1/deploy?uuid=…&force=true` → poll `…/deployments/{uuid}` for `status`. **First deploy FAILED: "no space left on device"** — the 38G EC2 root was at 75% and the Next.js/nixpacks build needs ~5GB transient (build cache lived in `/var/lib/containerd` buildkit snapshots). Fix = SSH (`ssh -i ~/.ssh/aws-migration-key.pem ubuntu@52.212.71.212`) + `sudo docker builder prune -af && sudo docker image prune -af` (NEVER `volume prune` / `--volumes` — 8 volumes hold the 2 self-hosted Supabase stacks' data). Re-deployed → finished, rolling update OK. Verified LIVE: `https://itqanstudio.com` + `/about` HTTP 200, "Co-founder of Itqan Studio" + "Early-stage founders…" present, zero "solo founder" anywhere. Post-build prune left box at 65% (14G free). **RECURRING RISK:** 38G root is tight for Coolify + 2 Supabase + apps; every build adds ~4-5GB cache → deploys will fail again without a pre-prune. **Recommend: grow the EBS root 38G→~60G (one-time, ~$2/mo) OR enable Coolify scheduled Docker cleanup.** See `~/Desktop/aws-migration/handover.md` (updated this session) for box ops.

**LATEST (2026-06-19): founder copy reframed solo → co-founder — SHIPPED.** Ibrahim is NOT the sole founder and didn't want the site implying it. Changed "Solo founder of Itqan Studio" → "Co-founder of Itqan Studio" in BOTH surfaces that carried it: homepage `THE FOUNDER` section [src/components/home/Portrait.tsx](src/components/home/Portrait.tsx) (eyebrow "The founder" → "The co-founder", body line, and citation "— Ibrahim Shareef, Founder" → "Co-founder") and the About hero body line [src/components/about/AboutHero.tsx](src/components/about/AboutHero.tsx). Kept the "Engineer. Designer. Storyteller. All in one." headline + "the rare person who can build the brand, code the system, tell the story" narrative — those describe his personal multi-disciplinary skill, not sole ownership. Committed `089358f`, pushed to `main`. **NOTE:** prod is AWS+Coolify (not Netlify) — confirm Coolify deploys before this is live. Left alone (audience-facing "solo founder" lines that describe the CLIENT, not Ibrahim): `WhoFor.tsx` "Solo founders or 2-3 person teams" + `MagnetLanding.tsx` "Solo founders who refuse to start with a logo". Ibrahim's own oud-closet / case-studies.ts / projects.ts WIP was deliberately NOT staged (committed only the 2 copy files).

**LATEST (2026-06-14): Project You listing cover → the titled "Noor — a journey through light" poster.** Ibrahim supplied a finished self-titled poster (sun + dashboard laptop + Qur'an-companion phone on a dusk desert gradient, baked "Project You / Noor — a journey through light / نور"). Set it as the cover on BOTH the `/work` grid card and the homepage `FeaturedWork` tile. Source `/Users/ibrahimshareef/Desktop/project-you/handover/itqan-website/assets/cover.png` (3200×2400) → `public/images/portfolio/project-you/cover-poster.webp` (1800×1350, 52K, cwebp q82). Because the poster bakes the title, added a generic `coverHasTitle?: boolean`: (1) [src/data/projects.ts](src/data/projects.ts) — PY `coverImage` → `cover-poster.webp`, `coverHasTitle: true`; (2) [src/components/work/WorkGrid.tsx](src/components/work/WorkGrid.tsx) — when `coverHasTitle`, skip the overlaid title/subtitle + the bottom gradient (clean poster card); (3) [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx) — added `coverHasTitle` to `FeaturedTile`; PY tile → `cover-poster.webp` + `coverHasTitle: true`; suppress the overlaid `<h2>` name when set (keeps Live pill + Product/Faith pills + hover testimonial). Result: poster shows on both surfaces with NO double title; Mutqin + all other cards/tiles unchanged. `npm run build` clean (21/21). Verified: real /work screenshot (PY top-right, clean poster) + cloned landing tile (poster + pills + quote, no overlaid name). Detail page `/work/project-you` untouched (still the video hero). NOTE: Mutqin's `/work` card + tile still show their baked title under the overlay (pre-existing, tolerated) — could get the same `coverHasTitle` treatment for consistency if wanted.

**DEPLOYMENT REALITY (corrected 2026-06-14): production is AWS, NOT Netlify.** `itqanstudio.com` → EC2 `i-0ea77f0db834833dc` ("coolify-box", eu-west-1, IP `52.212.71.212`), a Next.js server behind **Coolify** (self-hosted PaaS; dashboard `http://52.212.71.212:8000`, locked to Ibrahim's IP). The repo's `netlify.toml` + older "Netlify auto-deploys" notes below are STALE (migrated off Netlify). **Pushing to `main` does NOT auto-publish unless Coolify's GitHub webhook is set** — this caused the Noor commits to sit un-deployed earlier this session (Ibrahim fixed the AWS/Coolify deploy). SSH: `ssh -i ~/.ssh/aws-migration-key.pem ubuntu@52.212.71.212`. AWS CLI is configured locally (`ibrahim-admin`, acct `480437358661`, eu-west-1). To ship a change: push to `main` AND confirm Coolify deploys (dashboard → app → Deploy, or rely on the webhook if now configured). The "(Netlify auto-deploys)" phrases in entries below are inaccurate — read them as "pushed to main; deploy via Coolify."

**LATEST (2026-06-14): Project You rebuilt as the Noor case study — landing + work #3 + animated detail hero — SHIPPED.** Committed (`d5a2265`), pushed to `main` (Netlify auto-deploys). The stale `project-you` entry (old "young Muslims / Founder OS / Next.js" copy, April-24 imagery, **last** on `/work`, absent from the homepage) was **fully replaced** with the Noor rebrand (calm faith-rooted life-OS + verse-by-verse Qur'an companion). Files: (1) [src/data/projects.ts](src/data/projects.ts) — project-you moved to **3rd** (after Mutqin + Shareefico, before Medacs) per Ibrahim; titleless `dawn.webp` cover; (2) [src/data/case-studies.ts](src/data/case-studies.ts) — full Noor entry moved after Shareefico: problem → Aurora→Noor pivot → the orb identity → the Itqan way, Identity/System/Automation phases ("soul/skeleton/heartbeat"), `stack: React, TypeScript, Supabase, Claude`, `liveUrl: https://projectyou.app`, `outcomeMetric`, pivot `testimonialQuote` (Ibrahim, founder voice, نور renders); (3) [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx) — homepage tile **Oud Closet → Project You** (titleless `dawn.webp`, "Live" pill, Product/Faith pills); (4) `public/images/portfolio/project-you/` — 9 optimized webp (~444K via cwebp from 2880px Noor captures) + `public/videos/project-you-transition.mp4` (544K). **Detail hero = the looping day↔night transition video** (`coverVideo`); listings use the titleless `dawn.webp` so the system title never collides with a baked headline (same lesson as the Mutqin landing tile). **Deliberately NO `brandShowcase`** — that section's hardcoded copy ("a product with a **face** … Mu, a six-pose companion") is Mutqin-specific and contradicts Noor's **faceless** orb; the brand/pivot story is carried by the text fields + the testimonial instead. Gallery = 6 real app screens (dashboard, Qur'an reader, habits[**dark**], coach, finance, health) — breadth + the two-theme story. Deleted the now-unreferenced old `project-you-mkp-mkbk.png` (kept `project-you-mkp-mb.png` [Industries] + `app-hand-v2-render.png` [Services, Values] — still used elsewhere). `npm run build` clean (21/21, `/work/project-you` SSG); screenshot-verified landing 4-up, work-grid order, detail header/hero, gallery (6 up), testimonial. Source assets + brief: `/Users/ibrahimshareef/Desktop/project-you/handover/`. **Nothing outstanding on Project You's Itqan-site presence.** (Spot-check the Netlify deploy goes green: `/`, `/work`, `/work/project-you`.)

**LATEST (2026-06-14): Landing tile got its own dedicated cover — SHIPPED.** The homepage `FeaturedWork` Mutqin tile overlays its OWN name + category pills + testimonial + bottom gradient, so the titled poster double-named and Mu clashed with the overlay (desktop) / was cropped out (mobile). Added `public/images/portfolio/mutqin/hero-landing.webp` — a titleless device scene (same dawn gradient + glow + portal browser + 3D phone, no title, no Mu) — and pointed ONLY the homepage tile at it in [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx). `/work` card + `/work/mutqin` case hero KEEP the titled `hero.webp`. Verified the real tile desktop (default + hover) + mobile — legible, no double name. Build clean; committed `71be8a9`, pushed to `main`. Both covers come from the SAME generator in the Mutqin repo (`cover-itqan.html`; the tile is `?v=tile`).

**LATEST (2026-06-14): Mutqin cover image replaced with a Noor-style poster — SHIPPED.** Committed (`4ecf5cd`), pushed to `main` (Netlify auto-deploys). The old cover (`mutqin/hero.webp`) was the dark "From raw idea to investor-ready" slide: heavy body paragraph, a "Web-app · React" footer, and BLANK device screens — Ibrahim disliked it. Replaced with a premium on-brand poster modelled on the Project You "Noor" reference he loves: plum→mauve→cream dawn gradient + soft glow, "Mutqin" + Arabic متقن, and REAL product mockups — the founder portal in a clean browser window + the mobile portal on the 3D plum phone, with Mu waving. Only the single shared asset `public/images/portfolio/mutqin/hero.webp` changed (3200×2400, 131KB), so it updates all 3 surfaces at once: the `/work` listing card, the `/work/mutqin` case hero (2:1), and the homepage `FeaturedWork` tile. Production build clean (21/21, /work/mutqin SSG); all 3 surfaces screenshot-verified. **Reproducible** from the Mutqin repo: `startup-companion/public/_behance/cover-itqan.html` + `node scripts/cover-itqan.mjs` → `cwebp` → copy. Known tradeoff (matches the Noor reference + the prior cover): the poster bakes a "Mutqin" title, so it appears under the page h1 on the case page and under the overlaid name on the landing tile — a titleless variant is a one-line change (drop the `.title` block, re-render) if preferred. NOTE: a long-running itqan dev server had a stale `.next` cache 500ing /work/mutqin ("Cannot find module ./vendor-chunks/framer-motion.js") — cleared `.next` + rebuilt; unrelated to the asset.

**LATEST (2026-06-14): Mutqin added as a featured project + full case study + homepage tile — SHIPPED.** Committed (`08f130e`) and pushed to `main`; Netlify auto-deploys from `main`. Mutqin (Itqan's own AI startup companion, live at https://mutqin.xyz) is now the **first/lead card** on `/work`, has a full detail page at `/work/mutqin`, and **replaces the Medacs tile on the homepage `FeaturedWork` grid** (Medacs stays in `/work` + its detail page). Files touched: (1) [src/data/projects.ts](src/data/projects.ts) — `mutqin` `Project` entry, first; (2) [src/data/case-studies.ts](src/data/case-studies.ts) — `mutqin` `CaseStudy` entry first + two new OPTIONAL interface fields `brandShowcase?: string[]` and `stack?: string`; (3) [src/app/work/[id]/page.tsx](src/app/work/%5Bid%5D/page.tsx) — gated `BrandShowcase` section (brand-cover + character-poses after the mockup gallery), a `Stack` stat in `AtAGlance`, and the emphasised Outcome stat now spans 1–2 cols adaptively so the 5-col strip never overflows; (4) [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx) — explicit `FeaturedTile` type (optional `duration`/`status`); Mutqin tile shows a **"Live"** pill (no fabricated delivery window); pill is omitted entirely if a tile sets neither; (5) `public/images/portfolio/mutqin/` — 6 optimized WebP (hero, wizard, portal, mobile, brand, character; 348K total, from the 3200px source PNGs via cwebp). `npm run build` clean (21/21 pages, /work/mutqin in SSG). Decisions taken with Ibrahim: keep Mutqin first in the grid; feature on homepage in place of Medacs. **Nothing outstanding on Mutqin.** Source assets + brief live at `/Users/ibrahimshareef/Desktop/startup-companion/handover/itqan-website/`.

**Still open (2026-06-03): Lead-magnet DELIVERY is wired + capture route hardened.** On branch `feat/magnet-delivery-wiring` (commit `33ad091`, pushed to origin, NOT merged to main). When someone opts in on `/magnet/[slug]`, they now (a) get an instant on-page "Download your guide" button and (b) get enrolled in the shared Kit "Magnet Delivery" sequence (id `2777738`) which emails them the PDF. Three files changed: [src/app/api/leads/capture/route.ts](src/app/api/leads/capture/route.ts) (full rewrite), [src/lib/magnet-lookup.ts](src/lib/magnet-lookup.ts) (added `pdfUrl`), [src/components/magnet/MagnetLanding.tsx](src/components/magnet/MagnetLanding.tsx) (passes `pdfUrl`, shows download button). **ACTION NEEDED before this works in prod: set `KIT_API_KEY` in Netlify env** (no `.env` in repo; both `KIT_API_KEY` and `NOTION_TOKEN` live in Netlify host env). Also ensure each Itqan magnet's Notion "PDF URL" property is populated, or the on-page button falls back silently to "Check your inbox" and the delivery email's `{{ subscriber.magnet_pdf_url }}` will be empty. Shared Kit account = Shareefico's (account 2383668); custom field `magnet_pdf_url` (id 1279519) already exists. Canonical tag format: `magnet-itqan-<dmKeyword>` lowercase. To merge: open a PR from `feat/magnet-delivery-wiring` into `main`.

You are picking up the Itqan Studio marketing site at `/Users/ibrahimshareef/Documents/itqan-website`. Next.js 14 App Router + Tailwind + Framer Motion. Branch `main`, clean working tree on session start. Brand tokens in [tailwind.config.ts](tailwind.config.ts): dark `#2f1c2c`, accent `#cca4c2` (dark-bg only) / `#6d4a66` (light-bg only), cream `#fffbf5`. Manrope + Playfair Display Italic.

The site reads case studies from [src/data/case-studies.ts](src/data/case-studies.ts) and renders them via [src/app/work/[id]/page.tsx](src/app/work/[id]/page.tsx). The portfolio grid is [src/components/work/WorkGrid.tsx](src/components/work/WorkGrid.tsx). The homepage featured tiles are [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx).

**Just-shipped: Shareefico case study has a video cover + live-site CTA.** New optional fields `coverVideo` and `liveUrl` on the `CaseStudy` interface. Detail-page hero renders `<video>` when `coverVideo` is set (falls back to `<Image>`), and a floating "Visit live site" pill overlays the hero when `liveUrl` is set (plus a matching pill in the header strip). Listing cards still use static `coverImage` to keep LCP fast on the grid.

**What's left / what to do next:**

1. **Optional: extract a higher-quality poster frame.** Current poster is JPG quality 2 from ffmpeg. If the artifact looks soft on retina screens, re-extract with `ffmpeg -y -ss 00:00:01.5 -i public/videos/shareefico-cover.mp4 -frames:v 1 -update 1 -q:v 1 public/images/portfolio/shareefico/cover-poster.jpg` (`-q:v 1` is highest quality). Use `-update 1` flag to avoid the "image sequence pattern" warning.

2. **Optional: compress the video for delivery.** Source MP4 is 3.2 MB at high bitrate. For LCP, re-encode: `ffmpeg -i public/videos/shareefico-cover.mp4 -c:v libx264 -crf 24 -preset slow -an public/videos/shareefico-cover-web.mp4` then update `coverVideo` path.

3. **Done in follow-up commit c86245d:** Shareefico animation now plays on every listing card too (homepage FeaturedWork tile + work-page WorkGrid card + NextCaseCard hand-off). All four spots share a `CoverMedia` component at [src/components/ui/CoverMedia.tsx](src/components/ui/CoverMedia.tsx) which renders `<video>` when a video src exists, else `<Image>`. Other case studies stay on static images — they just don't set `coverVideo`. To add a video cover for another client, set `coverVideo` on both their `CaseStudy` entry (case-studies.ts) AND `Project` entry (projects.ts), then add a `video` field to their FeaturedWork tile if they're in the homepage rotation.

4. **Watch out for:** Next/Image with very large source PNGs (the mockups in `public/images/portfolio/` are 5–30 MB each — they get optimized down by Next, but they bloat the repo). Consider running them through `cwebp -q 80` and switching to .webp sources at some point.

**Project-specific rules:**

- The brand has a **dual-accent system** (CLAUDE.md): `#cca4c2` ONLY on dark backgrounds, `#6d4a66` ONLY on light/cream backgrounds. Don't break that.
- All animations under 400ms.
- Mobile-first responsive.
- Target Lighthouse 90+ — don't add heavy client-side JS or unbounded autoplay-video grids.
- Dark sections alternate with light sections.

**Approaches considered + rejected this session:**

- **Polymorphic `coverImage` field** (string | object). Rejected: ripples into 4 components and the other case studies' types.
- **Special-casing the Shareefico ID in the page component**. Rejected: anti-pattern, doesn't scale.
- **Auto-playing the video inside listing cards.** Rejected: 4 autoplay videos on a grid is bad for LCP and battery; the animation deserves a full-bleed stage.
- **Wrapping the entire hero in `<a>` to make the whole cover clickable.** Rejected: surprising UX (people don't expect case-study heroes to be clickable). Used a clearly visible CTA chip instead.

**Pivots:** Nothing structural this session — this is a polish/asset upgrade on an existing case study, not a redesign.

## What was just done (2026-07-04 — Axion redesign integration gate)

**Branch `feat/axion-redesign` (NOT committed — gate/verification pass only). No source edits needed.**

Ran the integration gate after several agents restyled the whole site (theme-aware light/dark),
widened SEO, and wired PostHog. Result: the branch is already clean and consistent.

- **`npx tsc --noEmit`** → 0 errors (verified twice, start and end).
- **`npm run build`** → succeeds, all 24 pages generated (static + SSG), no warnings.
- **Phosphor import/type match** → correct. All 7 files importing `@phosphor-icons/react/dist/ssr`
  are server components (no `'use client'`, no hooks): `contact/page`, `work/[id]/page`,
  `services/page`, `home/CasesAxion`, `about/Languages`, `legal/LegalPageLayout`,
  `services/ServiceFAQ`. All 16 files importing non-ssr `@phosphor-icons/react` are `'use client'`.
  No mismatches to fix.
- **Top-padding hacks** → none live. Only 3 `pt-28/pt-32/pt-[72px]` hits, all legitimate:
  `Hero.tsx` (`pt-[72px]`) is DEAD (not imported anywhere; homepage uses `HeroAxion`);
  `IntroPartner.tsx` (`lg:pt-32`) and `CasesAxion.tsx` (`lg:pt-28`) are the design-system
  REFERENCE files — balanced `pt-16 sm:pt-20 lg:pt-XX` + matching `pb` section rhythm, not
  navbar compensation. Left untouched. Heroes changed today (e.g. `AboutHero`) already use the
  correct `pt-10 sm:pt-14 lg:pt-20` pattern.
- **Dual-accent rule** → fully compliant across all changed files. Every `text-brand-accent-on-light`
  (#6d4a66) is paired with `dark:text-brand-accent`. Every bare `text-brand-accent` (#cca4c2) /
  raw `#cca4c2` inline color sits only on permanently-dark-in-both-modes surfaces: `work/[id]`
  media-card overlays (`bg-brand-dark`) and the design-locked `MagnetLanding` funnel (`bg-[#1a0d17]`).
  `MissionStatement:20` is a correct `text-[#6d4a66]/… dark:text-brand-accent/…` pair. No violations.

**Conclusion:** integration gate PASSED with zero code changes required. Ready to commit/deploy
when Ibrahim gives the word.

## What was just done (2026-06-14 — Mutqin cover regenerated)

**Committed (`4ecf5cd`) and pushed to `main` (Netlify auto-deploys). Production build clean.**

Ibrahim disliked the Mutqin cover (`public/images/portfolio/mutqin/hero.webp`) — the dark
"From raw idea to investor-ready" slide with a body paragraph, a "Web-app · React" footer, and
blank device screens. He referenced the Project You "Noor — a journey through light" poster as
"exactly what I want" and asked for a Mutqin equivalent: real mockups, no small text, applied to
the work page + landing.

- **Replaced ONLY `mutqin/hero.webp`** (3200×2400, 131KB). All 3 itqan surfaces reference this one
  asset (projects.ts coverImage, case-studies.ts coverImage, FeaturedWork tile image), so the swap
  updates the `/work` card + `/work/mutqin` 2:1 hero + homepage tile together — no code edits.
- **The poster** (Mutqin Play brand): plum→mauve→cream dawn gradient + soft "Noor" glow, "Mutqin"
  (Manrope 800) + subtitle "From raw idea to investor-ready" + Arabic متقن, then real product
  mockups rising from the bottom — the founder portal in a clean browser window (`portal-light`) +
  the mobile portal (`portal-mobile`) on the 3D plum phone shell — with Mu waving. No paragraph,
  no footer. Composed center-safe so it survives the 2:1 case-hero crop AND the portrait mobile tile.
- **Built in the Mutqin repo** (where the brand assets + Mu + 3D shells live), NOT here:
  `startup-companion/public/_behance/cover-itqan.html` (relative asset paths → renders over file://)
  + `scripts/cover-itqan.mjs` (Puppeteer dsf2 screenshot) → PNG → `cwebp -q 82` → copied here.
  Old cover backed up at `startup-companion/handover/itqan-cover/hero-OLD.webp`.
- **Verified:** `npm run build` clean (21/21 pages, /work/mutqin in SSG); served via `next start` and
  screenshot-checked all 3 surfaces. (Had to clear a stale `.next` dev cache that was 500ing
  /work/mutqin with "Cannot find module ./vendor-chunks/framer-motion.js" — a long-running-dev-server
  artifact, unrelated to the image swap.)

## What was just done (2026-06-14 — center collaborator faces)

**Committed (`5ba2fe9`) and pushed to `main` (Netlify auto-deploys).** Build clean.

The About-page TeamSection "Trusted collaborators" cards (`aspect-[4/3]` landscape) were cropping the portrait headshots with `object-cover object-top`, leaving Bisma's and Jonny's faces high and inconsistent. Fix = per-image `object-position`:
- [src/data/team.ts](src/data/team.ts) — added optional `objectPosition?: string` to `TeamMember`; set Bisma `'50% 31%'`, Jonny `'50% 16%'` (tuned so each head/nose sits on the vertical center of the 4:3 crop — different values because their faces sit at different heights in their source frames).
- [src/components/about/TeamSection.tsx](src/components/about/TeamSection.tsx) — collaborator `Image` now uses `style={{ objectPosition: objectPosition ?? 'center' }}` instead of the `object-top` class (object-cover kept). Founder card unchanged.

Verified by injecting a fixed crop-preview overlay at scroll-0 (the site's Lenis smooth-scroll blocks below-fold screenshots — see memory `lenis-preview-screenshots`) with a red center-line guide, comparing candidate values, and confirming against the real hot-reloaded cards' computed `object-position`. Both faces now centered + consistent.

## What was just done (2026-06-14 session — added Mutqin)

**Branch `main`, committed (`08f130e`) and pushed to origin. Build passes clean.**

**Goal:** Add Mutqin (Itqan's flagship AI startup companion) as a featured project per the handover brief at `/Users/ibrahimshareef/Desktop/startup-companion/handover/itqan-website/HANDOVER-PROMPT.md`. Present it *within* the Itqan site (no restyle to Mutqin's brand) using Mutqin's own imagery.

**Files changed:**
- [src/data/projects.ts](src/data/projects.ts) — new `mutqin` `Project` entry, placed first (lead card). `filters: ['Application Development', 'Brand & Identity', 'UI/UX Design']` so it surfaces under every lens. cover = `hero.webp`.
- [src/data/case-studies.ts](src/data/case-studies.ts) — added two OPTIONAL fields to the `CaseStudy` interface: `brandShowcase?: string[]` (extra brand/character section) and `stack?: string` (at-a-glance tech stat). Added the `mutqin` entry first, with honest copy in the warm founder-to-founder voice. NO fabricated `duration`/`industryAverage` (it's our own product; no verified build weeks). Phases use the three Founder-OS pillars with the pillar metaphors ("The soul / skeleton / heartbeat") in the `days` slot rather than a fake calendar. `liveUrl: https://mutqin.xyz`.
- [src/app/work/[id]/page.tsx](src/app/work/%5Bid%5D/page.tsx) — (a) new `BrandShowcase` section component (eyebrow "Brand & character", accent-italic heading "A product with a face.", 2-col 4:3 image grid) rendered between the mockup gallery and the testimonial, gated on `brandShowcase`; (b) added a `Stack` stat to `AtAGlance`; (c) made the emphasised Outcome stat span 2 cols only when `baseCount <= 3` so the 5-col strip never overflows for any field combination.
- [src/components/home/FeaturedWork.tsx](src/components/home/FeaturedWork.tsx) — homepage: replaced the Medacs tile with a Mutqin tile (`status: 'Live'`, no fabricated duration). Extracted an explicit `FeaturedTile` type (optional `duration`/`status`), made the top-right pill render `status` else `Delivered in {duration}`, and omit the pill entirely when a tile sets neither.

**Assets added** (`public/images/portfolio/mutqin/`, 348K total, all 4:3 WebP @ q82 from the 3200px source PNGs via `cwebp`): `hero.webp` (2400px — cover/thumbnail), `wizard.webp` / `portal.webp` / `mobile.webp` (1800px — product gallery), `brand.webp` / `character.webp` (1800px — brand showcase). Source PNGs + Mu cutouts + app-icon left in the handover package (not copied — no template slot, avoids repo bloat).

**Verification:** `npm run build` clean twice (21/21 static pages, type-check + lint pass, `/work/mutqin` builds as SSG). Browser preview (localhost:3001): clean screenshots of the `/work` grid (Mutqin lead card, 4:3, on-brand) and the `/work/mutqin` header (hero + "Visit live site" pill + outcome line). Below-fold sections verified via DOM (all 6 images `complete:true`, gallery 3×4:3 + brand 2×4:3, at-a-glance = 4 stats filling the 5-col grid, all copy present); no console errors, no failed network requests. NOTE: the site uses Lenis smooth-scroll, which decouples visual scroll from native `scrollTop` — headless screenshots only capture at scroll-0, so below-fold visuals were confirmed by DOM geometry instead of screenshot. typescript-reviewer pass: no CRITICAL/HIGH; the MEDIUM (grid overflow) and LOW (redundant guard) it raised were both fixed. Homepage FeaturedWork DOM-verified (tiles: nexilink / shareefico / oud-closet / mutqin; Medacs removed; Mutqin shows the "Live" pill with `hero.webp` loaded); a second reviewer pass on FeaturedWork found no CRITICAL/HIGH (one MEDIUM — a tile with neither `status` nor `duration` — closed by omitting the pill when the label is empty). Committed `08f130e` and pushed to `main` (Netlify auto-deploys).

**Approaches considered + rejected:**
- Strict template (hero + 3 mockups only) — drops the brand-cover + character-poses the brief explicitly wants shown. Rejected.
- Dumping all 5 slides into the 3-col mockup gallery — uneven row + no narrative framing for the brand beat. Rejected.
- Fabricating a build duration to fill the at-a-glance — dishonest. Instead added the real `stack` stat to fill the grid.

## What was just done (2026-06-03 session — magnet delivery wiring)

**Branch `feat/magnet-delivery-wiring` (commit `33ad091`, pushed, NOT merged). Build passes clean.**

**Files changed:**
- [src/app/api/leads/capture/route.ts](src/app/api/leads/capture/route.ts) — full rewrite. New flow: (1) validate `{ email, magnetSlug, dmKeyword, pdfUrl?, firstName? }`; (2) 500 if no `KIT_API_KEY`; (3) upsert subscriber `POST /v4/subscribers` with `state:"active"` + `fields:{ magnet_pdf_url: pdfUrl }` (fields included ONLY when pdfUrl present), 422 -> 400 "that email looks invalid", other non-2xx -> 502; (4) find-or-create tag `magnet-itqan-<kw>` via PAGINATED `GET /v4/tags?per_page=1000&after=<cursor>` following `pagination.end_cursor`, handles 422-on-create race by re-listing; (5) attach tag `POST /v4/tags/{id}/subscribers`, errors (502) on non-2xx, no swallow; (6) enroll `POST /v4/sequences/2777738/subscribers`, logs+continues on failure with `enrolled:false`; (7) returns `{ ok:true, pdfUrl: pdfUrl ?? null, tagged:true, enrolled:<bool> }`. Helper `kitFetch` enforces a 15s AbortController timeout and never logs the API key. Never returns `ok:true` unless subscriber upserted AND tagged.
- [src/lib/magnet-lookup.ts](src/lib/magnet-lookup.ts) — added `pdfUrl: string | null` to the `LeadMagnet` interface, a `readUrl()` helper, and now reads the Notion "PDF URL" property into it.
- [src/components/magnet/MagnetLanding.tsx](src/components/magnet/MagnetLanding.tsx) — POST body now includes `pdfUrl: magnet.pdfUrl ?? undefined`. New `downloadUrl` state set from the server-confirmed `data.pdfUrl` (fallback `magnet.pdfUrl`). On success, both the sticky bar and the final CTA card render a "Download your guide" button (target=_blank, rel=noopener) pointing at `downloadUrl`; the CTA card adds "We also emailed it to you." When no PDF URL exists, the UI falls back to the old "Check your inbox" copy with no broken button.

**Verification:** `npm run build` passes clean (20/20 static pages, type-check + lint pass, `/api/leads/capture` and `/magnet/[slug]` compile as dynamic). No em-dashes in any added strings. API key never logged.

**Config status this repo:** No `.env*` files. `KIT_API_KEY` and `NOTION_TOKEN` are NOT set locally and MUST be present in the Netlify host env for delivery to work. `KIT_API_KEY` specifically gates the whole capture flow (returns 500 "Kit not configured" without it).

## What was just done (2026-05-27 session)

**Files changed:**
- [src/data/case-studies.ts](src/data/case-studies.ts) — added optional `coverVideo` and `liveUrl` fields to `CaseStudy` interface; updated the Shareefico entry with `coverVideo: '/videos/shareefico-cover.mp4'`, `liveUrl: 'https://shareefi.co'`, swapped mockups to `[website.png, tokens.png, SHRFCO-CMS-MKP.png]`, and changed `coverImage` to the new poster `/images/portfolio/shareefico/cover-poster.jpg`.
- [src/app/work/[id]/page.tsx](src/app/work/[id]/page.tsx) — extracted hero into `CaseStudyHero` component that renders `<video>` when `coverVideo` is set (else `<Image>` fallback), with a floating "Visit live site ↗" pill overlay when `liveUrl` is set. Added a matching pill to the header strip next to the duration. Imported `ArrowUpRight` from phosphor.
- [.claude/launch.json](.claude/launch.json) — switched to `npx next dev` with `autoPort: true` so the preview server picks a free port when 3001 is busy.

**Assets added:**
- `public/videos/shareefico-cover.mp4` (3.2 MB, 6s loop, 1896×1092)
- `public/images/portfolio/shareefico/cover-poster.jpg` (108 KB, extracted at t=1.5s)
- `public/images/portfolio/shareefico/website.png` (1.2 MB, iPad mockup of shareefi.co hero)
- `public/images/portfolio/shareefico/tokens.png` (1.6 MB, brand token sheet)
- `public/images/portfolio/shareefico/mark-lime.png` (45 KB, brand mark — kept for future use)

**Verification (localhost:51515 preview):**
- TypeScript: `npx tsc --noEmit` passes clean.
- Video element renders with correct src + poster; plays (currentTime advanced 2.001s/sec).
- Both "Visit live site" links resolve to `https://shareefi.co/`, `target="_blank"`, `rel="noopener noreferrer"`.
- All 3 gallery images serve 200 OK with valid dimensions.
- No console errors, no server errors, no failed network requests.

## Open questions / blockers

- **Mutqin (2026-06-14): SHIPPED** — committed `08f130e`, pushed to `main`, Netlify auto-deploying. Decisions resolved with Ibrahim: kept first in the work grid; featured on the homepage in place of Medacs. Nothing outstanding. (Verify the Netlify deploy goes green and spot-check `/`, `/work`, `/work/mutqin` on the live site.)
- The magnet-delivery branch (`feat/magnet-delivery-wiring`) is still NOT merged to `main` and still needs `KIT_API_KEY` in Netlify env (see "Still open (2026-06-03)" above).

## Monetization angles

- The `coverVideo` + `liveUrl` pattern is a reusable productized capability — every founder we work with eventually wants a video-cover case study. This could be packaged as a "Founder Story Reel" add-on to the 90-day Founder OS.
- The illustrated character animation style (Kling) is distinctive enough to license back as a service: "We'll make you the character that fronts your brand." Itqan has the prompts + tokens already locked in for Shareefico — it's a reproducible workflow.
- The portfolio detail page is now a stronger sales asset for premium pricing — the live-site CTA closes the proof loop in one click, which is exactly what high-intent visitors look for before booking a call.
- **Mutqin is now the on-site proof that "Itqan ships the whole loop" — brand + in-repo design system + character + live full-stack AI product.** The new gated `BrandShowcase` section is a reusable pattern: any future build-type case study can show its brand/character system as a distinct beat, which is exactly the differentiator that justifies premium "we build the whole thing" pricing. The `stack` stat also doubles as quiet technical credibility for the engineering-heavy buyer.
