import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Itqan. Private AI for manufacturing, retail and food and beverage',
    short_name: 'Itqan',
    description: 'Itqan builds AI agents for operations, supply chain and customer teams and runs them inside your own cloud account.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0A0D',
    theme_color: '#0B0A0D',
    icons: [
      { src: '/v3/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/v3/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
