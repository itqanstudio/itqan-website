/**
 * One task at a time per key, in this process: a task starts only after every
 * earlier task with the same key has finished (resolved or failed); other keys
 * never wait. A failure goes to its own caller only. The map holds only keys
 * with work in flight, so it never grows past the requests running now. The
 * site is one long-lived Node process (same assumption as lib/rate-limit.ts).
 */
export interface KeyLock {
  run<T>(key: string, task: () => Promise<T>): Promise<T>;
  /** Test hook: how many keys have work in flight. */
  size(): number;
}

const ignore = (): void => undefined;

export function createKeyLock(): KeyLock {
  /** Per key, the end of the last task queued: it settles when that task does and never rejects. */
  const tails = new Map<string, Promise<void>>();
  return {
    run<T>(key: string, task: () => Promise<T>): Promise<T> {
      const prior = tails.get(key) ?? Promise.resolve();
      const result = prior.then(task);
      const tail = result.then(ignore, ignore);
      tails.set(key, tail);
      void tail.then(() => {
        if (tails.get(key) === tail) tails.delete(key);
      });
      return result;
    },
    size: () => tails.size,
  };
}
