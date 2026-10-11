/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  // Canonicalize the host: www → apex (301). The app answers on both hosts via
  // Traefik; without this, www.itqanstudio.com served a duplicate 200. The
  // canonical <link> already points to the apex, but a redirect is the correct
  // signal and avoids split host authority.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.itqanstudio.com' }],
        destination: 'https://itqanstudio.com/:path*',
        permanent: true,
      },
      // Brand v3 (8 Oct 2026): the old pages fold into sections of the one-page site.
      { source: '/about', destination: '/#company', permanent: true },
      { source: '/services', destination: '/#build', permanent: true },
      { source: '/contact', destination: '/book', permanent: true },
      { source: '/work', destination: '/#work', permanent: true },
      // Only Millow and Nexilink have case pages now; every other old case lands on the work section.
      { source: '/work/:slug((?!millow$|nexilink$)[^/]+)', destination: '/#work', permanent: true },
      // Brand v3 in the portal (11 Oct 2026): the old static brand pack now points at the v3 pack built at prebuild.
      {
        source: '/brands/downloads/itqan-studio-brand-pack.zip',
        destination: '/brand/bundles/itqan-studio-brand-pack.zip',
        permanent: false,
      },
      /*
       * Retired v2 brand files. Email signatures already installed in Gmail load
       * their images from these URLs, so each one points at its v3 counterpart
       * instead of breaking. Temporary (307), so the targets can still change.
       */
      ...[
        ['itqan-mark.png', 'v3-lockup.png'],
        ['itqan-wordmark.png', 'v3-lockup.png'],
        ['itqan-wordmark-chip.png', 'v3-lockup.png'],
        ['itqan-wordmark-cream.png', 'v3-lockup.png'],
        ['itqan-wordmark-mauve.png', 'v3-lockup.png'],
        ['itqan-wordmark-sand.png', 'v3-lockup.png'],
        ['itqan-wordmark-sand-tight.png', 'v3-lockup.png'],
        ['itqan-wordmark-tight.png', 'v3-lockup.png'],
        ['divider-arcs.png', 'v3-rule.png'],
        ['divider-arcs-2.svg', 'v3-rule.png'],
        ['icon-globe.png', 'v3-icon-web.png'],
        ['icon-globe-2.svg', 'v3-icon-web.png'],
        ['icon-instagram.png', 'v3-icon-instagram.png'],
        ['icon-instagram-2.svg', 'v3-icon-instagram.png'],
        ['icon-linkedin.png', 'v3-icon-linkedin.png'],
        ['icon-linkedin-2.svg', 'v3-icon-linkedin.png'],
        ['icon-mail.png', 'v3-icon-mail.png'],
        ['icon-mail-2.svg', 'v3-icon-mail.png'],
        ['icon-phone.png', 'v3-icon-phone.png'],
        ['icon-phone-2.svg', 'v3-icon-phone.png'],
        ['icon-pin.png', 'v3-icon-location.png'],
        ['icon-pin-2.svg', 'v3-icon-location.png'],
        ['pmp-badge.png', 'v3-pmp-badge.png'],
      ].map(([from, to]) => ({
        source: `/brand/itqan-studio/signature/${from}`,
        destination: `/brand/itqan-studio/signature/${to}`,
        permanent: false,
      })),
      { source: '/brand/itqan-studio/sticker/:file((?!itqan-sticker-)[^/]+)', destination: '/brand/assets/stickers', permanent: false },
      ...[
        ['dark-logo.svg', 'itqan-lockup-ink-2.svg'],
        ['light-logo.svg', 'itqan-lockup-bone-2.svg'],
        ['white-logo.svg', 'itqan-lockup-bone-2.svg'],
        ['dark-icon.svg', 'itqan-symbol-ink-2.svg'],
        ['light-icon.svg', 'itqan-symbol-bone-2.svg'],
      ].map(([from, to]) => ({
        source: `/images/brand/${from}`,
        destination: `/brand/itqan-studio/logo/${to}`,
        permanent: false,
      })),
    ];
  },

  // Baseline security headers (also a Lighthouse "best practices" signal).
  // HSTS forces HTTPS for a year incl. subdomains; the rest are cheap hardening.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      /*
       * The booking admin shows every guest's details, so it gets a strict CSP:
       * same-origin everything, no framing, no form posts elsewhere. Next 14
       * inlines its bootstrap scripts and styles, hence 'unsafe-inline'; dev
       * mode also needs 'unsafe-eval' for fast refresh.
       */
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'none'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
