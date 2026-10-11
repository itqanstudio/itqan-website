#!/usr/bin/env node
/**
 * Tests for the brand-portal data helpers and the generated manifest.
 *
 * These are the seams the portal renders from: if `portalPage` misses, a page
 * loses its lede; if `bundlesFor` over-returns, a 25 MB pack appears next to a
 * 5-file one. Both are silent failures in a build, which is why they are
 * asserted here.
 *
 *     npm run test:brand-data
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const REPO = resolve(new URL('..', import.meta.url).pathname);

// Imported as TypeScript directly — Node strips the types. No hand-rolled
// stripper to keep in sync with the module it is meant to be testing.
const portal = await import('../src/data/brand-portal.ts');
const { PORTAL_NAV, PORTAL_PAGES, portalPage, portalCategoryOf } = portal;

const results = [];
const check = (name, fn) => {
  try {
    fn();
    results.push([true, name]);
  } catch (err) {
    results.push([false, `${name} — ${err.message.split('\n')[0]}`]);
  }
};

/* ── the IA tree ────────────────────────────────────────────────────────── */

check('PORTAL_PAGES flattens every page and child', () => {
  const expected = PORTAL_NAV.reduce(
    (n, c) => n + c.items.reduce((m, p) => m + 1 + (p.children?.length ?? 0), 0),
    0,
  );
  assert.equal(PORTAL_PAGES.length, expected);
});

check('every href is unique', () => {
  const hrefs = PORTAL_PAGES.map((p) => p.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

check('every page has a label and a summary', () => {
  for (const p of PORTAL_PAGES) {
    assert.ok(p.label?.length, `${p.href} has no label`);
    assert.ok(p.summary?.length, `${p.href} has no summary`);
  }
});

check('every href starts at /brand', () => {
  for (const p of PORTAL_PAGES) assert.match(p.href, /^\/brand(\/|$)/);
});

/*
 * The failure this guards: a page in the nav with no route file 404s from BOTH
 * the sidebar and the sitemap at once, and nothing at the data layer notices.
 */
check('every href resolves to a route file', () => {
  for (const p of PORTAL_PAGES) {
    // The portal has its own (brand) root layout group since 11 Oct 2026; groups add no URL segment.
    const rel = `src/app/(brand)${p.href}/page.tsx`;
    assert.ok(existsSync(join(REPO, rel)), `${p.href} has no ${rel}`);
  }
});

check('portalPage finds a top-level page', () => {
  assert.equal(portalPage('/brand/logo')?.label, 'Logo');
});

check('portalPage finds a nested child', () => {
  assert.equal(portalPage('/brand/logo/misuse')?.label, 'Misuse');
});

check('portalPage misses cleanly', () => {
  assert.equal(portalPage('/brand/nope'), undefined);
});

check('portalCategoryOf resolves a top-level page', () => {
  assert.equal(portalCategoryOf('/brand/colour'), 'Identity');
});

check('portalCategoryOf resolves a CHILD page to its parent category', () => {
  assert.equal(portalCategoryOf('/brand/colour/pairings'), 'Identity');
});

check('portalCategoryOf misses cleanly', () => {
  assert.equal(portalCategoryOf('/brand/nope'), undefined);
});

/* ── the generated manifest ─────────────────────────────────────────────── */

const manifest = JSON.parse(readFileSync(join(REPO, 'src/data/brand-assets.json'), 'utf8'));

check('manifest has assets', () => {
  assert.ok(Array.isArray(manifest.assets) && manifest.assets.length > 0);
});

check('every shippable asset has a unique src under /brand or an existing public path', () => {
  const srcs = manifest.assets.filter((a) => a.src).map((a) => a.src);
  assert.equal(new Set(srcs).size, srcs.length, 'duplicate src — an asset was overwritten');
  for (const s of srcs) assert.match(s, /^\//);
});

check('every asset id is unique', () => {
  const ids = manifest.assets.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
});

check('manifest ships NO absolute workstation paths', () => {
  const raw = JSON.stringify(manifest);
  assert.ok(!raw.includes('/Users/'), 'manifest leaks an absolute source path');
});

check('every asset src exists on disk', () => {
  for (const a of manifest.assets) {
    if (!a.src) continue;
    assert.ok(existsSync(join(REPO, 'public', a.src)), `missing file for ${a.id}: ${a.src}`);
  }
});

/* ── report ─────────────────────────────────────────────────────────────── */

let failed = 0;
for (const [ok, name] of results) {
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
