import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { availableSlots } from '@/lib/scheduling/repo';
import { clientIp, json } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/book/slots: every free start time, as UTC ISO strings. */
export async function GET(req: NextRequest) {
  const limit = rateLimit(`slots:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return json(429, { ok: false, error: 'Too many requests' }, { 'Retry-After': String(limit.retryAfterSeconds) });
  }
  try {
    return json(200, { ok: true, data: availableSlots() });
  } catch (err) {
    console.error('[book/slots] failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'Could not load free times' });
  }
}
