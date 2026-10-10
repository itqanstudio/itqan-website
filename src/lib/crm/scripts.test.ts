import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, describe, expect, it } from 'vitest';
import { buildBatches, exportOrigin, parseAvailability, readLegacyData, summarize } from '../../../scripts/lib/crm-export.mjs';
import { computeV1, signatureHeader, verifySignature } from '../../../scripts/lib/crm-signature.mjs';
import { computeV1 as computeV1Ts } from './hmac';

const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
const T = 1760000000;
const dir = mkdtempSync(path.join(tmpdir(), 'itqan-export-'));

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('scripts/lib/crm-signature.mjs', () => {
  it('reproduces both spec vectors, like the TypeScript module', () => {
    expect(computeV1(SECRET, T, 'POST', '/api/integrations/website/bookings', '{"a":1}')).toBe('372a868e7c6fe1f8643c071d5152f445378cc75f57bf42a4facde5bcb922244f');
    expect(computeV1(SECRET, T, 'GET', '/api/integrations/website/slots?with=bisma', '')).toBe('2439929c2af4c1e822da837842d3aa7d37713a1dae63bd6ee160cf2e27a5f4b1');
    expect(computeV1(SECRET, T, 'POST', '/x', 'body')).toBe(computeV1Ts(SECRET, T, 'POST', '/x', 'body'));
  });
  it('verifies and refuses like the site does', () => {
    const header = signatureHeader(SECRET, 'POST', '/api/crm/notify', '{}', T);
    expect(verifySignature({ secret: SECRET, header, method: 'POST', pathWithQuery: '/api/crm/notify', body: '{}', now: T })).toEqual({ ok: true });
    expect(verifySignature({ secret: SECRET, header, method: 'POST', pathWithQuery: '/api/crm/notify', body: '{}', now: T + 301 })).toEqual({ ok: false, reason: 'stale' });
    expect(verifySignature({ secret: SECRET, header: 'x', method: 'POST', pathWithQuery: '/', body: '', now: T })).toEqual({ ok: false, reason: 'malformed' });
    expect(verifySignature({ secret: 'short', header, method: 'POST', pathWithQuery: '/', body: '', now: T })).toEqual({ ok: false, reason: 'no_secret' });
    expect(() => signatureHeader('short', 'GET', '/', '', T)).toThrow('secret_too_short');
  });
});

const SCHEMA = `
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE blocked_dates (date TEXT PRIMARY KEY, note TEXT NOT NULL DEFAULT '');
CREATE TABLE bookings (
  id TEXT PRIMARY KEY, start_utc TEXT NOT NULL, end_utc TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
  company TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', industry TEXT NOT NULL, message TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL, locale TEXT NOT NULL, timezone TEXT NOT NULL, status TEXT NOT NULL, cancel_token_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, cancelled_at TEXT, cancelled_by TEXT
);`;

