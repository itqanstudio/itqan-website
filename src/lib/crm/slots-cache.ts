import type { CrmFailure, CrmResult } from './client';
import type { SlotsData } from './contract';
import { toWidgetSlots, type WidgetSlots } from './widget-slots';

/*
 * One short cache of the CRM's free times per host filter, shared by the first
 * paint of /book and the widget's GET /api/book/slots. Concurrent misses share
 * one CRM call, so visitors from any number of addresses cost at most one slot
 * computation per filter every SLOTS_TTL_MS. A booking or a cancellation made
 * through this site calls forgetSlots, so the next load sees the change at once;
 * a change made in the CRM shows within SLOTS_TTL_MS.
 */

export const SLOTS_TTL_MS = 20_000;
const MAX_KEYS = 50;

export type WidgetSlotsResult = { ok: true; data: WidgetSlots } | CrmFailure;

interface Entry {
  at: number;
  value: WidgetSlots;
}

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<WidgetSlotsResult>>();
/** Bumped by forgetSlots: a load that started before it never stores its answer. */
let generation = 0;

function keyOf(withSlug: string | undefined): string {
  return withSlug ?? '';
}

/** The cached times for this filter while still fresh, else null. Never calls the CRM. */
export function peekSlots(withSlug: string | undefined, now: number = Date.now()): WidgetSlots | null {
  const hit = cache.get(keyOf(withSlug));
  return hit && now - hit.at < SLOTS_TTL_MS ? hit.value : null;
}

/** Room for one more entry: the oldest goes, so a burst of odd filters can never flush the common ones. */
function makeRoom(): void {
  while (cache.size >= MAX_KEYS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) return;
    cache.delete(oldest);
  }
}

/**
 * Fresh cached times, or one shared call to `load` (only successes are cached).
 * `lane` keeps callers with different time limits (the page's 3 s, the widget's
 * 8 s) from sharing one call and inheriting the other's limit. A filter that
 * names no host (an unknown slug) is never cached, so made-up filters cost a
 * CRM call each but cannot push the real entries out.
 */
export function cachedSlots(
  withSlug: string | undefined,
  load: () => Promise<CrmResult<SlotsData>>,
  now: number = Date.now(),
  lane: string = 'widget',
): Promise<WidgetSlotsResult> {
  const key = keyOf(withSlug);
  const fresh = peekSlots(withSlug, now);
  if (fresh) return Promise.resolve({ ok: true, data: fresh });
  const flight = `${lane}|${key}`;
  const pending = inflight.get(flight);
  if (pending) return pending;

  const startedIn = generation;
  const run = load()
    .then((result): WidgetSlotsResult => {
      if (!result.ok) return result;
      const value = toWidgetSlots(result.data);
      const unknownFilter = key !== '' && value.hosts.length === 0;
      if (startedIn === generation && !unknownFilter) {
        cache.delete(key);
        makeRoom();
        cache.set(key, { at: now, value });
      }
      return { ok: true, data: value };
    })
    .finally(() => {
      if (inflight.get(flight) === run) inflight.delete(flight);
    });
  inflight.set(flight, run);
  return run;
}

/** After a booking or a cancellation: the next load asks the CRM again. */
export function forgetSlots(): void {
  generation += 1;
  cache.clear();
  inflight.clear();
}
