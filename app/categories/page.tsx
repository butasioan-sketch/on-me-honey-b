import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslation } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Alle Produkte - ON ME HONEY B',
  description: '133 individuell bedruckbare Produkte in 9 Kategorien: Bekleidung, Taschen, Wohnen, Geschenke, Tassen, Caps, Teller, Stifte, Schuhe. 2 sofort verfügbar.',
  openGraph: {
    title: 'Alle Produkte - ON ME HONEY B',
    description: '133 individuell bedruckbare Produkte in 9 Kategorien',
    type: 'website',
  },
};

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
    <div style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '1rem',
          letterSpacing: '-0.03em'
        }}>
          Produktkategorien
        </h1>
        <p style={{
          color: '#999',
          fontSize: '1.1rem',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: 1.7
        }}>
          Entdecke unsere 133 individuell bedruckbaren Produkte aus 9 Kategorien.
          Maßgefertigt auf Bestellung mit deinem Design.
        </p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.75rem',
        marginBottom: '4rem'
      }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="plt-card"
            style={{
              padding: '2rem',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'block'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{cat.icon}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{cat.count}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Produkte</div>
              </div>
            </div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '0.5rem'
            }}>
              {categoryNames[cat.id].de}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: '#D4AF37',
              fontWeight: 600
            }}>
              <span>Zur Kategorie</span>
              <span style={{ marginLeft: '0.5rem' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="plt-card" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'rgba(20, 20, 20, 0.6)',
        borderColor: 'rgba(212, 175, 55, 0.2)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '1rem'
        }}>
          🍯 ON ME HONEY B — Dein Design, Deine Wahl
        </h2>
        <p style={{
          color: '#999',
          fontSize: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: 1.7
        }}>
          Aktuell sind 2 Produkte live verfügbar (AirFit Pro T-Shirt & Shorts).
          Die restlichen 131 Produkte werden schrittweise aktiviert, sobald Blanks gesourct
          und Druckprofile kalibriert sind. Markierte Artikel zeigen dir den aktuellen Status.
        </p>
      </div>
    </div>
  );
}
