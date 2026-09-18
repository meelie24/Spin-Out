import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Spin Out',
    short_name: 'Spin Out',
    description: 'A private Reality Run for the moment you are about to gamble.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3ede4',
    theme_color: '#3d2b23',
    icons: [{ src: '/icon', sizes: '64x64', type: 'image/png' }],
  };
}
