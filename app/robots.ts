import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] },
    ],
    sitemap: 'https://on-me-honey-b.vercel.app/sitemap.xml',
  };
}
