import {
  DEFAULT_AVAILABILITY,
  LIMITS,
  LOGIN_TOKEN_MINUTES,
  MAX_ACTIVE_PER_EMAIL,
  MAX_ACTIVE_PER_IP,
  RETENTION_DAYS,
  SESSION_DAYS,
} from './config';
import { getDb, withTransaction } from './db';
import { generateSlots } from './slots';
import { hashToken, newId, newToken } from './tokens';
import { availabilitySchema, type BookingRequest } from './validation';
import type { Availability, BlockedDate, Booking, Busy } from './types';

const DAY = 86_400_000;
const AVAILABILITY_KEY = 'availability';

type Row = Record<string, unknown>;

function toBooking(r: Row): Booking {
  return {
    id: String(r.id),
    startUtc: String(r.start_utc),
    endUtc: String(r.end_utc),
    name: String(r.name),
    email: String(r.email),
    company: String(r.company),
    role: String(r.role),
    industry: r.industry as Booking['industry'],
    message: String(r.message),
    topic: r.topic as Booking['topic'],
    locale: r.locale as Booking['locale'],
    timezone: String(r.timezone),
    status: r.status as Booking['status'],
    createdAt: String(r.created_at),
    cancelledAt: r.cancelled_at ? String(r.cancelled_at) : null,
    cancelledBy: (r.cancelled_by as Booking['cancelledBy']) ?? null,
  };
}

/* ── availability ─────────────────────────────────────────── */

export function getAvailability(): Availability {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(AVAILABILITY_KEY) as Row | undefined;
  if (!row) return DEFAULT_AVAILABILITY;
  try {
    const parsed = availabilitySchema.safeParse(JSON.parse(String(row.value)));
    if (parsed.success) return parsed.data;
    console.error('[scheduling] saved availability failed validation; serving defaults until it is saved again:', parsed.error.issues[0]?.message);
  } catch (err) {
    console.error('[scheduling] saved availability is not valid JSON; serving defaults:', err instanceof Error ? err.message : String(err));
  }
  return DEFAULT_AVAILABILITY;
}

export function saveAvailability(a: Availability): void {
  getDb()
    .prepare(
      'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    )
    .run(AVAILABILITY_KEY, JSON.stringify(a), new Date().toISOString());
}

export function listBlockedDates(): BlockedDate[] {
  return (getDb().prepare('SELECT date, note FROM blocked_dates ORDER BY date').all() as Row[]).map((r) => ({
    date: String(r.date),
    note: String(r.note),
  }));
}

export function addBlockedDate(b: BlockedDate): 'ok' | 'full' {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) AS n FROM blocked_dates').get() as Row).n as number;
  if (count >= LIMITS.blockedDates) return 'full';
  db.prepare('INSERT INTO blocked_dates (date, note) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET note = excluded.note').run(b.date, b.note);
  return 'ok';
}

export function removeBlockedDate(date: string): void {
  getDb().prepare('DELETE FROM blocked_dates WHERE date = ?').run(date);
}

/* ── slots ────────────────────────────────────────────────── */

function busyFrom(now: number): Busy[] {
  const rows = getDb()
    .prepare("SELECT start_utc, end_utc FROM bookings WHERE status = 'confirmed' AND end_utc >= ?")
    .all(new Date(now - DAY).toISOString()) as Row[];
  return rows.map((r) => ({ start: Date.parse(String(r.start_utc)), end: Date.parse(String(r.end_utc)) }));
}

export function availableSlots(now = Date.now()): { slots: string[]; slotMinutes: number; timezone: string } {
  const availability = getAvailability();
  const blocked = new Set(listBlockedDates().map((b) => b.date));
  return {
    slots: generateSlots({ availability, blocked, busy: busyFrom(now), now }),
    slotMinutes: availability.slotMinutes,
    timezone: availability.timezone,
  };
}

/* ── bookings ─────────────────────────────────────────────── */

export type CreateResult =
  | { ok: true; booking: Booking; cancelToken: string }
  | { ok: false; reason: 'unavailable' | 'limit' };

