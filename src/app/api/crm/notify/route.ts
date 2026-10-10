import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { SIGNATURE_HEADER, type NotifyData } from '@/lib/crm/contract';
import { readSecret, verifySignature } from '@/lib/crm/hmac';
import { firstUse } from '@/lib/crm/replay';
import { notifyRequestSchema } from '@/lib/crm/schemas';
import { sendGuestCancellation } from '@/lib/scheduling/mail';
import { clientIp, json, readBody } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/crm/notify: the CRM tells the site that a host cancelled a booking,
 * and the site emails the guest (when asked to). Server to server only: no
 * cookie, no Origin, a valid `x-itqan-signature` over the exact body. Without
 * ITQAN_BOOKING_SECRET every request is refused.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`crm-notify:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) return json(429, { ok: false, error: 'limit' }, { 'Retry-After': String(limit.retryAfterSeconds) });

  const secret = readSecret();
  if (!secret) {
    console.error('[crm/notify] ITQAN_BOOKING_SECRET is missing or shorter than 32 characters; refusing');
    return json(401, { ok: false, error: 'unauthorized' });
  }

  let body: Uint8Array;
  try {
    body = await readBody(req);
  } catch (err) {
    const tooLarge = err instanceof Error && err.message === 'too_large';
    return json(tooLarge ? 413 : 400, { ok: false, error: 'invalid' });
  }

  const check = verifySignature({
    secret,
    header: req.headers.get(SIGNATURE_HEADER),
    method: req.method,
    pathWithQuery: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    body,
  });
  if (!check.ok) {
    console.warn('[crm/notify] signature refused:', check.reason);
    return json(401, { ok: false, error: 'unauthorized' });
  }
  if (!firstUse(check.v1)) {
    console.warn('[crm/notify] replayed signature refused');
    return json(401, { ok: false, error: 'unauthorized' });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }
  const parsed = notifyRequestSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: 'invalid' });

  const { booking, notifyGuest } = parsed.data;
  if (!notifyGuest) return json<NotifyData>(200, { ok: true, data: { emailed: false } });

  const sent = await sendGuestCancellation(booking, 'host');
  if (!sent.sent) console.error('[crm/notify] guest cancellation not sent for booking', booking.id);
  return json<NotifyData>(200, { ok: true, data: { emailed: sent.sent } });
}
