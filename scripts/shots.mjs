/**
 * Screenshot helper. Captures viewport-sized frames at fixed scroll offsets so
 * each frame stays readable, rather than one enormous full-page PNG.
 *
 * Exists because the in-app Browser pane cannot composite frames while it is
 * hidden, so screenshots taken through it time out. A real headless browser
 * runs requestAnimationFrame normally, which also means the scroll-reveal
 * animations actually finish instead of sitting at opacity 0.
 *
 * Usage: node scripts/shots.mjs
 * Output: /tmp/shots/<name>-<index>.png
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = '/tmp/shots';

const targets = [
  {
    name: 'itqan-home',
    url: 'http://localhost:3001/',
    scheme: 'light',
    offsets: [0, 950, 1900, 2900, 3900, 5000, 6200, 7400],
  },
  {
    name: 'shareefico-session',
    url: 'http://localhost:3000/session',
    scheme: 'dark',
    offsets: [0, 900, 1800, 2700, 3600, 4500, 5400],
  },
];

const VIEWPORT = { width: 1440, height: 900 };

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const t of targets) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      colorScheme: t.scheme,
    });
    const page = await context.newPage();

    page.on('pageerror', (e) => console.log(`  [pageerror] ${t.name}: ${e.message}`));

    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60_000 });
    // Dev-server first paint plus font swap.
    await page.waitForTimeout(2500);

    const height = await page.evaluate(() => document.body.scrollHeight);
    console.log(`${t.name}: ${height}px tall`);

    for (const [i, off] of t.offsets.entries()) {
      if (off > height - 200) {
        console.log(`  skip offset ${off} (past the end)`);
        continue;
      }
      await page.evaluate((y) => window.scrollTo(0, y), off);
      // Lenis eases the scroll on a rAF loop, and the reveal animations run on
      // intersection, so give both time to land before the shutter.
      await page.waitForTimeout(1600);
      const file = `${OUT}/${t.name}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: file });
      console.log(`  wrote ${file}  (y=${off})`);
    }

    await context.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
