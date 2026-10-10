import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { clientIp, ipKey, isAllowedOrigin, json, readBody, readJson } from './http';

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
    expect(ipKey('203.0.113.9')).toBe(ipKey('203.0.113.9'));
    expect(ipKey('203.0.113.9')).not.toContain('203');
    expect(ipKey('203.0.113.9')).not.toBe(ipKey('203.0.113.10'));
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
