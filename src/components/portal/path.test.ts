import { describe, expect, it } from 'vitest';
import { currentPortalPath } from './path';

describe('currentPortalPath', () => {
  it('treats the brand subdomain root as the overview', () => {
    expect(currentPortalPath('/')).toBe('/brand');
  });

  it('falls back to the overview when the pathname is unknown', () => {
    expect(currentPortalPath(null)).toBe('/brand');
    expect(currentPortalPath('')).toBe('/brand');
  });

  it('strips trailing slashes', () => {
    expect(currentPortalPath('/brand/')).toBe('/brand');
    expect(currentPortalPath('/brand/logo//')).toBe('/brand/logo');
  });

  it('collapses a path of only slashes to the overview', () => {
    expect(currentPortalPath('///')).toBe('/brand');
  });

  it('keeps portal paths as they are', () => {
    expect(currentPortalPath('/brand')).toBe('/brand');
    expect(currentPortalPath('/brand/colour/pairings')).toBe('/brand/colour/pairings');
  });
});
