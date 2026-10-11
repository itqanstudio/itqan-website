#!/usr/bin/env node
/**
 * One-time move of the old booking data into the CRM (CRM v3, Oct 2026).
 *
 * Reads the website's SQLite file (bookings, the saved weekly hours and rules,
 * blocked dates) and posts it, signed, to the CRM's
 * POST /api/integrations/website/import. The CRM import is idempotent on the
 * booking id, so running it twice is safe. Prints counts only, never names or
 * addresses.
 *
 * Run inside the website container (the file sits on the Coolify volume):
 *
 *   node scripts/export-bookings-to-crm.mjs --dry-run   # counts, sends nothing
 *   node scripts/export-bookings-to-crm.mjs             # sends
 *
 * Env: BOOKING_DB_PATH (default /app/.data/itqan.db), ITQAN_BOOKING_SECRET
 * (32+ characters, the same value the CRM has), CRM_API_ORIGIN (default
 * https://portal.itqanstudio.com).
 */
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { buildBatches, exportOrigin, readLegacyData, summarize } from './lib/crm-export.mjs';
import { MIN_SECRET_LENGTH, SIGNATURE_HEADER, signatureHeader } from './lib/crm-signature.mjs';

const DEFAULT_DB = '/app/.data/itqan.db';
const DEFAULT_ORIGIN = 'https://portal.itqanstudio.com';
const IMPORT_PATH = '/api/integrations/website/import';
const TIMEOUT_MS = 30_000;

function fail(message) {
  console.error(`export: ${message}`);
  process.exit(1);
}

function crmOrigin() {
  const origin = exportOrigin(process.env.CRM_API_ORIGIN || DEFAULT_ORIGIN);
  return origin ?? fail('CRM_API_ORIGIN must be an https origin (plain http only for localhost, 127.x.x.x or ::1).');
}

async function post(origin, secret, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}${IMPORT_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', [SIGNATURE_HEADER]: signatureHeader(secret, 'POST', IMPORT_PATH, body) },
      body,
      signal: controller.signal,
      redirect: 'error',
    });
    let parsed = null;
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
    if (!res.ok || !parsed || parsed.ok !== true || !parsed.data) {
      const code = parsed && typeof parsed.error === 'string' ? parsed.error : 'no JSON answer';
      fail(`the CRM refused a batch (HTTP ${res.status}, ${code}). Nothing after it was sent; fix the cause and run again.`);
    }
    return { imported: Number(parsed.data.imported) || 0, skipped: Number(parsed.data.skipped) || 0 };
  } catch (err) {
    return fail(`no answer from the CRM (${err instanceof Error ? (err.name === 'AbortError' ? 'timeout' : err.message) : 'unknown'}).`);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const dbPath = process.env.BOOKING_DB_PATH || DEFAULT_DB;
  if (!existsSync(dbPath)) fail(`no booking database at ${dbPath}. Set BOOKING_DB_PATH.`);

  const db = new DatabaseSync(dbPath, { readOnly: true });
  let data;
  try {
    data = readLegacyData(db);
  } finally {
    db.close();
  }

  const counts = summarize(data);
  const { batches, oversized } = buildBatches(data);
  console.log(`export: ${dbPath}`);
  console.log(
    `export: ${counts.bookings} bookings (${counts.upcomingConfirmed} upcoming, ${counts.pastConfirmed} past, ${counts.cancelled} cancelled), ` +
      `${counts.blockedDates} blocked dates, saved hours: ${counts.availability}, ${batches.length} request(s)`,
  );
  data.warnings.forEach((w) => console.log(`export: note: ${w}`));
  if (oversized > 0) console.log(`export: note: ${oversized} item(s) are too big for one request and will not be sent.`);

  if (dryRun) {
    console.log('export: dry run, nothing sent.');
    return;
  }
  // A partial move would look complete, so nothing is sent until every item fits.
  if (oversized > 0) fail(`${oversized} item(s) are too big for one request. Nothing was sent; shorten or remove them and run again.`);
  if (batches.length === 0) {
    console.log('export: nothing to send.');
    return;
  }

  const secret = process.env.ITQAN_BOOKING_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) fail(`ITQAN_BOOKING_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters.`);
  const origin = crmOrigin();

  let imported = 0;
  let skipped = 0;
  for (const [i, body] of batches.entries()) {
    const result = await post(origin, secret, body);
    imported += result.imported;
    skipped += result.skipped;
    console.log(`export: request ${i + 1}/${batches.length} done (imported ${result.imported}, skipped ${result.skipped}).`);
  }
  console.log(`export: finished. Imported ${imported}, skipped ${skipped} (already in the CRM).`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