const AVAILABILITY = {
  timezone: 'Asia/Dubai',
  slotMinutes: 30,
  bufferMinutes: 15,
  minNoticeHours: 24,
  horizonDays: 21,
  maxPerDay: 4,
  weekly: { mon: [{ start: '10:00', end: '12:00' }], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
};

function makeDb(name: string, rows: number, message = ''): DatabaseSync {
  const db = new DatabaseSync(path.join(dir, name));
  db.exec(SCHEMA);
  db.prepare("INSERT INTO settings VALUES ('availability', ?, '2026-10-08T00:00:00Z')").run(JSON.stringify(AVAILABILITY));
  db.prepare("INSERT INTO blocked_dates VALUES ('2026-12-02', 'National Day')").run();
  const insert = db.prepare(
    `INSERT INTO bookings VALUES (?, ?, ?, 'Sara Ahmed', ?, 'Example Foods', '', 'fnb', ?, 'briefing', 'en', 'Asia/Dubai', ?, ?, '', '2026-10-08T00:00:00Z', ?, ?)`,
  );
  for (let i = 0; i < rows; i += 1) {
    const cancelled = i % 3 === 2;
    const start = new Date(Date.UTC(2026, 9, 12 + i, 6)).toISOString();
    const end = new Date(Date.UTC(2026, 9, 12 + i, 6, 30)).toISOString();
    insert.run(`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, start, end, `p${i}@example.com`, message, cancelled ? 'cancelled' : 'confirmed', `hash${i}`, cancelled ? '2026-10-09T00:00:00Z' : null, cancelled ? 'guest' : null);
  }
  return db;
}

describe('scripts/lib/crm-export.mjs', () => {
  it('reads bookings, saved hours and blocked dates in the LegacyBooking shape', () => {
    const db = makeDb('a.db', 3);
    const data = readLegacyData(db);
    db.close();
    expect(data.bookings).toHaveLength(3);
    expect(data.bookings[2]).toMatchObject({ status: 'cancelled', cancelled_by: 'guest', email: 'p2@example.com', role: '' });
    expect(data.bookings[0]).toMatchObject({ cancelled_at: null, cancelled_by: null });
    expect(Object.keys(data.bookings[0])).toEqual([
      'id', 'start_utc', 'end_utc', 'name', 'email', 'company', 'role', 'industry', 'message', 'topic', 'locale', 'timezone', 'status', 'created_at', 'cancelled_at', 'cancelled_by',
    ]);
    expect(data.availability).toEqual(AVAILABILITY);
    expect(data.blockedDates).toEqual([{ date: '2026-12-02', note: 'National Day' }]);
    expect(summarize(data, Date.parse('2026-10-13T00:00:00Z'))).toEqual({
      bookings: 3,
      upcomingConfirmed: 1,
      pastConfirmed: 1,
      cancelled: 1,
      blockedDates: 1,
      availability: 'yes',
    });
  });

  it('copes with a file that has no tables yet', () => {
    const db = new DatabaseSync(path.join(dir, 'empty.db'));
    const data = readLegacyData(db);
    db.close();
    expect(data.bookings).toEqual([]);
    expect(data.availability).toBeNull();
    expect(data.warnings).toHaveLength(3);
    expect(buildBatches(data).batches).toEqual([]);
  });

  it('cuts big exports into requests under the cap, availability first, nothing lost', () => {
    const db = makeDb('big.db', 40, 'x'.repeat(1500));
    const data = readLegacyData(db);
    db.close();
    const { batches, oversized } = buildBatches(data, 15_000);
    expect(oversized).toBe(0);
    expect(batches.length).toBeGreaterThan(3);
    batches.forEach((b) => expect(Buffer.byteLength(b)).toBeLessThanOrEqual(15_000));
    const parsed = batches.map((b) => JSON.parse(b) as { bookings: unknown[]; availability?: unknown; blockedDates?: unknown[] });
    expect(parsed[0].availability).toEqual(AVAILABILITY);
    expect(parsed.slice(1).every((b) => b.availability === undefined)).toBe(true);
    expect(parsed.reduce((n, b) => n + b.bookings.length, 0)).toBe(40);
    expect(parsed.reduce((n, b) => n + (b.blockedDates?.length ?? 0), 0)).toBe(1);
  });

  it('reports an item too big for any request instead of sending it', () => {
    const db = makeDb('huge.db', 1, 'x'.repeat(20_000));
    const data = readLegacyData(db);
    db.close();
    expect(buildBatches(data, 15_000).oversized).toBe(1);
  });

  it('posts over https, or plain http only to a local or private host', () => {
    expect(exportOrigin(undefined)).toBe('https://portal.itqanstudio.com');
    expect(exportOrigin('http://localhost:3999')).toBe('http://localhost:3999');
    expect(exportOrigin('http://itqan-crm:3000')).toBe('http://itqan-crm:3000');
    expect(exportOrigin('http://portal.itqanstudio.com')).toBeNull();
    expect(exportOrigin('https://u:p@portal.itqanstudio.com')).toBeNull();
    expect(exportOrigin('nonsense')).toBeNull();
  });

  it('leaves out saved hours it cannot read', () => {
    expect(parseAvailability({ ...AVAILABILITY, weekly: { mon: 'all day' } })).toBeNull();
    expect(parseAvailability({ ...AVAILABILITY, slotMinutes: '30' })).toBeNull();
    expect(parseAvailability(null)).toBeNull();
  });
});
