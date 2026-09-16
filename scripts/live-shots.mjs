/**
 * Verify and capture the LIVE sites after a deploy.
 *
 * Reads document.title and the head metadata from the rendered DOM rather than
 * from raw HTML, because Next 15 streams metadata and a curl of the first chunk
 * misses it. Also screenshots each page so the deploy can be eyeballed.
 *
 * Usage: node scripts/live-shots.mjs
 * Output: /tmp/live/<name>-<i>.png
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = '/tmp/live';

const targets = [
  { name: 'itqan-home', url: 'https://itqanstudio.com/', scheme: 'light', offsets: [0, 950, 2900] },
  { name: 'itqan-services', url: 'https://itqanstudio.com/services', scheme: 'light', offsets: [0, 900] },
  { name: 'itqan-work', url: 'https://itqanstudio.com/work', scheme: 'light', offsets: [0] },
  { name: 'shareefico-session', url: 'https://shareefi.co/session', scheme: 'dark', offsets: [0, 900] },
];

const VIEWPORT = { width: 1440, height: 900 };

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const t of targets) {
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      colorScheme: t.scheme,
    });
    const page = await ctx.newPage();
    const status = (await page.goto(t.url, { waitUntil: 'networkidle', timeout: 90_000 }))?.status();
    await page.waitForTimeout(2500);

    const meta = await page.evaluate(() => {
      const get = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) ?? null;
      return {
        title: document.title,
        description: get('meta[name="description"]'),
        ogTitle: get('meta[property="og:title"]'),
        canonical: get('link[rel="canonical"]', 'href'),
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 90) ?? null,
      };
    });

    console.log(`\n${t.name}  [HTTP ${status}]  ${t.url}`);
    console.log(`  title      : ${meta.title}`);
    console.log(`  h1         : ${meta.h1}`);
    console.log(`  description: ${(meta.description ?? '').slice(0, 100)}`);
    console.log(`  canonical  : ${meta.canonical}`);

    for (const [i, off] of t.offsets.entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), off);
      await page.waitForTimeout(1500);
      const file = `${OUT}/${t.name}-${i}.png`;
      await page.screenshot({ path: file });
      console.log(`  shot       : ${file} (y=${off})`);
    }
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
