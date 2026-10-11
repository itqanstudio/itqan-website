/*
 * What this process remembers about the founders' calendar emails (W5): every
 * REQUEST and CANCEL that went, by "<booking id>|<method>|<address>", for 24
 * hours, so a retried cancel does not email a founder again. A send still
 * going is kept apart and never dropped to make room (review r2): dropping it
 * would let a retry send the same email while the first is still on its way.
 * Only sends that went are bounded, the oldest dropped first. The site is one
 * long-lived Node process (same assumption as lib/rate-limit.ts).
 */

/** How long a founder's sent REQUEST or CANCEL is remembered. */
export const SENT_MEMORY_MS = 24 * 60 * 60 * 1000;
/** The most sends remembered as gone: two founders, two methods, so about 500 bookings a day. */
export const FOUNDER_MEMORY_MAX = 2_000;

/** Sends still going: key -> when the claim was taken. Freed only when the send ends. */
const going = new Map<string, number>();
/** Sends that went: key -> when the claim was taken. Bounded, oldest first. */
const went = new Map<string, number>();
/** Bookings this process has started cancelling: id -> when. Bounded, oldest first. */
const cancelled = new Map<string, number>();

function isFresh(at: number | undefined, now: number): boolean {
  return at !== undefined && now - at < SENT_MEMORY_MS;
}

/** Adds an entry to a bounded map, dropping the oldest entries to stay under the cap. */
function remember(map: Map<string, number>, key: string, at: number): void {
  map.delete(key);
  while (map.size >= FOUNDER_MEMORY_MAX) {
    const oldest = map.keys().next();
    if (oldest.done) break;
    map.delete(oldest.value);
  }
  map.set(key, at);
}

/**
 * Takes a send for this process: false when it is still going, or went within
 * the last 24 hours. Taken before sending, so two calls at once send it once.
 */
export function claimSend(key: string, now: number): boolean {
  if (going.has(key) || isFresh(went.get(key), now)) return false;
  went.delete(key);
  going.set(key, now);
  return true;
}

/**
 * Ends a claim (only while it is still this claim): a send that went is
 * remembered for 24 hours, one that did not is forgotten so a retry sends it.
 */
export function settleSend(key: string, at: number, sent: boolean): void {
  if (going.get(key) !== at) return;
  going.delete(key);
  if (sent) remember(went, key, at);
}

/**
 * Notes that a cancel for this booking has started (review r2). A booking id
 * never comes back once cancelled, and its invite goes right after it is
 * booked, so 24 hours covers any invite that could still arrive late.
 */
export function markCancelled(bookingId: string, now: number): void {
  remember(cancelled, bookingId, now);
}

/** True when this process started cancelling the booking within the last 24 hours. */
export function isCancelled(bookingId: string, now: number): boolean {
  return isFresh(cancelled.get(bookingId), now);
}

/** Test hook: forget everything. */
export function clearSendMemory(): void {
  going.clear();
  went.clear();
  cancelled.clear();
}

/** Test hook: how many sends are remembered, going or gone. */
export function sendMemorySize(): number {
  return going.size + went.size;
}
