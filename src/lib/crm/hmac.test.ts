import { describe, expect, it } from 'vitest';
import {
  EMPTY_BODY_SHA256,
  computeV1,
  parseSignatureHeader,
  readSecret,
  sha256Hex,
  signatureHeader,
  signingBase,
  verifySignature,
} from './hmac';

// The two vectors from REBUILD-SPEC section 8. The CRM repo tests the same numbers.
const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
const T = 1760000000;

describe('spec test vectors', () => {
  it('vector 1: POST bookings with {"a":1}', () => {
    expect(sha256Hex('{"a":1}')).toBe('015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862');
    expect(computeV1(SECRET, T, 'POST', '/api/integrations/website/bookings', '{"a":1}')).toBe(
      '372a868e7c6fe1f8643c071d5152f445378cc75f57bf42a4facde5bcb922244f',
    );
  });

  it('vector 2: GET slots?with=bisma with an empty body', () => {
    expect(sha256Hex('')).toBe(EMPTY_BODY_SHA256);
    expect(computeV1(SECRET, T, 'GET', '/api/integrations/website/slots?with=bisma', '')).toBe(
      '2439929c2af4c1e822da837842d3aa7d37713a1dae63bd6ee160cf2e27a5f4b1',
    );
  });

  it('hashes bytes and strings the same way', () => {
    expect(sha256Hex(new TextEncoder().encode('{"a":1}'))).toBe(sha256Hex('{"a":1}'));
  });
});

describe('signing', () => {
  it('builds the base string with an upper-case method', () => {
    expect(signingBase(T, 'get', '/x?y=1', 'abc')).toBe('1760000000.GET./x?y=1.abc');
  });

  it('writes the header as t=<seconds>,v1=<hex>', () => {
    const header = signatureHeader(SECRET, 'POST', '/api/integrations/website/bookings', '{"a":1}', T);
    expect(header).toBe('t=1760000000,v1=372a868e7c6fe1f8643c071d5152f445378cc75f57bf42a4facde5bcb922244f');
  });

  it('refuses to sign with a short secret', () => {
    expect(() => signatureHeader('short', 'GET', '/', '', T)).toThrow('secret_too_short');
    expect(() => computeV1('x'.repeat(31), T, 'GET', '/', '')).toThrow('secret_too_short');
  });
});

describe('readSecret', () => {
  it('fails closed without a secret of at least 32 characters', () => {
    expect(readSecret({})).toBeNull();
    expect(readSecret({ ITQAN_BOOKING_SECRET: '' })).toBeNull();
    expect(readSecret({ ITQAN_BOOKING_SECRET: 'x'.repeat(31) })).toBeNull();
    expect(readSecret({ ITQAN_BOOKING_SECRET: 'x'.repeat(32) })).toBe('x'.repeat(32));
  });
});

describe('parseSignatureHeader', () => {
  const v1 = 'a'.repeat(64);
  it('accepts the exact format, with spaces after the comma and upper-case hex', () => {
    expect(parseSignatureHeader(`t=${T},v1=${v1}`)).toEqual({ t: T, v1 });
    expect(parseSignatureHeader(`t=${T}, v1=${'A'.repeat(64)}`)).toEqual({ t: T, v1 });
    expect(parseSignatureHeader(`v1=${v1},t=${T}`)).toEqual({ t: T, v1 });
  });

  it('rejects anything else', () => {
    [
      null,
      undefined,
      '',
      `t=${T}`,
      `v1=${v1}`,
      `t=${T},v1=${v1},x=1`,
      `t=${T},t=${T}`,
      `t=-1,v1=${v1}`,
      `t=1.5,v1=${v1}`,
      `t=${T},v1=${'g'.repeat(64)}`,
      `t=${T},v1=${'a'.repeat(63)}`,
      `t=${T},=${v1}`,
      `t=${T},v1=${v1}${' '.repeat(200)}`,
    ].forEach((h) => expect(parseSignatureHeader(h)).toBeNull());
  });
});

describe('verifySignature', () => {
  const path = '/api/crm/notify';
  const body = '{"type":"booking.cancelled"}';
  const header = signatureHeader(SECRET, 'POST', path, body, T);
  const base = { secret: SECRET, header, method: 'POST', pathWithQuery: path, body, now: T };

  it('accepts a good signature, also from bytes', () => {
    expect(verifySignature(base)).toMatchObject({ ok: true, t: T });
    expect(verifySignature({ ...base, body: new TextEncoder().encode(body) }).ok).toBe(true);
  });

  it('allows 300 seconds of skew either way, not 301', () => {
    expect(verifySignature({ ...base, now: T + 300 }).ok).toBe(true);
    expect(verifySignature({ ...base, now: T - 300 }).ok).toBe(true);
    expect(verifySignature({ ...base, now: T + 301 })).toEqual({ ok: false, reason: 'stale' });
    expect(verifySignature({ ...base, now: T - 301 })).toEqual({ ok: false, reason: 'stale' });
  });

  it('rejects a changed body, path, method or secret', () => {
    expect(verifySignature({ ...base, body: `${body} ` })).toEqual({ ok: false, reason: 'mismatch' });
    expect(verifySignature({ ...base, pathWithQuery: `${path}?x=1` })).toEqual({ ok: false, reason: 'mismatch' });
    expect(verifySignature({ ...base, method: 'PUT' })).toEqual({ ok: false, reason: 'mismatch' });
    expect(verifySignature({ ...base, secret: `${SECRET}x` })).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('rejects a malformed header and fails closed without a secret', () => {
    expect(verifySignature({ ...base, header: 'nope' })).toEqual({ ok: false, reason: 'malformed' });
    expect(verifySignature({ ...base, header: null })).toEqual({ ok: false, reason: 'malformed' });
    expect(verifySignature({ ...base, secret: null })).toEqual({ ok: false, reason: 'no_secret' });
    expect(verifySignature({ ...base, secret: 'x'.repeat(31) })).toEqual({ ok: false, reason: 'no_secret' });
  });
});
