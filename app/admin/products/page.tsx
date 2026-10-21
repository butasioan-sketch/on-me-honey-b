import { PRODUCTS_133 } from '@/lib/products-all-133';
import Link from 'next/link';

const STATUS_COLORS = {
  shop_live: 'bg-green-100 text-green-800',
  anker: 'bg-blue-100 text-blue-800',
  pilot: 'bg-purple-100 text-purple-800',
  offen: 'bg-gray-100 text-gray-800',
  pruefen: 'bg-yellow-100 text-yellow-800',
};

export default function AdminProductsPage() {
  const stats = {
    total: PRODUCTS_133.length,
    shop_live: PRODUCTS_133.filter(p => p.status === 'shop_live').length,
    anker: PRODUCTS_133.filter(p => p.status === 'anker').length,
    pilot: PRODUCTS_133.filter(p => p.status === 'pilot').length,
    offen: PRODUCTS_133.filter(p => p.status === 'offen').length,
    pruefen: PRODUCTS_133.filter(p => p.status === 'pruefen').length,
  };

  const byCategory = {
    A: PRODUCTS_133.filter(p => p.category === 'A').length,
    B: PRODUCTS_133.filter(p => p.category === 'B').length,
    C: PRODUCTS_133.filter(p => p.category === 'C').length,
    D: PRODUCTS_133.filter(p => p.category === 'D').length,
    E: PRODUCTS_133.filter(p => p.category === 'E').length,
    F: PRODUCTS_133.filter(p => p.category === 'F').length,
    G: PRODUCTS_133.filter(p => p.category === 'G').length,
    H: PRODUCTS_133.filter(p => p.category === 'H').length,
    I: PRODUCTS_133.filter(p => p.category === 'I').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Produkt-Verwaltung (133)</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-100">
          <div className="text-3xl font-bold text-green-900">{stats.shop_live}</div>
          <div className="text-sm text-green-700">Shop Live</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
          <div className="text-3xl font-bold text-blue-900">{stats.anker}</div>
          <div className="text-sm text-blue-700">Anker</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
          <div className="text-3xl font-bold text-purple-900">{stats.pilot}</div>
          <div className="text-sm text-purple-700">Pilot</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{stats.offen}</div>
          <div className="text-sm text-gray-700">Offen</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-100">
          <div className="text-3xl font-bold text-yellow-900">{stats.pruefen}</div>
          <div className="text-sm text-yellow-700">Prüfen</div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="bg-white rounded-lg border-2 border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Nach Kategorie</h2>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
          {Object.entries(byCategory).map(([cat, count]) => (
            <div key={cat} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">Kat. {cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Familie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GLB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Foto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PRODUCTS_133.map((product) => (
                <tr key={product.sku} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium">{product.name.de}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.family}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{product.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.hasGLB ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.hasPhoto ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.sku}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
