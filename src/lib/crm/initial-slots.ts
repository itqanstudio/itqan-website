import { rateLimit } from '@/lib/rate-limit';
import { fetchSlots } from './client';
import { cachedSlots, forgetSlots, peekSlots } from './slots-cache';
import type { WidgetSlots } from './widget-slots';

/*
 * Free times for the first paint of /book, so the heading can say "30-minute"
 * and the widget opens without a loading state. Bounded three ways so page
 * views cannot turn into a stream of CRM calls: a short timeout, the shared 20
 * second cache per host filter (slots-cache.ts, also behind /api/book/slots),
 * and a per-connection cap on misses. Any miss returns null and the widget
 * loads the times itself through the rate-limited /api/book/slots.
 */

export const PAGE_TIMEOUT_MS = 3_000;
const PER_IP_PER_MINUTE = 20;

/** Test hook: forget the shared slot cache. */
export function clearInitialSlotsCache(): void {
  forgetSlots();
}

export async function initialSlots(withSlug: string | undefined, ip: string, now: number = Date.now()): Promise<WidgetSlots | null> {
  const hit = peekSlots(withSlug, now);
  if (hit) return hit;
  if (!rateLimit(`book-page:${ip}`, PER_IP_PER_MINUTE, 60_000).allowed) return null;

  const result = await cachedSlots(withSlug, () => fetchSlots(withSlug, { timeoutMs: PAGE_TIMEOUT_MS }), now);
  return result.ok ? result.data : null;
}
