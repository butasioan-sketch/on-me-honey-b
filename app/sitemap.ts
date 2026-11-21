import { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { CATALOG } from '@/lib/catalog/families';
import { CAMPAIGNS } from '@/lib/catalog/campaigns';
import { siteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/categories',
    ...CATEGORIES.map(({ id }) => `/categories/${id}`),
    ...Object.values(CATALOG)
      .filter(({ shop_live, shopId }) => shop_live && shopId)
      .map(({ shopId }) => `/product/${shopId}`),
    '/geschenke',
    ...Object.keys(CAMPAIGNS).map((slug) => `/saison/${slug}`),
    '/faq',
    '/versand',
    '/so-gehts',
    '/grossbestellung',
    '/widerruf',
    '/impressum',
    '/datenschutz',
    '/agb',
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
