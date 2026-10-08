import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/*
 * One SQLite file holds bookings, availability and admin sessions. Production
 * runs one long-lived Node container (Coolify on EC2), so a single in-process
 * connection is correct; the file lives on a persistent volume mounted at
 * /app/.data, which the daily AMI backs up with the rest of the box.
 */
const DEFAULT_PATH = path.join(process.cwd(), '.data', 'itqan.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS blocked_dates (
  date TEXT PRIMARY KEY,
  note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  start_utc TEXT NOT NULL,
  end_utc TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL,
  locale TEXT NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  cancel_token_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  cancelled_at TEXT,
  cancelled_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_start_confirmed ON bookings(start_utc) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS ix_bookings_start ON bookings(start_utc);
CREATE TABLE IF NOT EXISTS admin_login_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  id_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`;

type Holder = { db?: DatabaseSync; path?: string };
const holder = globalThis as typeof globalThis & { __itqanDb?: Holder };
holder.__itqanDb ??= {};

function dbPath(): string {
  return process.env.BOOKING_DB_PATH || DEFAULT_PATH;
}

export function getDb(): DatabaseSync {
  const h = holder.__itqanDb!;
  const p = dbPath();
  if (h.db && h.path === p) return h.db;
  if (h.db) h.db.close();
  if (p !== ':memory:') mkdirSync(path.dirname(p), { recursive: true });
  const db = new DatabaseSync(p);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  h.db = db;
  h.path = p;
  return db;
}

/** Run `fn` inside one write transaction; rolls back on any throw. */
export function withTransaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const out = fn(db);
    db.exec('COMMIT');
    return out;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/** Tests only: drop the cached connection so the next call opens a fresh file. */
export function closeDbForTests(): void {
  const h = holder.__itqanDb!;
  h.db?.close();
  h.db = undefined;
  h.path = undefined;
}
