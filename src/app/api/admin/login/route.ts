import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLoginToken } from '@/lib/scheduling/repo';
import { loginRequestSchema } from '@/lib/scheduling/validation';
import { sendLoginLink } from '@/lib/scheduling/mail';
import { adminEmails, clientIp, isAllowedOrigin, json, linkOrigin, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** At most one link per address per minute: a throttle, never a lockout of the real admin. */
const EMAIL_GAP_MS = 60_000;

/**
 * POST /api/admin/login: email a one-time sign-in link to an allowed address.
 * The response is the same, and returns as fast, whether or not the address is
 * allowed, so the endpoint does not reveal who the admins are. The link's origin
 * is pinned, never taken from the Host header. A new link replaces older unused
 * ones. Break-glass if mail is down: `node scripts/admin-login-link.mjs` on the host.
 */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const ip = clientIp(req);
  const byIp = rateLimit(`login:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!byIp.allowed) return json(429, { ok: false, error: 'Too many attempts. Wait 15 minutes.' });

  let raw: unknown;
  try {
    raw = await readJson(req, 1024);
  } catch {
    return json(400, { ok: false, error: 'Enter an email address' });
  }
  const parsed = loginRequestSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: 'Enter an email address' });
  const { email } = parsed.data;

  if (!adminEmails().includes(email)) {
    console.warn('[admin/login] sign-in requested for an address that is not an admin');
  } else if (rateLimit(`login:email:${email}`, 1, EMAIL_GAP_MS).allowed) {
    const origin = linkOrigin(req);
    // Not awaited: an admin address must not answer slower than any other address.
    void (async () => {
      try {
        const token = createLoginToken(email);
        const result = await sendLoginLink(email, `${origin}/admin/verify?token=${token}`);
        if (!result.sent) console.error('[admin/login] link not sent');
      } catch (err) {
        console.error('[admin/login] failed:', err instanceof Error ? err.message : String(err));
      }
    })();
  }
  return json(200, { ok: true });
}
