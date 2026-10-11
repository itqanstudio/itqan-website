/**
 * The portal root is reached two ways: itqanstudio.com/brand, and the root of
 * brand.itqanstudio.com, which middleware rewrites to /brand without changing
 * the browser URL. Treat both as the overview page.
 */
export function currentPortalPath(pathname: string | null): string {
  if (!pathname || pathname === '/') return '/brand';
  return pathname.replace(/\/+$/, '') || '/brand';
}
