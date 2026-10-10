import { createHash, createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { clientIp, ipKey, isAllowedOrigin, json, readBody, readJson } from './http';

const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';

function req(url: string, init: { method?: string; headers?: Record<string, string>; body?: BodyInit } = {}): NextRequest {
  // `duplex` is required by Node for streamed bodies but missing from Next's RequestInit type.
  const options = { method: init.method ?? 'POST', headers: init.headers, body: init.body, duplex: 'half' };
  return new NextRequest(url, options as ConstructorParameters<typeof NextRequest>[1]);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('origin rules', () => {
  it('allows the production origins only, outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isAllowedOrigin('https://itqanstudio.com')).toBe(true);
    expect(isAllowedOrigin('https://www.itqanstudio.com')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3001')).toBe(false);
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });
  it('allows localhost only in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAllowedOrigin('http://localhost:3001')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:3000')).toBe(true);
    expect(isAllowedOrigin('http://localhost.evil.example')).toBe(false);
  });
});

describe('client identity', () => {
  it('trusts only the last forwarded hop', () => {
    expect(clientIp(req('http://x/', { headers: { 'x-forwarded-for': '6.6.6.6, 10.0.0.1, 203.0.113.9' } }))).toBe('203.0.113.9');
    expect(clientIp(req('http://x/', { headers: { 'x-real-ip': '198.51.100.2' } }))).toBe('198.51.100.2');
    expect(clientIp(req('http://x/'))).toBe('unknown');
  });
  it('hashes addresses one way and stably', () => {
    expect(ipKey('203.0.113.9', SECRET)).toBe(ipKey('203.0.113.9', SECRET));
    expect(ipKey('203.0.113.9', SECRET)).not.toContain('203');
    expect(ipKey('203.0.113.9', SECRET)).not.toBe(ipKey('203.0.113.10', SECRET));
  });
  it('keys the hash with the shared secret, so nobody can rebuild it by hashing every IPv4 address (SW-4)', () => {
    const key = ipKey('203.0.113.9', SECRET);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).toBe(createHmac('sha256', SECRET).update('itqan-booking-ip:203.0.113.9').digest('hex'));
    // The old unkeyed form anyone could recompute from the public prefix.
    expect(key).not.toBe(createHash('sha256').update('itqan-booking:203.0.113.9').digest('hex'));
    expect(key).not.toBe(ipKey('203.0.113.9', `${SECRET}-other`));
  });
  it('reads the secret from the environment and gives no key without a usable one', () => {
    vi.stubEnv('ITQAN_BOOKING_SECRET', SECRET);
    expect(ipKey('203.0.113.9')).toBe(ipKey('203.0.113.9', SECRET));
    vi.stubEnv('ITQAN_BOOKING_SECRET', 'short');
    expect(ipKey('203.0.113.9')).toBeNull();
    expect(ipKey('203.0.113.9', 'short')).toBeNull();
    expect(ipKey('203.0.113.9', null)).toBeNull();
  });
});

describe('readJson', () => {
  it('parses a small body', async () => {
    expect(await readJson(req('http://x/', { body: '{"a":1}' }))).toEqual({ a: 1 });
  });
  it('returns the raw bytes unchanged, for signature checks', async () => {
    const bytes = await readBody(req('http://x/', { body: '{"n":"إتقان"}' }));
    expect(new TextDecoder().decode(bytes)).toBe('{"n":"إتقان"}');
  });
  it('rejects a declared length over the cap', async () => {
    await expect(readJson(req('http://x/', { body: '{}', headers: { 'content-length': '999999' } }), 100)).rejects.toThrow('too_large');
  });
  it('stops reading a streamed body once it passes the cap', async () => {
    const big = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 50; i += 1) controller.enqueue(new Uint8Array(1024));
        controller.close();
      },
    });
    await expect(readJson(req('http://x/', { body: big }), 4096)).rejects.toThrow('too_large');
  });
  it('counts bytes, not characters', async () => {
    const arabic = JSON.stringify({ n: 'إتقان'.repeat(10) });
    await expect(readJson(req('http://x/', { body: arabic }), arabic.length + 5)).rejects.toThrow('too_large');
  });
  it('rejects invalid JSON and an empty body', async () => {
    await expect(readJson(req('http://x/', { body: '{nope' }))).rejects.toThrow();
    await expect(readJson(req('http://x/', { method: 'GET' }))).rejects.toThrow('empty');
  });
});

describe('json', () => {
  it('never lets a response be cached', async () => {
    const res = json(200, { ok: true });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ ok: true });
  });
});
