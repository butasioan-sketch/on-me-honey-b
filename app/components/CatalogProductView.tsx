'use client';

import Image from 'next/image';
import SiteHeader from './SiteHeader';
import { useLocale } from './LocaleProvider';
import type { ProductRecord } from '@/lib/catalog/families';

interface CatalogProductViewProps {
  product: ProductRecord;
}

/**
 * Catalog-only product view (shop_live=false)
 * Shows photo + metadata, no purchase flow
 */
export default function CatalogProductView({ product }: CatalogProductViewProps) {
  const { locale } = useLocale();

  // Photo path: /products/{sku}/front.png
  const photoPath = `/products/${product.sku}/front.png`;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <SiteHeader />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Photo */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#111', borderRadius: '16px', overflow: 'hidden' }}>
            <Image
              src={photoPath}
              alt={product.name}
              fill
              style={{ objectFit: 'contain' }}
              priority
              onError={(e) => {
                // Fallback to .jpg if .png fails
                const img = e.currentTarget as HTMLImageElement;
                if (img.src.endsWith('.png')) {
                  img.src = `/products/${product.sku}/front.jpg`;
                }
              }}
            />
          </div>

          {/* Info */}
          <div>
            <p className="plt-label" style={{ color: '#666', marginBottom: '0.5rem' }}>
              SKU {product.sku}
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            {/* Coming Soon Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '12px',
              fontSize: '0.95rem',
              color: '#4CAF50',
              fontWeight: 600,
              marginBottom: '2rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Bald verfügbar
            </div>

            <p style={{ fontSize: '1rem', color: '#888', lineHeight: 1.6, marginBottom: '2rem' }}>
              Dieses Produkt befindet sich in Vorbereitung und kann noch nicht bestellt werden.
              Alle Artikel werden vollständig personalisierbar sein mit deinem eigenen Design per Sublimationsdruck.
            </p>

            {/* Back to catalog */}
            <a
              href="/categories/A"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              ← Zurück zum Katalog
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
