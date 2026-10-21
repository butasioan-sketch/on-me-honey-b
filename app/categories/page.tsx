import Link from 'next/link';
import { getTranslation } from '@/lib/i18n';

const categories = [
  { id: 'A', icon: '👕', count: 31 },
  { id: 'B', icon: '👜', count: 19 },
  { id: 'C', icon: '🏠', count: 27 },
  { id: 'D', icon: '🎁', count: 24 },
  { id: 'E', icon: '☕', count: 15 },
  { id: 'F', icon: '🧢', count: 6 },
  { id: 'G', icon: '🍽️', count: 4 },
  { id: 'H', icon: '✒️', count: 3 },
  { id: 'I', icon: '👟', count: 4 },
] as const;

export default async function CategoriesPage() {
  const t = await getTranslation('de');

  const categoryNames = {
    A: { de: 'Bekleidung und Mode', ro: 'Îmbrăcăminte și Modă', en: 'Clothing and Fashion' },
    B: { de: 'Taschen und Accessoires', ro: 'Genți și Accesorii', en: 'Bags and Accessories' },
    C: { de: 'Wohnen und Dekoration', ro: 'Casă și Decorațiune', en: 'Home and Decoration' },
    D: { de: 'Geschenkartikel, Büro und Technik', ro: 'Cadouri, Birou și Tehnologie', en: 'Gifts, Office and Tech' },
    E: { de: 'Tassen, Becher und Trinkgefäße', ro: 'Căni, Pahare și Vase de Băut', en: 'Mugs, Cups and Drinkware' },
    F: { de: 'Kappen und Kopfbedeckungen', ro: 'Șepci și Acoperăminte pentru Cap', en: 'Caps and Headwear' },
    G: { de: 'Teller und Keramikartikel', ro: 'Farfurii și Articole din Ceramică', en: 'Plates and Ceramic Items' },
    H: { de: 'Stifte und Schreibgeräte', ro: 'Pixuri și Instrumente de Scris', en: 'Pens and Writing Instruments' },
    I: { de: 'Schuhe', ro: 'Încălțăminte', en: 'Shoes' },
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Produktkategorien
      </h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Entdecke unsere 133 individuell bedruckbaren Produkte aus 9 Kategorien.
        Maßgefertigt auf Bestellung mit deinem Design.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group block p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{cat.icon}</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{cat.count}</div>
                <div className="text-sm text-gray-500">Produkte</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[#d4af37] transition-colors">
              {categoryNames[cat.id].de}
            </h3>
            <div className="flex items-center text-sm text-gray-500 group-hover:text-[#d4af37] transition-colors">
              <span>Zur Kategorie</span>
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 p-8 bg-gray-50 rounded-2xl border-2 border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-center">
          🍯 ON ME HONEY B — Dein Design, Deine Wahl
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto">
          Aktuell sind 2 Produkte live verfügbar (AirFit Pro T-Shirt & Shorts).
          Die restlichen 131 Produkte werden schrittweise aktiviert, sobald Blanks gesourct
          und Druckprofile kalibriert sind. Markierte Artikel zeigen dir den aktuellen Status.
        </p>
      </div>
    </div>
  );
}
