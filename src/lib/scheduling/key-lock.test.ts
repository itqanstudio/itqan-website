import { describe, expect, it } from 'vitest';
import { createKeyLock } from './key-lock';

/** A task the test finishes by hand, recording when it starts. */
function gate(log: string[], name: string) {
  let open: () => void = () => undefined;
  let fail: (err: Error) => void = () => undefined;
  const done = new Promise<string>((resolve, reject) => {
    open = () => resolve(name);
    fail = reject;
  });
  return {
    task: () => {
      log.push(`start ${name}`);
      return done;
    },
    open,
    fail: (message: string) => fail(new Error(message)),
  };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createKeyLock', () => {
  it('runs tasks with the same key one at a time, in order', async () => {
    const lock = createKeyLock();
    const log: string[] = [];
    const a = gate(log, 'a');
    const b = gate(log, 'b');
    const first = lock.run('token-1', a.task);
    const second = lock.run('token-1', b.task);
    await settle();
    expect(log).toEqual(['start a']);
    a.open();
    expect(await first).toBe('a');
    await settle();
    expect(log).toEqual(['start a', 'start b']);
    b.open();
    expect(await second).toBe('b');
  });

  it('never makes another key wait', async () => {
    const lock = createKeyLock();
    const log: string[] = [];
    const a = gate(log, 'a');
    const b = gate(log, 'b');
    void lock.run('token-1', a.task);
    const other = lock.run('token-2', b.task);
    await settle();
    expect(log).toEqual(['start a', 'start b']);
    b.open();
    expect(await other).toBe('b');
    a.open();
  });

  it('lets the next task run after one that failed, and passes the failure to its own caller only', async () => {
    const lock = createKeyLock();
    const log: string[] = [];
    const a = gate(log, 'a');
    const b = gate(log, 'b');
    const first = lock.run('token-1', a.task);
    const second = lock.run('token-1', b.task);
    a.fail('boom');
    await expect(first).rejects.toThrow('boom');
    b.open();
    expect(await second).toBe('b');
    const thrown = lock.run('token-1', () => {
      throw new Error('sync');
    });
    await expect(thrown).rejects.toThrow('sync');
  });

  it('holds only keys with work in flight', async () => {
    const lock = createKeyLock();
    const log: string[] = [];
    const a = gate(log, 'a');
    const running = lock.run('token-1', a.task);
    expect(lock.size()).toBe(1);
    a.open();
    await running;
    await settle();
    expect(lock.size()).toBe(0);
  });
});
