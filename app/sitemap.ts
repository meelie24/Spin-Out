import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://spinitout.com';
  return ['', '/research', '/help', '/privacy', '/terms'].map(path => ({
    url: base + path,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : .5,
  }));
}
