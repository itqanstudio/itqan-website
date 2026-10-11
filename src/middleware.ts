import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo';
import { resolveBrandRoute } from '@/lib/brand-routing';
import { PORTAL_HEADER, isPortalRequest } from '@/lib/portal-chrome';
import { PORTAL_PAGES } from '@/data/brand-portal';

/** Portal page hrefs, so brand.itqanstudio.com/logo can redirect to /brand/logo. */
const PORTAL_PATHS: ReadonlySet<string> = new Set(PORTAL_PAGES.map((p) => p.href));

/**
 * Brand-portal host routing — the brand.uber.com model.
 *
 *   brand.itqanstudio.com/       →  /brand             (rewritten, served here)
 *   brand.itqanstudio.com/logo   →  /brand/logo        (307, portal pages only)
 *   brand.shareefi.co            →  shareefi.co/brand  (redirected, served elsewhere)
 *
 * All URL decisions live in `@/lib/brand-routing` so they can be tested without
 * a mocked NextRequest (`npm run test:routing`). This file only turns a
 * decision into a response.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get('host');
  const route = resolveBrandRoute(host, pathname, search, PORTAL_PATHS);

  /*
   * Flag portal requests for the root layout, which uses it to skip the site
   * nav and footer. Set on the REQUEST headers so a server component can read
   * it; a client pathname check cannot, because the portal host is rewritten
   * and the browser URL never shows /brand. See lib/portal-chrome.ts.
   *
   * SECURITY: this is an INBOUND request header, which means a client can send
   * it. It is therefore set or DELETED on every path, never merely left alone
   * — otherwise `curl /work -H 'x-brand-portal: 1'` would flow straight
   * through to `headers()` and strip the chrome off any page. The only value
   * the layout ever sees is the one decided here.
   */
  const withPortalFlag = (isPortal: boolean) => {
    const headers = new Headers(req.headers);
    if (isPortal) headers.set(PORTAL_HEADER, '1');
    else headers.delete(PORTAL_HEADER);
    return { request: { headers } };
  };

  switch (route.kind) {
    case 'redirect-external':
      return NextResponse.redirect(route.to, route.temporary ? 307 : 308);

    /*
     * Internal redirects are built against a PINNED origin, never `req.nextUrl`.
     *
     * `nextUrl` derives its origin from the Host header. Echoing that back into
     * a 308 means a spoofed Host (a default vhost, or a path-keyed cache in
     * front) yields a permanent, browser-cacheable redirect from a trusted path
     * to an attacker's origin — and 308 makes that stick.
     */
    case 'redirect-internal':
      return NextResponse.redirect(new URL(route.path, SITE_URL), 308);

    case 'rewrite': {
      // Safe to clone: a rewrite is resolved server-side and never sends an
      // origin back to the client. This is also the ONLY place the portal host
      // is still visible — after the rewrite the client sees "/" and cannot
      // tell it is on the portal.
      const url = req.nextUrl.clone();
      url.pathname = route.path;
      return NextResponse.rewrite(url, withPortalFlag(true));
    }

    default:
      // `/brand` and below on the apex is also the portal, reached from the
      // site nav rather than the subdomain. One signal covers both entry
      // points, so the layout needs only one check.
      return NextResponse.next(withPortalFlag(isPortalRequest(host, pathname)));
  }
}

export const config = {
  /*
   * Everything except framework internals and static files. Host routing has to
   * see every path (see brand-routing), which a path-scoped matcher cannot do.
   */
  matcher: ['/((?!_next/static|_next/image|api/|favicon.ico|.*\\.[\\w]+$).*)'],
};
