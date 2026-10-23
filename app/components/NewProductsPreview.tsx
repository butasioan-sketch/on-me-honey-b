'use client';

/**
 * NEUE PRODUKTE PREVIEW — Homepage Section
 * Zeigt kommende Produkte (kein 3D - Grok WAVE 3.2)
 */

interface NewProduct {
  id: string;
  name: string;
  nameDE: string;
  weight: string;
  material: string;
  description: string;
  features: string[];
}

const newProducts: NewProduct[] = [
  {
    id: '5',
    name: 'BRILDOR®',
    nameDE: 'Kissenbezug 40×40cm',
    weight: '180 g/m²',
    material: '100% Mikrofaser-Polyester',
    description: 'Vollflächig bedruckbarer Kissenbezug, beidseitig sublimierbar',
    features: [
      'Vollflächiger Druck (40×40 cm pro Seite)',
      'Beidseitig bedruckbar',
      'Samtweiche Mikrofaser',
      'Versteckter Reißverschluss'
    ],
  }
];

export default function NewProductsPreview() {
  return (
    <section
      style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            WEITERE PRODUKTE IN VORBEREITUNG
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#888',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Erweitere deine Custom-Kollektion mit unseren neuesten Produkten
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '999px',
            fontSize: '0.9rem',
            color: '#4CAF50',
            fontWeight: 600
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Bald verfügbar
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {newProducts.map((product) => (
            <div
              key={product.id}
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                {product.nameDE}
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: '#D4AF37',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                {product.name}
              </p>
              <p style={{
                fontSize: '0.95rem',
                color: '#ccc',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {product.description}
              </p>

              {/* Specs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: '#888' }}>Material:</span>
                  <br />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{product.material}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Gewicht:</span>
                  <br />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{product.weight}</span>
                </div>
              </div>

              {/* Features */}
              <ul style={{
                margin: 0,
                padding: '0 0 0 1.2rem',
                fontSize: '0.85rem',
                color: '#999',
                lineHeight: '1.8'
              }}>
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(212, 175, 55, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1rem',
            color: '#ccc',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Diese Produkte werden bald verfügbar sein. Alle Artikel sind <strong>vollständig personalisierbar</strong> mit deinem eigenen Design per Sublimationsdruck.
          </p>
        </div>
      </div>
    </section>
  );
}
