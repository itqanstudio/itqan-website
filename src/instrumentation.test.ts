import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from './instrumentation';

/*
 * The server's startup hook (review r2, kimi HIGH): a CRM_API_ORIGIN the site
 * refuses pauses every booking and cancel, so it is said loudly once at boot
 * instead of only when a guest tries to book. It never stops the boot.
 */

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('register (instrumentation)', () => {
  it('logs a startup error in the Node server when CRM_API_ORIGIN is set but refused', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.stubEnv('CRM_API_ORIGIN', 'http://itqan-crm:3000');
    await register();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/^\[startup\] CRM_API_ORIGIN is set but refused/));
  });

  it('says nothing for a usable or unset origin', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.stubEnv('CRM_API_ORIGIN', 'https://portal.itqanstudio.com');
    await register();
    vi.stubEnv('CRM_API_ORIGIN', '');
    await register();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('does nothing in the edge runtime (the middleware), where the CRM is never called', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge');
    vi.stubEnv('CRM_API_ORIGIN', 'http://itqan-crm:3000');
    await register();
    expect(console.error).not.toHaveBeenCalled();
  });
});
