#!/usr/bin/env node
/**
 * Local check of the whole booking flow against scripts/mock-crm.mjs.
 * Drives the installed Google Chrome (playwright-core, channel "chrome"; no
 * browser download) and saves a screenshot per step.
 *
 *   ITQAN_BOOKING_SECRET=<test secret> node scripts/mock-crm.mjs
 *   CRM_API_ORIGIN=http://localhost:3999 ITQAN_BOOKING_SECRET=<test secret> npx next dev -p 3101
 *   node scripts/smoke-booking.mjs <screenshot folder>
 *
 * Env: SITE (http://localhost:3101), MOCK (http://localhost:3999). Development only.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SITE = process.env.SITE || 'http://localhost:3101';
const MOCK = process.env.MOCK || 'http://localhost:3999';
const out = process.argv[2];
if (!out) {
  console.error('Usage: node scripts/smoke-booking.mjs <screenshot folder>');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
}

async function mock(pathname, body) {
  const res = await fetch(`${MOCK}${pathname}`, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {});
  return res.json();
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
}

async function bookFirstFreeTime(page, email) {
  await page.locator('.bk-time').first().click();
  await page.locator('#bk-name').fill('Sample Guest');
  await page.locator('#bk-email').fill(email);
  await page.locator('#bk-company').fill('Sample Foods LLC');
  await page.locator('#bk-role').fill('Operations lead');
  await page.locator('#bk-industry').selectOption('fnb');
  await page.locator('#bk-message').fill('Supplier invoices take two people a full day each week.');
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Dubai', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  // 1. English booking page: the call length comes from the CRM.
  await page.goto(`${SITE}/book`, { waitUntil: 'networkidle' });
  const heading = await page.locator('#bk-title').innerText();
  check('EN heading shows the CRM call length', /30.minute briefing/.test(heading), heading.replace(/\s+/g, ' '));
  check('EN lead names both founders', (await page.locator('.bk-intro .lead').innerText()).includes('Ibrahim or Bisma'));
  check('free times rendered without a loading state', (await page.locator('.bk-time').count()) > 0);
  await shot(page, '01-book-en');

  // 2. Details, then book.
  await bookFirstFreeTime(page, 'guest.one@example.com');
  await shot(page, '02-details-en');
  await page.locator('.bk-submit').click();
  await page.locator('.bk-done h2').waitFor({ timeout: 15_000 });
  const doneText = await page.locator('.bk-done').innerText();
  check('booking confirmed and names the host', /Booked\./.test(doneText) && /with Ibrahim Shareef/.test(doneText), doneText.split('\n')[1] ?? '');
  await shot(page, '03-booked-en');

  // 3. Cancel through the token link from the confirmation email.
  const state = await mock('/__mock/state');
  check('the mock CRM holds the booking', state.bookings.some((b) => b.status === 'confirmed'));
  await page.goto(`${SITE}/book/cancel/${state.lastCancelToken}`, { waitUntil: 'networkidle' });
  await shot(page, '04-cancel-ask-en');
  await page.locator('.btns .btn.pri').click();
  await page.locator('.bk-done').waitFor({ timeout: 15_000 });
  const cancelText = await page.locator('.bk-done').innerText();
  check('cancel page confirms with the booked time', /Cancelled\./.test(cancelText) && /is cancelled/.test(cancelText), cancelText.split('\n')[1] ?? '');
  await shot(page, '05-cancelled-en');
  const after = await mock('/__mock/state');
  check('the mock CRM shows it cancelled', after.bookings.every((b) => b.status === 'cancelled'));

  // 4. Arabic with ?with=bisma: one host, her Arabic name.
  await page.goto(`${SITE}/ar/book?with=bisma`, { waitUntil: 'networkidle' });
  const withLine = await page.locator('.bk-with').innerText().catch(() => '');
  check('AR page with ?with=bisma names her', withLine.includes('بسمة أسلم'), withLine);
  await shot(page, '06-book-ar-bisma');
  await bookFirstFreeTime(page, 'guest.two@example.com');
  await page.locator('.bk-submit').click();
  await page.locator('.bk-done h2').waitFor({ timeout: 15_000 });
  check('AR booking with Bisma confirmed', (await page.locator('.bk-done').innerText()).includes('بسمة أسلم'));
  await shot(page, '07-booked-ar-bisma');

  // 5. A host cancels in the CRM: the site emails the guest through /api/crm/notify.
  const bisma = (await mock('/__mock/state')).bookings.find((b) => b.host === 'bisma' && b.status === 'confirmed');
  const hostCancel = await mock('/__mock/host-cancel', { id: bisma.id, notifyGuest: true });
  check('host cancel reaches /api/crm/notify and emails the guest', hostCancel.data?.websiteStatus === 200 && hostCancel.data?.website?.data?.emailed === true, JSON.stringify(hostCancel.data));

  // The paused step below makes the browser log the 503 itself, so console errors are checked here.
  check('no console errors in the booking and cancel pages', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  // 6. CRM down: the paused message, English and Arabic.
  await mock('/__mock/down', { down: true });
  await new Promise((r) => setTimeout(r, 21_000)); // let the 20 s first-paint cache expire
  await page.goto(`${SITE}/book`, { waitUntil: 'networkidle' });
  await page.locator('.bk-empty[role="alert"]').waitFor({ timeout: 15_000 });
  const pausedEn = await page.locator('.bk-empty[role="alert"]').innerText();
  check('EN paused message', pausedEn.includes('Booking is paused for a moment. Email hello@itqanstudio.com and we will find a time.'));
  check('EN heading drops the number when the CRM is down', /for your briefing\./.test(await page.locator('#bk-title').innerText()));
  await shot(page, '08-paused-en');
  await page.goto(`${SITE}/ar/book`, { waitUntil: 'networkidle' });
  await page.locator('.bk-empty[role="alert"]').waitFor({ timeout: 15_000 });
  check('AR paused message', (await page.locator('.bk-empty[role="alert"]').innerText()).includes('الحجز متوقف مؤقتاً'));
  await shot(page, '09-paused-ar');
  await mock('/__mock/down', { down: false });

  // 7. Phone width (failed answers are never cached, so the times are back at once).
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SITE}/book`, { waitUntil: 'networkidle' });
  await shot(page, '10-book-en-390');

  // 8. The old admin redirects to the CRM.
  const admin = await fetch(`${SITE}/admin/login`, { redirect: 'manual' });
  check('/admin/* redirects permanently to the CRM availability page', admin.status === 308 && admin.headers.get('location') === 'https://portal.itqanstudio.com/calendar/availability', `${admin.status} ${admin.headers.get('location')}`);

  await browser.close();

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots in ${out}`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
