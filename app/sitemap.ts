import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://on-me-honey-b.vercel.app';
  const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/konfigurator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...categories.map(cat => ({
      url: `${base}/categories/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${base}/product/1`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/product/2`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/cart`, lastModified: new Date(), changeFrequency: 'always', priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/versand`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/impressum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/agb`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
