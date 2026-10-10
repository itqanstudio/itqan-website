import type { z } from 'zod';
import {
  SIGNATURE_HEADER,
  type CancelBookingData,
  type CreateBookingData,
  type CreateBookingRequest,
  type IntegrationErrorCode,
  type IntegrationResult,
  type SlotsData,
} from './contract';
import { readSecret, signatureHeader } from './hmac';
import { cancelBookingDataSchema, createBookingDataSchema, slotsDataSchema } from './schemas';

/*
 * Signed server-to-server calls to the CRM (REBUILD-SPEC section 8). Every call
 * resolves to a typed result; nothing here throws into a route handler.
 */

export const DEFAULT_CRM_ORIGIN = 'https://portal.itqanstudio.com';
export const CRM_TIMEOUT_MS = 8_000;
export const WEBSITE_API = '/api/integrations/website';
/** The biggest answer is the slot list; this is far above any real one. */
const MAX_RESPONSE_BYTES = 2_000_000;

const ERROR_CODES: readonly IntegrationErrorCode[] = ['unauthorized', 'invalid', 'unavailable', 'limit', 'not_found', 'past', 'server'];

/** A failure carries the HTTP status (0 when no answer came back) so a route can tell "taken" from "down". */
export type CrmFailure = Extract<IntegrationResult<never>, { ok: false }> & { status: number };
export type CrmResult<T> = { ok: true; data: T } | CrmFailure;

export interface CallOptions {
  timeoutMs?: number;
}

function fail(error: IntegrationErrorCode, status: number, message?: string): CrmFailure {
  return message ? { ok: false, error, status, message } : { ok: false, error, status };
}

/**
 * True when the CRM is unreachable, broken or misconfigured, as opposed to a
 * normal answer such as "that time is taken". The visitor then sees the paused
 * message instead of a misleading error.
 */
export function isCrmDown(f: CrmFailure): boolean {
  return f.status === 0 || f.status >= 500 || f.error === 'server' || f.error === 'unauthorized';
}

/**
 * The four octets of an IPv4 literal written as the URL parser writes it
 * (decimal, no leading zeros, each 0 to 255), or null for anything else. A DNS
 * name such as 10.evil.example.com is never read as an address.
 */
function ipv4Octets(host: string): readonly number[] | null {
  const parts = host.split('.');
  if (parts.length !== 4 || !parts.every((p) => /^(0|[1-9]\d{0,2})$/.test(p))) return null;
  const octets = parts.map(Number);
  return octets.every((n) => n <= 255) ? octets : null;
}

/**
 * Hosts where plain http stays on the machine or the private network: loopback,
 * a single-label name (a Docker service such as "itqan-crm") or an RFC 1918
 * address. IP literals are compared whole; any other dotted name is a DNS name
 * and needs https. Booking details never cross the internet unencrypted.
 */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host === '::1') return true;
  const ip = ipv4Octets(host);
  if (ip) {
    const [a, b] = ip;
    return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
  }
  // At least one letter: an all-digit host is an IPv4 address in number form, not a service name.
  return /^[a-z0-9-]*[a-z][a-z0-9-]*$/.test(host);
}

/** CRM_API_ORIGIN (https, or http on a private host) or the production portal; null when the setting is unusable. */
export function crmOrigin(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.CRM_API_ORIGIN?.trim();
  if (!raw) return DEFAULT_CRM_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return null;
    if (url.protocol === 'https:') return url.origin;
    return url.protocol === 'http:' && isPrivateHost(url.hostname) ? url.origin : null;
  } catch {
    return null;
  }
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error('response_too_large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  chunks.reduce((offset, c) => {
    bytes.set(c, offset);
    return offset + c.byteLength;
  }, 0);
  return new TextDecoder().decode(bytes);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isErrorCode(value: unknown): value is IntegrationErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/** Maps a CRM answer to a result: the envelope is `{ ok, data?, error?, message? }`. */
export function interpret<T>(status: number, bodyText: string, schema: z.ZodType<T>): CrmResult<T> {
  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return fail('server', status, 'not_json');
  }
  if (!isRecord(body)) return fail('server', status, 'not_an_object');
  if (status >= 200 && status < 300 && body.ok === true) {
    const parsed = schema.safeParse(body.data);
    return parsed.success ? { ok: true, data: parsed.data } : fail('server', status, 'bad_shape');
  }
  if (body.ok === false && isErrorCode(body.error)) {
    return fail(body.error, status, typeof body.message === 'string' ? body.message.slice(0, 200) : undefined);
  }
  return fail('server', status, 'unexpected_answer');
}

function reasonOf(err: unknown): string {
  if (err instanceof Error) return err.name === 'AbortError' ? 'timeout' : err.message.slice(0, 200);
  return 'unknown';
}

async function call<T>(method: 'GET' | 'POST', path: string, payload: unknown, schema: z.ZodType<T>, opts: CallOptions = {}): Promise<CrmResult<T>> {
  const secret = readSecret();
  if (!secret) {
    console.error('[crm] ITQAN_BOOKING_SECRET is missing or shorter than 32 characters; refusing to call the CRM');
    return fail('unauthorized', 0, 'no_secret');
  }
  const origin = crmOrigin();
  if (!origin) {
    console.error('[crm] CRM_API_ORIGIN is not a usable http(s) origin');
    return fail('server', 0, 'bad_origin');
  }

  const body = method === 'GET' ? '' : JSON.stringify(payload);
  const headers: Record<string, string> = {
    accept: 'application/json',
    [SIGNATURE_HEADER]: signatureHeader(secret, method, path, body),
  };
  if (method !== 'GET') headers['content-type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? CRM_TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}${path}`, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
      signal: controller.signal,
      cache: 'no-store',
      // A redirect would change the signed path and could hand the request to another host.
      redirect: 'error',
    });
    const result = interpret(res.status, await readCapped(res, MAX_RESPONSE_BYTES), schema);
    if (!result.ok && isCrmDown(result)) {
      console.error('[crm] call failed', { path: path.split('?')[0], status: res.status, error: result.error, detail: result.message });
    }
    return result;
  } catch (err) {
    console.error('[crm] no answer', { path: path.split('?')[0], reason: reasonOf(err) });
    return fail('server', 0, reasonOf(err));
  } finally {
    clearTimeout(timer);
  }
}

export function fetchSlots(withSlug?: string, opts?: CallOptions): Promise<CrmResult<SlotsData>> {
  const query = withSlug ? `?with=${encodeURIComponent(withSlug)}` : '';
  return call('GET', `${WEBSITE_API}/slots${query}`, undefined, slotsDataSchema, opts);
}

export function createCrmBooking(request: CreateBookingRequest, opts?: CallOptions): Promise<CrmResult<CreateBookingData>> {
  return call('POST', `${WEBSITE_API}/bookings`, request, createBookingDataSchema, opts);
}

export function cancelCrmBooking(token: string, opts?: CallOptions): Promise<CrmResult<CancelBookingData>> {
  return call('POST', `${WEBSITE_API}/bookings/cancel`, { token }, cancelBookingDataSchema, opts);
}
