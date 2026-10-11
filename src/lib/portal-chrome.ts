// Relative, not the @/ alias: this module is imported by the test suite
// through Node's native TypeScript support, which does not resolve tsconfig
// path aliases. Next handles a relative import identically.
import { ITQAN_PORTAL_HOST } from './brand-routing.ts';

/**
 * Whether a request is for the BRAND PORTAL, decided once on the server.
 *
 * WHY THIS CANNOT BE A CLIENT-SIDE PATHNAME CHECK
 * -----------------------------------------------
 * The portal is served from a subdomain, and its root is REWRITTEN:
 *
 *     brand.itqanstudio.com/  →  (internally) /brand
 *
 * (Deeper pages live at brand.itqanstudio.com/brand/<page>; a short path such
 * as /positioning redirects there since 11 Oct 2026.) A rewrite deliberately
 * leaves the browser URL alone, so `usePathname()` in a client component
 * returns `/` on the portal root, NOT `/brand`. Every
 * guard of the shape `pathname.startsWith('/brand/')` therefore evaluates
 * FALSE on the live portal, even though the server is rendering a portal page.
 *
 * That is not hypothetical; it is the bug this file was written to fix
 * (2026-08-13). brand.itqanstudio.com was serving the marketing site's pill nav
 * AND its footer on top of the portal's own sticky chrome — confirmed in the
 * live HTML by the presence of `<nav aria-label="Main navigation">` and
 * `<nav aria-label="Footer navigation">` on /positioning. Two stacked sticky
 * bars, with the page <h1> clipped behind them.
 *
 * The host is only visible on the SERVER, so the decision is made there once,
 * passed down as a request header, and read in the root layout. The sibling
 * shareefico-website repo solved the identical problem the same way and is
 * verifiably correct in production; this is a deliberate port, not a
 * coincidence.
 */

/** Request header the root layout reads to decide whether to render site chrome. */
export const PORTAL_HEADER = 'x-brand-portal';

/**
 * True when this request should render PORTAL chrome instead of site chrome.
 *
 * Covers both entry points, because both are real:
 *   - the portal subdomain, on any path (the rewrite case)
 *   - `/brand` and below on the apex, which is how the portal is reached from
 *     the main site's nav
 *
 * The host list is NOT duplicated here — it comes from brand-routing, which is
 * already the single source of truth for portal hosts and is unit-tested
 * (`npm run test:routing`). `brands.itqanstudio.com` is deliberately absent:
 * brand-routing 308-redirects it to the singular host before this is reached.
 */
export function isPortalRequest(host: string | null, pathname: string): boolean {
  const h = (host ?? '').toLowerCase().split(':')[0];
  return h === ITQAN_PORTAL_HOST || pathname === '/brand' || pathname.startsWith('/brand/');
}
