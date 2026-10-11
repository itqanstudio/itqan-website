#!/usr/bin/env node
/**
 * A tiny stand-in for the CRM's website integration API, for local testing of
 * the booking flow without the real CRM. Development only: in-memory data,
 * fake hosts with example.com addresses, listens on 127.0.0.1.
 *
 *   ITQAN_BOOKING_SECRET=<32+ chars> node scripts/mock-crm.mjs
 *   # then run the site with CRM_API_ORIGIN=http://localhost:3999 and the same secret
 *
 * Env: PORT (3999), ITQAN_BOOKING_SECRET (required), WEBSITE_ORIGIN
 * (http://localhost:3101, for the host-cancel callback).
 *
 * Signed routes (same contract as the CRM, REBUILD-SPEC section 8):
 *   GET  /api/integrations/website/slots[?with=<slug>]
 *   POST /api/integrations/website/bookings
 *   POST /api/integrations/website/bookings/cancel
 *   POST /api/integrations/website/bookings/notice-sent
 *   POST /api/integrations/website/import
 * Test controls (unsigned, local only):
 *   GET  /__mock/state                 bookings and the last cancel token
 *   POST /__mock/down {"down": true}   answer 503 to every signed route
 *   POST /__mock/host-cancel {"id", "notifyGuest"}   cancel as the host and call the site's /api/crm/notify
 */
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { MIN_SECRET_LENGTH, SIGNATURE_HEADER, signatureHeader, verifySignature } from './lib/crm-signature.mjs';

const PORT = Number(process.env.PORT || 3999);
const SECRET = process.env.ITQAN_BOOKING_SECRET || '';
const WEBSITE_ORIGIN = process.env.WEBSITE_ORIGIN || 'http://localhost:3101';
const MAX_BODY = 16_384;
const SLOT_MINUTES = 30;
const DAY = 86_400_000;

if (SECRET.length < MIN_SECRET_LENGTH) {
  console.error(`mock-crm: set ITQAN_BOOKING_SECRET (at least ${MIN_SECRET_LENGTH} characters).`);
  process.exit(1);
}

/** Two fake hosts. utcStartHour is the first slot of their weekday window, in UTC. */
const HOSTS = [
  { slug: 'ibrahim', name: 'Ibrahim Shareef', email: 'ibrahim@example.com', meetingUrl: null, priority: 10, utcStartHour: 6 },
  { slug: 'bisma', name: 'Bisma Aslam', email: 'bisma@example.com', meetingUrl: 'https://meet.example.com/itqan-bisma', priority: 20, utcStartHour: 8 },
];

/** @type {Array<Record<string, string>>} */
const bookings = [];
const imported = new Set();
let down = false;
let lastCancelToken = null;

const sha = (s) => createHash('sha256').update(s).digest('hex');

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function hostSlots(host, now) {
  const out = [];
  const today = new Date(now);
  for (let d = 1; d <= 14; d += 1) {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + d));
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (let m = 0; m < 120; m += SLOT_MINUTES) {
      const start = day.getTime() + host.utcStartHour * 3_600_000 + m * 60_000;
      const taken = bookings.some((b) => b.status === 'confirmed' && b.hostSlug === host.slug && Date.parse(b.start) === start);
      if (!taken && start > now + DAY) out.push(new Date(start).toISOString());
    }
  }
  return out;
}

function slotsFor(withSlug, now) {
  const hosts = withSlug ? HOSTS.filter((h) => h.slug === withSlug) : HOSTS;
  const byStart = new Map();
  hosts.forEach((h) => hostSlots(h, now).forEach((s) => byStart.set(s, [...(byStart.get(s) || []), h.slug])));
  return {
    slotMinutes: SLOT_MINUTES,
    timezone: 'Asia/Dubai',
    hosts: hosts.map((h) => ({ slug: h.slug, name: h.name })),
    slots: Array.from(byStart.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([start, slugs]) => ({ start, hosts: slugs })),
  };
}

function forEmail(b) {
  const host = HOSTS.find((h) => h.slug === b.hostSlug);
  return {
    id: b.id,
    start: b.start,
    end: b.end,
    guestName: b.name,
    guestEmail: b.email,
    company: b.company,
    role: b.role,
    industry: b.industry,
    message: b.message,
    topic: b.topic,
    locale: b.locale,
    guestTimezone: b.timezone,
    host: { slug: host.slug, name: host.name, email: host.email, meetingUrl: host.meetingUrl },
    // Like the CRM: every founder hears about every booking, the host marked.
    team: HOSTS.map((h) => ({ name: h.name, email: h.email, isHost: h.slug === host.slug })),
  };
}

function createBooking(body, now) {
  const required = ['start', 'name', 'email', 'company', 'industry', 'locale', 'timezone', 'ipHash'];
  if (!body || typeof body !== 'object' || required.some((k) => typeof body[k] !== 'string')) return [400, { ok: false, error: 'invalid' }];
  const email = body.email.toLowerCase();
  if (bookings.some((b) => b.status === 'confirmed' && b.email === email && Date.parse(b.start) > now)) return [429, { ok: false, error: 'limit' }];
  const free = slotsFor(body.with, now).slots.find((s) => s.start === body.start);
  if (!free) return [409, { ok: false, error: 'unavailable' }];
  const hostSlug = free.hosts
    .map((slug) => HOSTS.find((h) => h.slug === slug))
    .sort((a, b) => a.priority - b.priority)[0].slug;
  const token = randomBytes(32).toString('base64url');
  lastCancelToken = token;
  const booking = {
    id: randomUUID(),
    hostSlug,
    start: body.start,
    end: new Date(Date.parse(body.start) + SLOT_MINUTES * 60_000).toISOString(),
    name: body.name,
    email,
    company: body.company,
    role: body.role || '',
    industry: body.industry,
    message: body.message || '',
    topic: body.topic || 'briefing',
    locale: body.locale,
    timezone: body.timezone,
    status: 'confirmed',
    tokenHash: sha(token),
  };
  bookings.push(booking);
  console.log(`mock-crm: booked ${booking.id} with ${hostSlug} at ${booking.start}`);
  return [201, { ok: true, data: { booking: forEmail(booking), cancelToken: token } }];
}

