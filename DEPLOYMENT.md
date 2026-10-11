# Deployment & Hosting — READ BEFORE ANY DEPLOY

> **itqanstudio.com moved OFF Netlify (2026-06) — it was the first/pilot migration.**
> It now runs on Ibrahim's self-hosted AWS box. Do NOT redeploy to Netlify/Vercel.
> This is the **marketing site** (Next.js). Since the CRM v3 link (Oct 2026) the briefing bookings
> live in the CRM's database; the site keeps only the old SQLite file until its one-time export.

## Where it runs
- **Host:** AWS EC2 `52.212.71.212` (eu-west-1), managed by **Coolify** (`http://52.212.71.212:8000`).
- **App:** Coolify app **`itqanstudio`** (uuid `cybvxnemzusk0yzjcwzrey3v`), build pack **nixpacks**, Next.js on :3001. Serves **https://itqanstudio.com** + **https://www.itqanstudio.com**.
- **Database:** none of its own any more. `/book` reads free times from and writes bookings to the CRM
  at `portal.itqanstudio.com` (separate app/repo `itqan-crm`, self-hosted Supabase) over signed
  server-to-server calls. The old booking SQLite file `/app/.data/itqan.db` stays on the Coolify volume
  `itqanstudio-booking-data` until `scripts/export-bookings-to-crm.mjs` has moved it (see handover.md);
  keep the volume mounted until then.

## Environment (names only; values live in Coolify, never in git: this repo is public)
- `ITQAN_BOOKING_SECRET`: the shared secret for the CRM booking API, at least 32 characters, the same
  value on the CRM app. Missing or shorter: the site refuses every CRM call and `/book` shows "Booking
  is paused".
- `CRM_API_ORIGIN`: where the site reaches the CRM. Optional; default `https://portal.itqanstudio.com`.
  It must be https, or plain http only on `localhost`, `::1` or `127.x.x.x` (a private address or a
  Docker service name such as `http://itqan-crm:3000` needs https). A value the site refuses pauses
  every booking and cancel; the server says so once at start, in the Coolify log, as a line beginning
  `[startup] CRM_API_ORIGIN is set but refused`. Check the log after any deploy that changes it.
- Mail for confirmations: `SES_SMTP_HOST`, `SES_SMTP_PORT`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`,
  `CONTACT_FROM_EMAIL`. Host notices go to the host's address from the CRM.
- `BOOKING_DB_PATH`: only for the one-time export, when the SQLite file is somewhere other than
  `/app/.data/itqan.db`.

## How to deploy — just push
- **`git push origin main`** → GitHub webhook auto-rebuilds in Coolify (~3-5 min). No manual step.
- Manual trigger: `curl -H "Authorization: Bearer $COOLIFY_TOKEN" "http://52.212.71.212:8000/api/v1/deploy?uuid=cybvxnemzusk0yzjcwzrey3v&force=false"` (token: `~/Desktop/aws-migration/secrets/coolify-api.env`).
- **Env vars live in Coolify** (app → Environment Variables), not in a `.env` on the box.

## Backups / DR
- Bookings are in the CRM's Postgres, which has its own daily `pg_dump` to S3 (see the CRM's
  `DEPLOYMENT.md`). The legacy SQLite file is covered only by the daily AMIs until it is exported.
  The whole box (incl. this app + its config) is captured by **daily AMIs** (DLM policy `policy-09cd80b526ed584a1`, retain 7); a full-box restore takes minutes. See `~/Desktop/aws-migration/DR-RUNBOOK.md`.

## Monitoring
- Route 53 health check + CloudWatch alarm `uptime-itqanstudio-com` → SNS email on downtime.

## Box access (IP rotates → prefer SSM)
`aws ssm start-session --target i-0ea77f0db834833dc` (no SSH/IP whitelisting needed).

## Central record
Full migration history + all infra: `~/Desktop/aws-migration/handover.md` (same machine).
