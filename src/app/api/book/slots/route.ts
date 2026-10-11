import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { fetchSlots, isCrmDown } from '@/lib/crm/client';
import { cachedSlots } from '@/lib/crm/slots-cache';
import { parseHostSlug } from '@/lib/crm/slug';
import type { WidgetSlots } from '@/lib/crm/widget-slots';
import { clientIp, json } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/book/slots[?with=<slug>]: every free start time from the CRM, as UTC
 * ISO strings, plus the call length, the studio time zone and the hosts.
 * Served from the shared 20 second cache (slots-cache.ts), so many visitors
 * cost one CRM call per host filter. CRM down or misconfigured: 503 "paused",
 * which the widget turns into the "Booking is paused" message.
 */
export async function GET(req: NextRequest) {
  const limit = rateLimit(`slots:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return json(429, { ok: false, error: 'Too many requests' }, { 'Retry-After': String(limit.retryAfterSeconds) });
  }

  const raw = req.nextUrl.searchParams.get('with');
  const withSlug = parseHostSlug(raw);
  if (raw && !withSlug) return json(400, { ok: false, error: 'invalid' });

  const result = await cachedSlots(withSlug, () => fetchSlots(withSlug));
  if (result.ok) return json<WidgetSlots>(200, { ok: true, data: result.data });
  if (!isCrmDown(result) && (result.error === 'invalid' || result.error === 'not_found')) {
    return json(400, { ok: false, error: 'invalid' });
  }
  return json(503, { ok: false, error: 'paused' });
}
