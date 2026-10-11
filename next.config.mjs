/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  // Runs src/instrumentation.ts once at server start: it logs a CRM_API_ORIGIN the site refuses.
  experimental: { instrumentationHook: true },
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
      // CRM v3 (Oct 2026): hours, days off and bookings are managed in the CRM; the site admin is gone.
      { source: '/admin', destination: 'https://portal.itqanstudio.com/calendar/availability', permanent: true },
      { source: '/admin/:path*', destination: 'https://portal.itqanstudio.com/calendar/availability', permanent: true },
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
    ];
  },
};

export default nextConfig;