function byToken(body) {
  return body && typeof body.token === 'string' ? bookings.find((x) => x.tokenHash === sha(body.token)) : undefined;
}

/** Like the CRM: a guest cancel's emails stay owed until the site records them (noticeSent). */
function cancelAnswer(b, changed) {
  const noticeOwed = b.cancelledBy === 'guest' && !b.noticeSent;
  return [200, { ok: true, data: { changed, booking: forEmail(b), noticeOwed } }];
}

function cancelBooking(body, now) {
  const b = byToken(body);
  if (!b) return [404, { ok: false, error: 'not_found' }];
  if (b.status === 'cancelled') return cancelAnswer(b, false);
  if (Date.parse(b.start) <= now) return [409, { ok: false, error: 'past' }];
  b.status = 'cancelled';
  b.cancelledBy = 'guest';
  b.cancelReason = typeof body.reason === 'string' ? body.reason : null;
  console.log(`mock-crm: guest cancelled ${b.id}${b.cancelReason ? ' with a reason' : ''}`);
  return cancelAnswer(b, true);
}

function noticeSent(body) {
  const b = byToken(body);
  if (!b) return [404, { ok: false, error: 'not_found' }];
  const recorded = b.status === 'cancelled' && b.cancelledBy === 'guest' && !b.noticeSent;
  if (recorded) b.noticeSent = true;
  return [200, { ok: true, data: { recorded } }];
}

function importLegacy(body) {
  if (!body || !Array.isArray(body.bookings)) return [400, { ok: false, error: 'invalid' }];
  let added = 0;
  let skipped = 0;
  body.bookings.forEach((b) => {
    if (imported.has(b.id)) skipped += 1;
    else {
      imported.add(b.id);
      added += 1;
    }
  });
  console.log(`mock-crm: import of ${body.bookings.length} bookings, ${(body.blockedDates || []).length} blocked dates, availability ${body.availability ? 'yes' : 'no'}`);
  return [200, { ok: true, data: { imported: added, skipped } }];
}

async function hostCancel(body) {
  const b = bookings.find((x) => x.id === body?.id);
  if (!b) return [404, { ok: false, error: 'not_found' }];
  b.status = 'cancelled';
  b.cancelledBy = 'host';
  const payload = JSON.stringify({ type: 'booking.cancelled', by: 'host', notifyGuest: body.notifyGuest !== false, booking: forEmail(b) });
  const res = await fetch(`${WEBSITE_ORIGIN}/api/crm/notify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', [SIGNATURE_HEADER]: signatureHeader(SECRET, 'POST', '/api/crm/notify', payload) },
    body: payload,
  });
  return [200, { ok: true, data: { websiteStatus: res.status, website: await res.json().catch(() => null) } }];
}

async function signed(req, res, url, raw) {
  const check = verifySignature({ secret: SECRET, header: req.headers[SIGNATURE_HEADER], method: req.method, pathWithQuery: url.pathname + url.search, body: raw });
  if (!check.ok) {
    console.log(`mock-crm: refused ${req.method} ${url.pathname}: ${check.reason}`);
    return send(res, 401, { ok: false, error: 'unauthorized' });
  }
  if (down) return send(res, 503, { ok: false, error: 'unavailable' });
  const now = Date.now();
  let body = null;
  if (raw.length > 0) {
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      return send(res, 400, { ok: false, error: 'invalid' });
    }
  }
  const route = `${req.method} ${url.pathname}`;
  if (route === 'GET /api/integrations/website/slots') return send(res, 200, { ok: true, data: slotsFor(url.searchParams.get('with') || undefined, now) });
  if (route === 'POST /api/integrations/website/bookings') return send(res, ...createBooking(body, now));
  if (route === 'POST /api/integrations/website/bookings/cancel') return send(res, ...cancelBooking(body, now));
  if (route === 'POST /api/integrations/website/bookings/notice-sent') return send(res, ...noticeSent(body));
  if (route === 'POST /api/integrations/website/import') return send(res, ...importLegacy(body));
  return send(res, 404, { ok: false, error: 'not_found' });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  let raw;
  try {
    raw = await readBody(req);
  } catch {
    return send(res, 400, { ok: false, error: 'invalid' });
  }
  try {
    if (url.pathname.startsWith('/api/integrations/website/')) return await signed(req, res, url, raw);
    const body = raw.length ? JSON.parse(raw.toString('utf8')) : null;
    if (req.method === 'GET' && url.pathname === '/__mock/state') {
      return send(res, 200, { bookings: bookings.map((b) => ({ id: b.id, host: b.hostSlug, start: b.start, status: b.status })), lastCancelToken });
    }
    if (req.method === 'POST' && url.pathname === '/__mock/down') {
      down = Boolean(body?.down);
      return send(res, 200, { down });
    }
    if (req.method === 'POST' && url.pathname === '/__mock/host-cancel') return send(res, ...(await hostCancel(body)));
    return send(res, 404, { ok: false, error: 'not_found' });
  } catch (err) {
    console.error('mock-crm: error', err instanceof Error ? err.message : err);
    return send(res, 500, { ok: false, error: 'server' });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`mock-crm: listening on http://localhost:${PORT}`));
