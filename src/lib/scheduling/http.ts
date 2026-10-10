import { createHmac } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { MIN_SECRET_LENGTH } from '@/lib/crm/contract';
import { readSecret } from '@/lib/crm/hmac';

const PROD_ORIGINS = ['https://itqanstudio.com', 'https://www.itqanstudio.com'];
const DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export interface ApiBody<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function json<T>(status: number, body: ApiBody<T>, headers?: Record<string, string>): NextResponse<ApiBody<T>> {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

/**
 * Trust only the LAST x-forwarded-for hop (single Traefik hop in production);
 * earlier entries are client supplied. Same rule as /api/contact.
 */
export function clientIp(req: NextRequest): string {
  return ipFromHeaders(req.headers);
}

/** The same rule for a server component, which has headers but no request. */
export function ipFromHeaders(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const last = forwarded.split(',').pop()?.trim();
    if (last) return last;
  }
  return headers.get('x-real-ip') ?? 'unknown';
}

/** Fail closed: only an explicit development run relaxes origins or prints mail. */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/** Origins allowed to send state-changing requests. Never derived from the Host header. */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (PROD_ORIGINS.includes(origin)) return true;
  return isDevelopment() && DEV_ORIGIN.test(origin);
}

/**
 * Fixed label at the start of the hashed text. A request signature made with the
 * same secret starts with a timestamp, so the two can never be equal.
 */
const IP_HASH_PURPOSE = 'itqan-booking-ip:';

/**
 * A key for counting bookings per connection without storing the address:
 * HMAC-SHA256 keyed by ITQAN_BOOKING_SECRET (64 hex characters). Without the
 * secret, hashing every IPv4 address does not recover it from the CRM or a
 * backup. The same address and secret always give the same key. Null when the
 * secret is missing or shorter than 32 characters, so the caller fails closed.
 */
export function ipKey(ip: string, secret: string | null = readSecret()): string | null {
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return createHmac('sha256', secret).update(`${IP_HASH_PURPOSE}${ip}`).digest('hex');
}

/**
 * Reads a request body, at most `maxBytes` bytes. The stream is counted as it
 * arrives, so a chunked upload with no Content-Length cannot make the server
 * buffer more than the cap.
 */
export async function readBody(req: NextRequest, maxBytes = 16_384): Promise<Uint8Array> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) throw new Error('too_large');
  if (!req.body) throw new Error('empty');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error('too_large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  chunks.reduce((offset, c) => {
    bytes.set(c, offset);
    return offset + c.byteLength;
  }, 0);
  return bytes;
}

/** Parses a JSON body read with the same cap as `readBody`. */
export async function readJson(req: NextRequest, maxBytes = 16_384): Promise<unknown> {
  return JSON.parse(new TextDecoder().decode(await readBody(req, maxBytes)));
}
