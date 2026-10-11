import { SIGNATURE_MAX_SKEW_SECONDS } from './contract';

/*
 * A signed request stays valid for 300 seconds either side of its timestamp, so
 * a captured one could be sent again inside that window. Each signature is
 * accepted once; this process-local memory is enough because production runs a
 * single long-lived container (same assumption as lib/rate-limit.ts).
 *
 * A signature is remembered until its own window has closed: verification
 * compares whole seconds and accepts a skew of exactly 300, so a signature
 * stamped t is still accepted anywhere inside second t + 300, that is until
 * (t + 301) * 1000 ms. Remembering it from first use instead could forget it
 * one second early.
 */

const MAX_KEYS = 10_000;
const seen = new Map<string, number>();

/** The first instant (ms) at which a signature stamped `t` (seconds) can no longer verify. */
export function signatureExpiry(t: number): number {
  return (t + SIGNATURE_MAX_SKEW_SECONDS + 1) * 1000;
}

function sweep(now: number): void {
  Array.from(seen.entries())
    .filter(([, expires]) => expires <= now)
    .forEach(([key]) => seen.delete(key));
}

/** Keeps the map at its cap: expired entries first, then the oldest remembered ones. */
function makeRoom(now: number): void {
  if (seen.size < MAX_KEYS) return;
  sweep(now);
  const excess = seen.size - MAX_KEYS + 1;
  if (excess > 0) Array.from(seen.keys()).slice(0, excess).forEach((key) => seen.delete(key));
}

/**
 * True the first time a signature is presented inside its window, false after.
 * `t` is the verified timestamp from the signature header, in seconds.
 */
export function firstUse(v1: string, t: number, now: number = Date.now()): boolean {
  const expires = seen.get(v1);
  if (expires !== undefined && expires > now) return false;
  makeRoom(now);
  seen.set(v1, signatureExpiry(t));
  return true;
}

export function clearReplayMemory(): void {
  seen.clear();
}

/** Test hook: how many signatures are remembered. */
export function replayMemorySize(): number {
  return seen.size;
}
