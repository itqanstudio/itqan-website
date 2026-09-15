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
