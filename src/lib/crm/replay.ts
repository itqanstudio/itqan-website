import { SIGNATURE_MAX_SKEW_SECONDS } from './contract';

/*
 * A signed request stays valid for 300 seconds either side of its timestamp, so
 * a captured one could be sent again inside that window. Each signature is
 * accepted once; this process-local memory is enough because production runs a
 * single long-lived container (same assumption as lib/rate-limit.ts).
 */

const WINDOW_MS = 2 * SIGNATURE_MAX_SKEW_SECONDS * 1000;
const MAX_KEYS = 10_000;
const seen = new Map<string, number>();

function sweep(now: number): void {
  Array.from(seen.entries())
    .filter(([, expires]) => expires <= now)
    .forEach(([key]) => seen.delete(key));
}

/** True the first time a signature is presented inside its window, false after. */
export function firstUse(v1: string, now: number = Date.now()): boolean {
  if (seen.size >= MAX_KEYS) sweep(now);
  const expires = seen.get(v1);
  if (expires !== undefined && expires > now) return false;
  seen.set(v1, now + WINDOW_MS);
  return true;
}

export function clearReplayMemory(): void {
  seen.clear();
}
