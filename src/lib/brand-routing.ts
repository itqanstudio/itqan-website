/**
 * Brand-portal routing decisions, as a pure function.
 *
 * Kept free of `next/server` so it can be reasoned about — and tested — without
 * a bundler or a mocked NextRequest. `src/middleware.ts` is a thin adapter that
 * turns these decisions into NextResponse calls.
 *
 * The precedence between external redirect, legacy redirect and rewrite is not
 * obvious, which is exactly why it lives in one testable place.
 */

export const SHAREEFICO_PORTAL = 'https://shareefi.co/brand';

/**
 * The portal subdomain is SINGULAR — brand.itqanstudio.com — to match
 * brand.uber.com, which is the reference this portal is built against and the
 * form people actually type.
 *
 * The plural was shipped first and may be in a link or a bookmark, so it stays
 * alive as a permanent redirect rather than a second canonical host. Two hosts
 * serving identical content would split the SEO and make the "which one is
 * real" question permanent.
 */
export const ITQAN_PORTAL_HOST = 'brand.itqanstudio.com';
export const SHAREEFICO_PORTAL_HOST = 'brand.shareefi.co';

/** The client-testimonial form — the post-project routine. Same host-rewrite mechanism as
 *  the brand portal: the subdomain root serves /feedback without changing the URL, and the
 *  portal flag strips the site chrome so clients land on a clean standalone form. */
export const FEEDBACK_HOST = 'feedback.itqanstudio.com';

/** Hosts served by rewriting to a route in this app. */
const BRAND_HOSTS: Record<string, string> = {
  [ITQAN_PORTAL_HOST]: '/brand',
  [FEEDBACK_HOST]: '/feedback',
};

/** Hosts that belong to another deployment, or to another name. */
const REDIRECT_HOSTS: Record<string, string> = {
  // Shareefico's portal ships from its own repo.
  'brand.shareefi.co': SHAREEFICO_PORTAL,
  'brands.shareefi.co': SHAREEFICO_PORTAL,
  // Superseded plural, kept alive for links already shared.
  'brands.itqanstudio.com': `https://${ITQAN_PORTAL_HOST}`,
};

/** Superseded paths from the previous single-scroll brands hub. */
const LEGACY_PATHS: Record<string, string> = {
  '/brands': '/brand',
  '/brands/itqan-studio': '/brand',
  '/brands/shareefico': SHAREEFICO_PORTAL,
};

export type BrandRoute =
  /**
   * Send the client to an absolute URL. Permanent (308) unless `temporary`, which
   * is used where the target can change, so browsers do not cache it forever.
   */
  | { kind: 'redirect-external'; to: string; temporary?: true }
  /** Send the client to a path on THIS site. The origin is pinned by the caller. */
  | { kind: 'redirect-internal'; path: string }
  /** Serve a different route without changing the URL. */
  | { kind: 'rewrite'; path: string }
  | { kind: 'pass' };

/**
 * @param portalPaths every portal page href ("/brand/logo", ...). On the portal
 *   host, a short path that names one of them ("/logo") redirects to it. Passed
 *   in rather than imported so this module stays free of the portal data.
 */
export function resolveBrandRoute(
  rawHost: string | null,
  pathname: string,
  search = '',
  portalPaths: ReadonlySet<string> = new Set(),
): BrandRoute {
  const host = (rawHost ?? '').toLowerCase().split(':')[0];

  /*
   * Host routing runs FIRST and on every path. If it only ran on the legacy
   * paths, brands.shareefi.co/brand/logo would fall through and be served
   * Itqan's portal under Shareefico's domain.
   *
   * Only /brand* paths carry over: that host has only ever served the portal,
   * so any other path would land on a URL that does not exist at the
   * destination. Everything else goes to the portal root.
   */
  const redirectHost = REDIRECT_HOSTS[host];
  if (redirectHost) {
    // Exact `/brand` or a `/brand/` child — NOT a bare `startsWith`, which also
    // matches the legacy `/brands` and would send people to a URL that does not
    // exist at the destination.
    const isPortalPath = pathname === '/brand' || pathname.startsWith('/brand/');
    const to = isPortalPath
      ? new URL(`${pathname}${search}`, redirectHost).toString()
      : redirectHost;
    return { kind: 'redirect-external', to };
  }

  const legacy = LEGACY_PATHS[pathname];
  if (legacy) {
    return legacy.startsWith('http')
      ? { kind: 'redirect-external', to: legacy }
      : { kind: 'redirect-internal', path: `${legacy}${search}` };
  }

  const target = BRAND_HOSTS[host];
  if (target && (pathname === '/' || pathname === '')) {
    return { kind: 'rewrite', path: target };
  }

  /*
   * People type brand.itqanstudio.com/logo. Only the root is rewritten, so send
   * a short path to its real page, /brand/logo, on the same host. A redirect
   * rather than a rewrite keeps one URL per page. Only pages in the portal
   * tree qualify, so an unknown path still 404s instead of being guessed, and
   * the origin is the pinned constant, never the Host header. Temporary (307):
   * a portal page can be renamed, and a cached 308 would outlive it.
   */
  const short = pathname.replace(/\/+$/, '');
  if (host === ITQAN_PORTAL_HOST && short !== '') {
    const full = `/brand${short}`;
    if (portalPaths.has(full)) {
      return {
        kind: 'redirect-external',
        to: `https://${ITQAN_PORTAL_HOST}${full}${search}`,
        temporary: true,
      };
    }
  }

  return { kind: 'pass' };
}
