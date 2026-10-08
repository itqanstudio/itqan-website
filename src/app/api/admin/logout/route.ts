import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { endSession } from '@/lib/scheduling/repo';
import { SESSION_COOKIE } from '@/lib/scheduling/config';
import { isAllowedOrigin, json } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) endSession(token);
  const res = json(200, { ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
