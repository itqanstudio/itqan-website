import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './config';
import { sessionEmail } from './repo';

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
 * earlier entries are client supplied. Same rule as /api/feedback.
 */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const last = forwarded.split(',').pop()?.trim();
    if (last) return last;
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
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

/** The origin to put in emailed links: pinned, except for localhost during development. */
export function linkOrigin(req: NextRequest): string {
  const origin = req.nextUrl.origin;
  return isDevelopment() && DEV_ORIGIN.test(origin) ? origin : PROD_ORIGINS[0];
}

/** A one-way key for counting bookings per connection without storing the address. */
export function ipKey(ip: string): string {
  return createHash('sha256').update(`itqan-booking:${ip}`).digest('hex');
}

/**
 * Parses a JSON body, reading at most `maxBytes` bytes. The stream is counted as
 * it arrives, so a chunked upload with no Content-Length cannot make the server
 * buffer more than the cap.
 */
export async function readJson(req: NextRequest, maxBytes = 16_384): Promise<unknown> {
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
  let offset = 0;
  chunks.forEach((c) => {
    bytes.set(c, offset);
    offset += c.byteLength;
  });
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Admin emails come from ADMIN_EMAILS (comma separated); the studio inbox by default. */
export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || 'ibrahim@itqanstudio.com';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function currentAdmin(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const email = sessionEmail(token);
  return email && adminEmails().includes(email) ? email : null;
}

/** Guard for admin API routes: a live session and a same-site origin on writes. */
export function requireAdmin(req: NextRequest): { email: string } | NextResponse {
  if (req.method !== 'GET' && !isAllowedOrigin(req.headers.get('origin'))) {
    return json(403, { ok: false, error: 'Bad origin' });
  }
  const email = currentAdmin();
  if (!email) return json(401, { ok: false, error: 'Sign in again' });
  return { email };
}
