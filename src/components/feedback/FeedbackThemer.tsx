import type { ReactNode } from 'react';
import { Lockup } from '@/components/v3/brand';
import { SITE_URL } from '@/lib/v3/seo';

/**
 * The host-specific frame for the feedback form, brand v3.
 *
 * The form is reached two ways:
 *   itqanstudio.com/feedback      inside the normal v3 nav and footer
 *   feedback.itqanstudio.com      a standalone page for a client holding a link
 *
 * On the subdomain the site nav and footer would be wrong: every relative link
 * in them resolves against feedback.itqanstudio.com, and "/" there is this form.
 * So on that host the chrome is hidden and a plain bar with the lockup links to
 * the main site by its absolute URL.
 *
 * `standalone` comes from the middleware's portal flag, decided on the server
 * from the Host header (see lib/portal-chrome.ts and lib/brand-routing.ts). It
 * cannot be a client check: the rewrite leaves the browser URL at "/".
 *
 * v3 is dark only, so the page-local light and dark toggle of the old brand is gone.
 */
// Keep in step with the chrome SiteShell renders: `.skip` and `nav.n` in
// components/v3/Nav.tsx, `footer.f` in components/v3/sections-company.tsx.
const HIDE_SITE_CHROME ='.skip, nav.n, footer.f { display: none !important; }';

interface FeedbackThemerProps {
  standalone: boolean;
  children: ReactNode;
}

export function FeedbackThemer({ standalone, children }: FeedbackThemerProps) {
  if (!standalone) return <>{children}</>;
  return (
    <>
      <style>{HIDE_SITE_CHROME}</style>
      <header className="fb-bar">
        <div className="wrap">
          <a className="home" href={SITE_URL} aria-label="Itqan, home page">
            <Lockup gid="fb-sym" lang="en" />
          </a>
        </div>
      </header>
      {children}
    </>
  );
}
