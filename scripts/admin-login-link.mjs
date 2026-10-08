/**
 * Break-glass sign-in for the booking admin, for when email is down.
 *
 * Mints the same one-time, 15-minute link the login page emails, straight into
 * the booking database, and prints it. Run it on the server, inside the app
 * container, so only someone with shell access to the box can use it:
 *
 *   docker exec <container> node scripts/admin-login-link.mjs ibrahim@itqanstudio.com
 *
 * The address must be in ADMIN_EMAILS (default ibrahim@itqanstudio.com) or the
 * link will not open a session.
 */
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const email = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/admin-login-link.mjs <admin email>');
  process.exit(1);
}

const dbPath = process.env.BOOKING_DB_PATH || path.join(process.cwd(), '.data', 'itqan.db');
const db = new DatabaseSync(dbPath);
const token = randomBytes(32).toString('base64url');
const hash = createHash('sha256').update(token).digest('hex');
const expires = new Date(Date.now() + 15 * 60_000).toISOString();

db.exec('BEGIN IMMEDIATE');
db.prepare('DELETE FROM admin_login_tokens WHERE email = ? AND used_at IS NULL').run(email);
db.prepare('INSERT INTO admin_login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)').run(hash, email, expires);
db.exec('COMMIT');
db.close();

console.log(`https://itqanstudio.com/admin/verify?token=${token}`);
console.log('Works once, for 15 minutes.');
