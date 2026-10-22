'use client';

import { useState } from 'react';
import Shirt3DEnhanced from './Shirt3DEnhanced';

/**
 * NEUE PRODUKTE PREVIEW — Homepage Section
 * Zeigt 3 neue Produkte als realistische 3D-Modelle
 * Status: "Bald verfügbar"
 */

interface NewProduct {
  id: string;
  name: string;
  nameDE: string;
  model: string;
  weight: string;
  material: string;
  description: string;
  features: string[];
  comingSoon: boolean;
}

const newProducts: NewProduct[] = [
  {
    id: '3',
    name: 'PROACT® PA4012',
    nameDE: 'Sport-Shirt Raglan',
    model: '/models/sport-shirt-pa4012.glb',
    weight: '130 g/m²',
    material: '100% Recycling-Polyester',
    description: 'Leichtes Sportshirt mit Raglanärmeln und kontrastfarbenem Nackenband',
    features: [
      'Raglanärmel für optimale Bewegungsfreiheit',
      'Recyceltes Polyester - nachhaltig',
      'Schnelltrocknendes Gewebe',
      'Front + Back bedruckbar'
    ],
    comingSoon: true
  },
  {
    id: '4',
    name: 'PROACT® PA1050',
    nameDE: 'Basketball-Shorts',
    model: '/models/basketball-shorts-pa1050.glb',
    weight: '180 g/m²',
    material: '100% Birdseye-Polyester',
    description: 'Atmungsaktive Basketball-Shorts mit Seitenschlitzen',
    features: [
      'Birdseye-Gewebe für maximale Atmungsaktivität',
      '2 Seitenschlitze für Bewegungsfreiheit',
      'Elastischer Bund mit Kordelzug',
      'Front + Back + Seiten bedruckbar'
    ],
    comingSoon: true
  },
  {
    id: '5',
    name: 'BRILDOR®',
    nameDE: 'Kissenbezug 40×40cm',
    model: '/models/pillow-cover-40x40.glb',
    weight: '180 g/m²',
    material: '100% Mikrofaser-Polyester',
    description: 'Vollflächig bedruckbarer Kissenbezug, beidseitig sublimierbar',
    features: [
      'Vollflächiger Druck (40×40 cm pro Seite)',
      'Beidseitig bedruckbar',
      'Samtweiche Mikrofaser',
      'Versteckter Reißverschluss'
    ],
    comingSoon: true
  }
];

export default function NewProductsPreview() {
  const [selectedProduct, setSelectedProduct] = useState(newProducts[0]);

  return (
    <section
      style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
            NEUE PRODUKTE
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

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Product Cards */}
          {newProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{
                padding: '1.5rem',
                background: selectedProduct.id === product.id
                  ? 'rgba(212, 175, 55, 0.1)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: selectedProduct.id === product.id
                  ? '2px solid #D4AF37'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedProduct.id !== product.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProduct.id !== product.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
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
                {product.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 3D Viewer */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* 3D Model */}
            <div style={{
              height: '500px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Placeholder für 3D-Modell */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                  3D-Modell wird geladen...
                </p>
                <p style={{ fontSize: '0.85rem', color: '#555' }}>
                  {selectedProduct.model}
                </p>
              </div>
              {/*
              TODO: Hier Shirt3DEnhanced einbauen wenn GLB vorhanden:
              <Shirt3DEnhanced
                productId={selectedProduct.id}
                shirtColor="#ffffff"
                enableTouch={true}
              />
              */}
            </div>

            {/* Product Details */}
            <div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '1rem'
              }}>
                {selectedProduct.nameDE}
              </h3>

              <div style={{
                padding: '1rem',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#D4AF37',
                  fontWeight: 600,
                  margin: 0
                }}>
                  {selectedProduct.name}
                </p>
              </div>

              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#ccc',
                marginBottom: '1.5rem'
              }}>
                {selectedProduct.description}
              </p>

              {/* All Features */}
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.75rem'
              }}>
                Features:
              </h4>
              <ul style={{
                margin: '0 0 1.5rem 0',
                padding: '0 0 0 1.5rem',
                fontSize: '0.95rem',
                color: '#aaa',
                lineHeight: '2'
              }}>
                {selectedProduct.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              {/* Specs Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                    MATERIAL
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    {selectedProduct.material}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                    GEWICHT
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    {selectedProduct.weight}
                  </div>
                </div>
              </div>

              {/* Coming Soon Button */}
              <button
                disabled
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(76, 175, 80, 0.2)',
                  border: '1px solid rgba(76, 175, 80, 0.4)',
                  borderRadius: '8px',
                  color: '#4CAF50',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              >
                🕐 Bald verfügbar
              </button>
            </div>
          </div>

          {/* 360° Hinweis */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#2196F3',
            textAlign: 'center'
          }}>
            💡 <strong>Tipp:</strong> Sobald die 3D-Modelle geladen sind, kannst du sie mit der Maus drehen und zoomen
          </div>
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
