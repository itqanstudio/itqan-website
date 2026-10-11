import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { MIN_SECRET_LENGTH, SIGNATURE_MAX_SKEW_SECONDS } from './contract';

/*
 * Server-to-server signature shared with the CRM (REBUILD-SPEC section 8).
 *
 *   x-itqan-signature: t=<unix seconds>,v1=<hex>
 *   v1 = HMAC_SHA256(secret, "<t>.<METHOD>.<path with query>.<hex sha256 of the raw body>")
 *
 * The CRM runs the identical algorithm; both repos test the two spec vectors.
 * Without a secret of at least 32 characters nothing is signed or accepted.
 */

export const SECRET_ENV = 'ITQAN_BOOKING_SECRET';
/** sha256 of an empty body (a GET). */
export const EMPTY_BODY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const HEADER_MAX = 200;
const T_PATTERN = /^\d{1,12}$/;
const V1_PATTERN = /^[0-9a-fA-F]{64}$/;

export type SignedBody = string | Uint8Array;

export function sha256Hex(body: SignedBody): string {
  return createHash('sha256').update(body).digest('hex');
}

function usable(secret: string | null | undefined): secret is string {
  return typeof secret === 'string' && secret.length >= MIN_SECRET_LENGTH;
}

/** The shared secret, or null when it is missing or too short (fail closed). */
export function readSecret(env: Record<string, string | undefined> = process.env): string | null {
  const value = env[SECRET_ENV];
  return usable(value) ? value : null;
}

export function signingBase(t: number, method: string, pathWithQuery: string, bodySha256: string): string {
  return `${t}.${method.toUpperCase()}.${pathWithQuery}.${bodySha256}`;
}

export function computeV1(secret: string, t: number, method: string, pathWithQuery: string, body: SignedBody): string {
  if (!usable(secret)) throw new Error('secret_too_short');
  return createHmac('sha256', secret).update(signingBase(t, method, pathWithQuery, sha256Hex(body))).digest('hex');
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** The header value for one outgoing request. Throws when the secret is unusable. */
export function signatureHeader(
  secret: string,
  method: string,
  pathWithQuery: string,
  body: SignedBody,
  t: number = nowSeconds(),
): string {
  return `t=${t},v1=${computeV1(secret, t, method, pathWithQuery, body)}`;
}

/** Strict parse of `t=<digits>,v1=<64 hex>`; anything else is malformed. */
export function parseSignatureHeader(header: string | null | undefined): { t: number; v1: string } | null {
  if (!header || header.length > HEADER_MAX) return null;
  const parts = header.split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;
  const fields = new Map<string, string>();
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq <= 0) return null;
    const key = part.slice(0, eq);
    if (fields.has(key)) return null;
    fields.set(key, part.slice(eq + 1));
  }
  const t = fields.get('t');
  const v1 = fields.get('v1');
  if (!t || !v1 || !T_PATTERN.test(t) || !V1_PATTERN.test(v1)) return null;
  return { t: Number(t), v1: v1.toLowerCase() };
}

export type VerifyFailure = 'no_secret' | 'malformed' | 'stale' | 'mismatch';
export type VerifyResult = { ok: true; t: number; v1: string } | { ok: false; reason: VerifyFailure };

export interface VerifyInput {
  secret: string | null;
  header: string | null | undefined;
  method: string;
  pathWithQuery: string;
  body: SignedBody;
  now?: number;
}

/** Checks an incoming request. Constant-time compare; a 300 second window either side of now. */
export function verifySignature(input: VerifyInput): VerifyResult {
  if (!usable(input.secret)) return { ok: false, reason: 'no_secret' };
  const parsed = parseSignatureHeader(input.header);
  if (!parsed) return { ok: false, reason: 'malformed' };
  const now = input.now ?? nowSeconds();
  if (Math.abs(now - parsed.t) > SIGNATURE_MAX_SKEW_SECONDS) return { ok: false, reason: 'stale' };
  const expected = Buffer.from(computeV1(input.secret, parsed.t, input.method, input.pathWithQuery, input.body), 'hex');
  const given = Buffer.from(parsed.v1, 'hex');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: 'mismatch' };
  return { ok: true, t: parsed.t, v1: parsed.v1 };
}
