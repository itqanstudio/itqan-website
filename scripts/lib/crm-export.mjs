/**
 * Pure helpers for scripts/export-bookings-to-crm.mjs: read the old booking
 * SQLite file and cut it into import requests small enough for the CRM's
 * 16 KB body cap. Tested from src/lib/crm/scripts.test.ts.
 *
 * Shapes follow ImportRequest in src/lib/crm/contract.ts:
 *   { bookings: LegacyBooking[], availability?: LegacyAvailability, blockedDates?: { date, note }[] }
 */

/**
 * The four octets of an IPv4 literal (decimal, no leading zeros, 0 to 255), or
 * null. A DNS name such as 10.evil.example.com is never read as an address.
 * @param {string} host
 * @returns {number[] | null}
 */
function ipv4Octets(host) {
  const parts = host.split('.');
  if (parts.length !== 4 || !parts.every((p) => /^(0|[1-9]\d{0,2})$/.test(p))) return null;
  const octets = parts.map(Number);
  return octets.every((n) => n <= 255) ? octets : null;
}

/**
 * Loopback, a single-label Docker service name or an RFC 1918 address, with IP
 * literals compared whole (same rule as isPrivateHost in src/lib/crm/client.ts).
 * @param {string} hostname
 * @returns {boolean}
 */
function isPrivateHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host === '::1') return true;
  const ip = ipv4Octets(host);
  if (ip) {
    const [a, b] = ip;
    return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
  }
  return /^[a-z0-9-]*[a-z][a-z0-9-]*$/.test(host);
}

/**
 * The CRM origin to post to: https, or plain http only on a private host (see
 * isPrivateHost; same rule as crmOrigin in src/lib/crm/client.ts). Null when unusable.
 * @param {string | undefined} raw
 * @returns {string | null}
 */
export function exportOrigin(raw) {
  try {
    const url = new URL((raw || 'https://portal.itqanstudio.com').trim());
    if (url.username || url.password) return null;
    if (url.protocol === 'https:') return url.origin;
    return url.protocol === 'http:' && isPrivateHost(url.hostname) ? url.origin : null;
  } catch {
    return null;
  }
}

/** Below the CRM's 16 KB cap, with room for headers the CRM may count. */
export const MAX_BATCH_BYTES = 15_000;

const BOOKING_COLUMNS = [
  'id',
  'start_utc',
  'end_utc',
  'name',
  'email',
  'company',
  'role',
  'industry',
  'message',
  'topic',
  'locale',
  'timezone',
  'status',
  'created_at',
  'cancelled_at',
  'cancelled_by',
];
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** @param {unknown} err */
function isMissingTable(err) {
  return err instanceof Error && /no such table/i.test(err.message);
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {string} sql
 * @param {string[]} warnings
 * @param {string} label
 */
function allRows(db, sql, warnings, label) {
  try {
    return db.prepare(sql).all();
  } catch (err) {
    if (isMissingTable(err)) {
      warnings.push(`No ${label} table in this file.`);
      return [];
    }
    throw err;
  }
}

/** @param {unknown} v */
function text(v) {
  return v === null || v === undefined ? '' : String(v);
}

/** @param {unknown} v */
function nullableText(v) {
  return v === null || v === undefined || v === '' ? null : String(v);
}

/**
 * The saved weekly hours and rules, when they look like the old site's
 * Availability object. Anything else is left out with a warning.
 * @param {unknown} value
 */
export function parseAvailability(value) {
  if (!value || typeof value !== 'object') return null;
  const a = /** @type {Record<string, unknown>} */ (value);
  const numbers = ['slotMinutes', 'bufferMinutes', 'minNoticeHours', 'horizonDays', 'maxPerDay'];
  if (typeof a.timezone !== 'string' || !numbers.every((k) => Number.isInteger(a[k]))) return null;
  const weekly = /** @type {Record<string, unknown>} */ (a.weekly ?? {});
  /** @param {unknown} r */
  const isRange = (r) => {
    if (!r || typeof r !== 'object') return false;
    const range = /** @type {Record<string, unknown>} */ (r);
    return typeof range.start === 'string' && typeof range.end === 'string';
  };
  const okWeekly = WEEKDAYS.every((d) => Array.isArray(weekly[d]) && /** @type {unknown[]} */ (weekly[d]).every(isRange));
  if (!okWeekly) return null;
  return {
    timezone: a.timezone,
    slotMinutes: a.slotMinutes,
    bufferMinutes: a.bufferMinutes,
    minNoticeHours: a.minNoticeHours,
    horizonDays: a.horizonDays,
    maxPerDay: a.maxPerDay,
    weekly: Object.fromEntries(
      WEEKDAYS.map((d) => [d, /** @type {Array<{start: string, end: string}>} */ (weekly[d]).map((r) => ({ start: r.start, end: r.end }))]),
    ),
  };
}

/**
 * Everything the CRM import needs from the old SQLite file.
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function readLegacyData(db) {
  /** @type {string[]} */
  const warnings = [];
  const bookings = allRows(db, `SELECT ${BOOKING_COLUMNS.join(', ')} FROM bookings ORDER BY start_utc`, warnings, 'bookings').map((r) => ({
    id: text(r.id),
    start_utc: text(r.start_utc),
    end_utc: text(r.end_utc),
    name: text(r.name),
    email: text(r.email),
    company: text(r.company),
    role: text(r.role),
    industry: text(r.industry),
    message: text(r.message),
    topic: text(r.topic),
    locale: text(r.locale),
    timezone: text(r.timezone),
    status: r.status === 'cancelled' ? 'cancelled' : 'confirmed',
    created_at: text(r.created_at),
    cancelled_at: nullableText(r.cancelled_at),
    cancelled_by: nullableText(r.cancelled_by),
  }));

  let availability = null;
  const settings = allRows(db, "SELECT value FROM settings WHERE key = 'availability'", warnings, 'settings');
  if (settings.length > 0) {
    try {
      availability = parseAvailability(JSON.parse(text(settings[0].value)));
    } catch {
      availability = null;
    }
    if (!availability) warnings.push('The saved availability is not readable; it is left out. Set the hours in the CRM.');
  }

  const blockedDates = allRows(db, 'SELECT date, note FROM blocked_dates ORDER BY date', warnings, 'blocked_dates').map((r) => ({
    date: text(r.date),
    note: text(r.note),
  }));

  return { bookings, availability, blockedDates, warnings };
}

