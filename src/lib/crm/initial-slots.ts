import { rateLimit } from '@/lib/rate-limit';
import { fetchSlots } from './client';
import { toWidgetSlots, type WidgetSlots } from './widget-slots';

/*
 * Free times for the first paint of /book, so the heading can say "30-minute"
 * and the widget opens without a loading state. Bounded three ways so page
 * views cannot turn into a stream of CRM calls: a short timeout, a 20 second
 * cache per host filter, and a per-connection cap. Any miss returns null and
 * the widget loads the times itself through the rate-limited /api/book/slots.
 */

export const PAGE_TIMEOUT_MS = 3_000;
const TTL_MS = 20_000;
const MAX_KEYS = 50;
const PER_IP_PER_MINUTE = 20;

interface Entry {
  at: number;
  value: WidgetSlots;
}

const cache = new Map<string, Entry>();

export function clearInitialSlotsCache(): void {
  cache.clear();
}

export async function initialSlots(withSlug: string | undefined, ip: string, now: number = Date.now()): Promise<WidgetSlots | null> {
  const key = withSlug ?? '';
  const hit = cache.get(key);
  if (hit && now - hit.at < TTL_MS) return hit.value;
  if (!rateLimit(`book-page:${ip}`, PER_IP_PER_MINUTE, 60_000).allowed) return null;

  const result = await fetchSlots(withSlug, { timeoutMs: PAGE_TIMEOUT_MS });
  if (!result.ok) return null;
  const value = toWidgetSlots(result.data);
  if (cache.size >= MAX_KEYS) cache.clear();
  cache.set(key, { at: now, value });
  return value;
}
