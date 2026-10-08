import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { redeemLoginToken } from '@/lib/scheduling/repo';
import { sessionRequestSchema } from '@/lib/scheduling/validation';
import { SESSION_COOKIE, SESSION_DAYS } from '@/lib/scheduling/config';
import { adminEmails, clientIp, isAllowedOrigin, json, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/session: trade a sign-in link token for a session cookie.
 * A POST (from a button on /admin/verify), not the GET of the emailed link, so
 * mail scanners that prefetch links cannot spend the one-time token.
 */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const limit = rateLimit(`session:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return json(429, { ok: false, error: 'Too many attempts. Wait 15 minutes.' });

  let raw: unknown;
  try {
    raw = await readJson(req, 1024);
  } catch {
    return json(400, { ok: false, error: 'This link is not valid' });
  }
  const parsed = sessionRequestSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: 'This link is not valid' });

  const session = redeemLoginToken(parsed.data.token);
  if (!session || !adminEmails().includes(session.email)) {
    return json(400, { ok: false, error: 'This link has expired or was already used. Ask for a new one.' });
  }
  const res = json(200, { ok: true });
  res.cookies.set(SESSION_COOKIE, session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
