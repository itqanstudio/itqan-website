import type { z } from 'zod';
import {
  NOT_BOOKED,
  SIGNATURE_HEADER,
  type CancelBookingData,
  type CancelBookingRequest,
  type CreateBookingData,
  type CreateBookingRequest,
  type GuestNoticeSentData,
  type IntegrationErrorCode,
  type IntegrationResult,
  type SlotsData,
} from './contract';
import { readSecret, signatureHeader } from './hmac';
import { cancelBookingDataSchema, createBookingDataSchema, guestNoticeSentDataSchema, slotsDataSchema } from './schemas';

/*
 * Signed server-to-server calls to the CRM (REBUILD-SPEC section 8). Every call
 * resolves to a typed result; nothing here throws into a route handler.
 */

export const DEFAULT_CRM_ORIGIN = 'https://portal.itqanstudio.com';
/** Slots and cancel. */
export const CRM_TIMEOUT_MS = 8_000;
/**
 * POST bookings checks the hosts' Google calendars and then books, and the
 * booking still commits if this site stops waiting. The budget stays well above
 * the CRM's worst case, so a slow Google answer reaches the CRM's rules-only
 * fallback (spec D8) instead of an abort here.
 */
export const CRM_BOOKING_TIMEOUT_MS = 15_000;
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

/** No answer because the connection never opened: nothing reached the CRM. */
const NOT_SENT = 'unreachable';
/** Connection errors (on the fetch error's cause) that happen before a request is sent. */
const CONNECT_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH', 'EHOSTUNREACH', 'UND_ERR_CONNECT_TIMEOUT']);

/**
 * True when the request may have reached the CRM but this site cannot tell
 * whether it acted: no answer before the timeout, a connection that dropped
 * after the request went out, a success status with a body that could not be
 * read, or a server error (the CRM can fail after its database committed the
 * booking, and a gateway can time out after passing the request on). For a
 * booking that means it may exist, so the visitor is told to check before
 * trying again instead of "paused". Only a connection that never opened proves
 * nothing was sent. Check this before isCrmDown, which is also true for these.
 */
export function isOutcomeUnknown(f: CrmFailure): boolean {
  if (f.message === 'timeout') return true;
  if (f.error !== 'server') return false;
  // The CRM says the booking certainly did not happen (its database refused it): "paused" is the truth.
  if (f.status === 503 && f.message === NOT_BOOKED) return false;
  if ((f.status >= 200 && f.status < 300) || f.status >= 500) return true;
  return f.status === 0 && f.message !== NOT_SENT && f.message !== 'bad_origin';
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
 * Hosts where plain http never leaves the machine: localhost, ::1 or a whole
 * 127.x.x.x literal. Anything else, a private address or a Docker service name
 * included, is a network the booking details would cross unencrypted, so it
 * needs https. IP literals are compared whole; a dotted name is a DNS name.
 */
export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host === '::1') return true;
  return ipv4Octets(host)?.[0] === 127;
}

/** CRM_API_ORIGIN (https, or http on loopback) or the production portal; null when the setting is unusable. */
export function crmOrigin(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.CRM_API_ORIGIN?.trim();
  if (!raw) return DEFAULT_CRM_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return null;
    if (url.protocol === 'https:') return url.origin;
    return url.protocol === 'http:' && isLoopbackHost(url.hostname) ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * What the server says at startup when CRM_API_ORIGIN is set but refused
 * (instrumentation.ts), or null when it is unset or usable. A refused origin
 * pauses every booking and cancel, so this is caught at deploy, not by guests.
 * The value itself is never printed: a refused one may carry a password.
 */
export function crmOriginProblem(env: Record<string, string | undefined> = process.env): string | null {
  if (!env.CRM_API_ORIGIN?.trim() || crmOrigin(env)) return null;
  return (
    'CRM_API_ORIGIN is set but refused: it must be an https origin, or plain http only on localhost, ::1 or 127.x.x.x, ' +
    'with no user name or password. Until it is fixed, every booking and cancel on the site answers "paused".'
  );
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

/** Checks an answer's data and gives the contract's type (the input may differ, e.g. a field an older CRM leaves out). */
type AnswerSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

/** Maps a CRM answer to a result: the envelope is `{ ok, data?, error?, message? }`. */
export function interpret<T>(status: number, bodyText: string, schema: AnswerSchema<T>): CrmResult<T> {
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

/** The error code on a fetch failure's cause (undici puts it there, sometimes inside an AggregateError). */
function causeCode(err: Error): string | undefined {
  const cause: unknown = err.cause;
  if (!cause || typeof cause !== 'object') return undefined;
  const code = (cause as { code?: unknown }).code;
  if (typeof code === 'string') return code;
  const first = (cause as { errors?: unknown }).errors;
  const inner: unknown = Array.isArray(first) ? first[0] : undefined;
  const innerCode = inner && typeof inner === 'object' ? (inner as { code?: unknown }).code : undefined;
  return typeof innerCode === 'string' ? innerCode : undefined;
}

function reasonOf(err: unknown): string {
  if (!(err instanceof Error)) return 'unknown';
  if (err.name === 'AbortError') return 'timeout';
  const code = causeCode(err);
  return code && CONNECT_CODES.has(code) ? NOT_SENT : err.message.slice(0, 200);
}

async function call<T>(method: 'GET' | 'POST', path: string, payload: unknown, schema: AnswerSchema<T>, opts: CallOptions = {}): Promise<CrmResult<T>> {
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
  // The status once the CRM answered, so a body that breaks off after a 2xx stays "may have acted".
  let status = 0;
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
    status = res.status;
    const result = interpret(res.status, await readCapped(res, MAX_RESPONSE_BYTES), schema);
    if (!result.ok && isCrmDown(result)) {
      console.error('[crm] call failed', { path: path.split('?')[0], status: res.status, error: result.error, detail: result.message });
    }
    return result;
  } catch (err) {
    console.error('[crm] no answer', { path: path.split('?')[0], status, reason: reasonOf(err) });
    return fail('server', status, reasonOf(err));
  } finally {
    clearTimeout(timer);
  }
}

export function fetchSlots(withSlug?: string, opts?: CallOptions): Promise<CrmResult<SlotsData>> {
  const query = withSlug ? `?with=${encodeURIComponent(withSlug)}` : '';
  return call('GET', `${WEBSITE_API}/slots${query}`, undefined, slotsDataSchema, opts);
}

export function createCrmBooking(request: CreateBookingRequest, opts?: CallOptions): Promise<CrmResult<CreateBookingData>> {
  return call('POST', `${WEBSITE_API}/bookings`, request, createBookingDataSchema, { timeoutMs: opts?.timeoutMs ?? CRM_BOOKING_TIMEOUT_MS });
}

/** The guest's reason goes only when they gave one (the CRM wants 1 to 500 characters or nothing). */
export function cancelCrmBooking(token: string, reason?: string, opts?: CallOptions): Promise<CrmResult<CancelBookingData>> {
  const request: CancelBookingRequest = reason ? { token, reason } : { token };
  return call('POST', `${WEBSITE_API}/bookings/cancel`, request, cancelBookingDataSchema, opts);
}

/** After a guest cancel's emails went out: the CRM stops reporting them as owed. */
export function recordCancelNotice(token: string, opts?: CallOptions): Promise<CrmResult<GuestNoticeSentData>> {
  return call('POST', `${WEBSITE_API}/bookings/notice-sent`, { token }, guestNoticeSentDataSchema, opts);
}