/**
 * Counts only: the export prints no names or addresses.
 * @param {ReturnType<typeof readLegacyData>} data
 * @param {number} [now]
 */
export function summarize(data, now = Date.now()) {
  const confirmed = data.bookings.filter((b) => b.status === 'confirmed');
  return {
    bookings: data.bookings.length,
    upcomingConfirmed: confirmed.filter((b) => Date.parse(b.start_utc) > now).length,
    pastConfirmed: confirmed.filter((b) => Date.parse(b.start_utc) <= now).length,
    cancelled: data.bookings.length - confirmed.length,
    blockedDates: data.blockedDates.length,
    availability: data.availability ? 'yes' : 'no',
  };
}

/** @param {unknown} body */
function bytes(body) {
  return Buffer.byteLength(JSON.stringify(body), 'utf8');
}

/**
 * Cuts the data into import bodies of at most `maxBytes` each. The first body
 * carries the availability. An item too big for any body is reported, not sent.
 * @param {ReturnType<typeof readLegacyData>} data
 * @param {number} [maxBytes]
 */
export function buildBatches(data, maxBytes = MAX_BATCH_BYTES) {
  /** @type {Array<{ bookings: unknown[], availability?: unknown, blockedDates?: unknown[] }>} */
  const batches = [];
  let current = data.availability ? { bookings: [], availability: data.availability } : { bookings: [] };
  let oversized = 0;

  /** @param {'bookings' | 'blockedDates'} key @param {unknown} item */
  const add = (key, item) => {
    const list = /** @type {unknown[]} */ (current[key] ?? []);
    const next = { ...current, [key]: [...list, item] };
    if (bytes(next) <= maxBytes) {
      current = next;
      return;
    }
    const alone = { bookings: [], ...(key === 'blockedDates' ? { blockedDates: [item] } : { bookings: [item] }) };
    if (bytes(alone) > maxBytes) {
      oversized += 1;
      return;
    }
    batches.push(current);
    current = alone;
  };

  data.bookings.forEach((b) => add('bookings', b));
  data.blockedDates.forEach((d) => add('blockedDates', d));
  const hasContent = current.bookings.length > 0 || (current.blockedDates?.length ?? 0) > 0 || current.availability;
  if (hasContent) batches.push(current);
  return { batches: batches.map((b) => JSON.stringify(b)), oversized };
}
