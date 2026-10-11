/**
 * The CRM integration signature for plain Node scripts (the export script and
 * the local mock CRM). Same algorithm as src/lib/crm/hmac.ts; Vitest checks
 * this file against the two spec vectors too (src/lib/crm/scripts.test.ts).
 *
 *   x-itqan-signature: t=<unix seconds>,v1=<hex>
 *   v1 = HMAC_SHA256(secret, "<t>.<METHOD>.<path with query>.<hex sha256 of the raw body>")
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SIGNATURE_HEADER = 'x-itqan-signature';
export const MIN_SECRET_LENGTH = 32;
export const MAX_SKEW_SECONDS = 300;

/** @param {string | Uint8Array} body */
export function sha256Hex(body) {
  return createHash('sha256').update(body).digest('hex');
}

/**
 * @param {string} secret
 * @param {number} t
 * @param {string} method
 * @param {string} pathWithQuery
 * @param {string | Uint8Array} body
 * @returns {string}
 */
export function computeV1(secret, t, method, pathWithQuery, body) {
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) throw new Error('secret_too_short');
  return createHmac('sha256', secret).update(`${t}.${method.toUpperCase()}.${pathWithQuery}.${sha256Hex(body)}`).digest('hex');
}

/**
 * @param {string} secret
 * @param {string} method
 * @param {string} pathWithQuery
 * @param {string | Uint8Array} body
 * @param {number} [t]
 * @returns {string}
 */
export function signatureHeader(secret, method, pathWithQuery, body, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${computeV1(secret, t, method, pathWithQuery, body)}`;
}

/**
 * @param {{ secret: string, header: string | undefined | null, method: string, pathWithQuery: string, body: string | Uint8Array, now?: number }} input
 * @returns {{ ok: true } | { ok: false, reason: 'no_secret' | 'malformed' | 'stale' | 'mismatch' }}
 */
export function verifySignature({ secret, header, method, pathWithQuery, body, now = Math.floor(Date.now() / 1000) }) {
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) return { ok: false, reason: 'no_secret' };
  const match = /^t=(\d{1,12}),\s*v1=([0-9a-fA-F]{64})$/.exec(header ?? '');
  if (!match) return { ok: false, reason: 'malformed' };
  const t = Number(match[1]);
  if (Math.abs(now - t) > MAX_SKEW_SECONDS) return { ok: false, reason: 'stale' };
  const expected = Buffer.from(computeV1(secret, t, method, pathWithQuery, body), 'hex');
  const given = Buffer.from(match[2].toLowerCase(), 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given) ? { ok: true } : { ok: false, reason: 'mismatch' };
}