function activeFutureCount(column: 'email' | 'ip_hash', value: string, now: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM bookings WHERE ${column} = ? AND status = 'confirmed' AND start_utc > ?`)
    .get(value, new Date(now).toISOString()) as Row;
  return Number(row.n);
}

/**
 * Re-checks the slot inside the write transaction, so two people racing for the
 * same time cannot both get it. The partial unique index on confirmed start
 * times is the second lock behind this check.
 *
 * Bookings are not email-verified (an executive should not have to confirm a
 * confirmation), so the caps on active future bookings per email and per
 * connection are what stop one person from holding the whole calendar.
 */
export function createBooking(req: BookingRequest, now = Date.now(), ipHash = ''): CreateResult {
  return withTransaction((db) => {
    purgeExpired(now);
    if (activeFutureCount('email', req.email, now) >= MAX_ACTIVE_PER_EMAIL) return { ok: false, reason: 'limit' } as const;
    if (ipHash && activeFutureCount('ip_hash', ipHash, now) >= MAX_ACTIVE_PER_IP) return { ok: false, reason: 'limit' } as const;
    const availability = getAvailability();
    const blocked = new Set(listBlockedDates().map((b) => b.date));
    const slots = generateSlots({ availability, blocked, busy: busyFrom(now), now });
    if (!slots.includes(req.start)) return { ok: false, reason: 'unavailable' } as const;

    const cancelToken = newToken();
    const id = newId();
    const createdAt = new Date(now).toISOString();
    const endUtc = new Date(Date.parse(req.start) + availability.slotMinutes * 60_000).toISOString();
    try {
      db.prepare(
        `INSERT INTO bookings (id, start_utc, end_utc, name, email, company, role, industry, message, topic, locale, timezone, status, cancel_token_hash, ip_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`,
      ).run(id, req.start, endUtc, req.name, req.email, req.company, req.role, req.industry, req.message, req.topic, req.locale, req.timezone, hashToken(cancelToken), ipHash, createdAt);
    } catch (err) {
      if (err instanceof Error && /UNIQUE constraint failed: bookings\.start_utc/.test(err.message)) {
        return { ok: false, reason: 'unavailable' } as const;
      }
      throw err;
    }
    const booking = toBooking(db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Row);
    return { ok: true, booking, cancelToken } as const;
  });
}

export function findBookingByCancelToken(token: string): Booking | null {
  const row = getDb().prepare('SELECT * FROM bookings WHERE cancel_token_hash = ?').get(hashToken(token)) as Row | undefined;
  return row ? toBooking(row) : null;
}

export function getBooking(id: string): Booking | null {
  const row = getDb().prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Row | undefined;
  return row ? toBooking(row) : null;
}

export type CancelResult = { ok: true; booking: Booking; changed: boolean } | { ok: false; reason: 'not_found' | 'past' };

/** Idempotent: cancelling twice reports the booking without changing it again. */
export function cancelBooking(by: 'guest' | 'admin', lookup: { token: string } | { id: string }, now = Date.now()): CancelResult {
  return withTransaction(() => {
    const booking = 'token' in lookup ? findBookingByCancelToken(lookup.token) : getBooking(lookup.id);
    if (!booking) return { ok: false, reason: 'not_found' } as const;
    if (booking.status === 'cancelled') return { ok: true, booking, changed: false } as const;
    if (by === 'guest' && Date.parse(booking.startUtc) <= now) return { ok: false, reason: 'past' } as const;
    const at = new Date(now).toISOString();
    getDb()
      .prepare("UPDATE bookings SET status = 'cancelled', cancelled_at = ?, cancelled_by = ? WHERE id = ? AND status = 'confirmed'")
      .run(at, by, booking.id);
    return { ok: true, booking: { ...booking, status: 'cancelled', cancelledAt: at, cancelledBy: by }, changed: true } as const;
  });
}

export function listBookings(opts: { from: string; to?: string; includeCancelled?: boolean }): Booking[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM bookings WHERE start_utc >= ? AND start_utc < ? ${opts.includeCancelled ? '' : "AND status = 'confirmed'"} ORDER BY start_utc LIMIT 500`,
    )
    .all(opts.from, opts.to ?? '9999-12-31T00:00:00.000Z') as Row[];
  return rows.map(toBooking);
}

/** Privacy policy: bookings are deleted 12 months after the booked time. */
export function purgeExpired(now = Date.now()): void {
  const db = getDb();
  db.prepare('DELETE FROM bookings WHERE end_utc < ?').run(new Date(now - RETENTION_DAYS * DAY).toISOString());
  db.prepare('DELETE FROM admin_login_tokens WHERE expires_at < ?').run(new Date(now - DAY).toISOString());
  db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(new Date(now).toISOString());
}

/* ── admin auth ───────────────────────────────────────────── */

/** A new link replaces every earlier unused link for the same address. */
export function createLoginToken(email: string, now = Date.now()): string {
  const token = newToken();
  withTransaction((db) => {
    db.prepare('DELETE FROM admin_login_tokens WHERE email = ? AND used_at IS NULL').run(email);
    db.prepare('INSERT INTO admin_login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)').run(
      hashToken(token),
      email,
      new Date(now + LOGIN_TOKEN_MINUTES * 60_000).toISOString(),
    );
  });
  return token;
}

/** Single use: the token is spent in the same transaction that opens the session. */
export function redeemLoginToken(token: string, now = Date.now()): { sessionToken: string; email: string } | null {
  return withTransaction((db) => {
    const row = db
      .prepare('SELECT email, expires_at, used_at FROM admin_login_tokens WHERE token_hash = ?')
      .get(hashToken(token)) as Row | undefined;
    if (!row || row.used_at || Date.parse(String(row.expires_at)) < now) return null;
    db.prepare('UPDATE admin_login_tokens SET used_at = ? WHERE token_hash = ?').run(new Date(now).toISOString(), hashToken(token));
    const sessionToken = newToken();
    db.prepare('INSERT INTO admin_sessions (id_hash, email, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      hashToken(sessionToken),
      String(row.email),
      new Date(now).toISOString(),
      new Date(now + SESSION_DAYS * DAY).toISOString(),
    );
    return { sessionToken, email: String(row.email) };
  });
}

export function sessionEmail(sessionToken: string | undefined, now = Date.now()): string | null {
  if (!sessionToken || sessionToken.length > 100) return null;
  const row = getDb()
    .prepare('SELECT email, expires_at FROM admin_sessions WHERE id_hash = ?')
    .get(hashToken(sessionToken)) as Row | undefined;
  if (!row || Date.parse(String(row.expires_at)) < now) return null;
  return String(row.email);
}

export function endSession(sessionToken: string): void {
  getDb().prepare('DELETE FROM admin_sessions WHERE id_hash = ?').run(hashToken(sessionToken));
}
