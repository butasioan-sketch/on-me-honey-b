import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS_133, getProductsByCategory, type Category } from '@/lib/products-all-133';

const CATEGORY_INFO = {
  A: { name: 'Bekleidung und Mode', icon: '👕' },
  B: { name: 'Taschen und Accessoires', icon: '👜' },
  C: { name: 'Wohnen und Dekoration', icon: '🏠' },
  D: { name: 'Geschenkartikel, Büro und Technik', icon: '🎁' },
  E: { name: 'Tassen, Becher und Trinkgefäße', icon: '☕' },
  F: { name: 'Kappen und Kopfbedeckungen', icon: '🧢' },
  G: { name: 'Teller und Keramikartikel', icon: '🍽️' },
  H: { name: 'Stifte und Schreibgeräte', icon: '✒️' },
  I: { name: 'Schuhe', icon: '👟' },
} as const;

const STATUS_BADGES = {
  shop_live: { label: '', color: '' },
  anker: { label: 'Bald verfügbar', color: 'bg-blue-100 text-blue-800' },
  pilot: { label: 'In Entwicklung', color: 'bg-purple-100 text-purple-800' },
  offen: { label: 'In Planung', color: 'bg-gray-100 text-gray-800' },
  pruefen: { label: 'Wird geprüft', color: 'bg-yellow-100 text-yellow-800' },
} as const;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].includes(category)) {
    notFound();
  }

  const categoryKey = category as Category;
  const products = getProductsByCategory(categoryKey);
  const info = CATEGORY_INFO[categoryKey];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <Link href="/categories" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zu allen Kategorien
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{info.icon}</div>
          <div>
            <h1 className="text-4xl font-bold">{info.name}</h1>
            <p className="text-gray-600">{products.length} Produkte</p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.sku}
            className="group bg-white rounded-xl border-2 border-gray-100 hover:border-[#d4af37] hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              <img
                src={
                  product.sku === '001' ? '/airfit-front-t.png' :
                  product.sku === '015' ? '/airfit-shorts-front.png' :
                  '/products/placeholder/coming-soon.svg'
                }
                alt={product.name.de}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.status !== 'shop_live' && (
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[product.status].color}`}>
                  {STATUS_BADGES[product.status].label}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">SKU {product.sku}</div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#d4af37] transition-colors">
                {product.name.de}
              </h3>
              <div className="flex items-baseline justify-between">
                {product.status === 'shop_live' && (
                  <div className="text-2xl font-bold text-gray-900">
                    {product.price.toFixed(2)} €
                  </div>
                )}
                {product.status === 'shop_live' ? (
                  <Link
                    href={`/product/${product.id}`}
                    className="px-4 py-2 bg-[#d4af37] text-white rounded-lg text-sm font-semibold hover:bg-[#c09b2f] transition-colors"
                  >
                    Gestalten
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed"
                  >
                    Bald
                  </button>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                {product.blank.length > 40 ? `${product.blank.substring(0, 40)}...` : product.blank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
