import type { Metadata } from 'next';
import { PortalShell } from '@/components/brand/PortalShell';
import { PORTAL_TITLE_SUFFIX } from '@/lib/page-metadata';

/**
 * Brand portal layout.
 *
 * The portal is a reference manual, not a marketing page: it runs its own
 * chrome (sticky sidebar + portal top bar) instead of the site's pill nav and
 * footer. Those are suppressed for this subtree by a pathname bail-out in the
 * layout components.
 */
export const metadata: Metadata = {
  title: {
    default: 'Brand — Itqan Studio',
    // Shared with portalMetadata() so og:title always equals the rendered title.
    template: `%s${PORTAL_TITLE_SUFFIX}`,
  },
  description:
    'The Itqan Studio brand system: logo, colour, typography, motion, voice and downloadable assets.',
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
