import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { cancelBooking } from '@/lib/scheduling/repo';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { sendCancellation } from '@/lib/scheduling/mail';
import { clientIp, isAllowedOrigin, json, readJson } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/book/cancel: the guest cancels with the secret link from their email. */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { ok: false, error: 'Bad origin' });
  const limit = rateLimit(`cancel:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return json(429, { ok: false, error: 'rate' }, { 'Retry-After': String(limit.retryAfterSeconds) });

  let raw: unknown;
  try {
    raw = await readJson(req, 1024);
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }
  const parsed = cancelRequestSchema.safeParse(raw);
  if (!parsed.success) return json(404, { ok: false, error: 'not_found' });

  try {
    const result = cancelBooking('guest', { token: parsed.data.token });
    if (!result.ok) return json(result.reason === 'past' ? 409 : 404, { ok: false, error: result.reason });
    if (result.changed) await sendCancellation(result.booking, 'guest');
    return json(200, { ok: true, data: { changed: result.changed } });
  } catch (err) {
    console.error('[book/cancel] failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'server' });
  }
}
