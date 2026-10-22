import React from 'react';
import Link from 'next/link';
import { Locale, getTranslation } from '@/lib/i18n';
import ProductHeroSection from './ProductHeroSection';
import TrustIcon from '@/app/components/TrustIcon';
import ReviewsSection from '@/app/components/reviews/ReviewsSection';
import NewProductsPreview from '@/app/components/NewProductsPreview';

const outdoorIcons: Record<string, React.ReactNode> = {
  climb: <path d="M4 26 L14 8 L20 18 L26 6 L30 26 Z" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />,
  run: <><circle cx="20" cy="7" r="3" fill="#D4AF37" /><path d="M17 12 L11 18 L15 22 L13 28 M17 12 L23 15 L27 12 M17 12 L18 20" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  ride: <><circle cx="9" cy="22" r="5" fill="none" stroke="#D4AF37" strokeWidth="2" /><circle cx="25" cy="22" r="5" fill="none" stroke="#D4AF37" strokeWidth="2" /><path d="M9 22 L15 12 L22 12 M15 12 L25 22 M20 8 L23 8" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  wild: <><path d="M16 4 L26 26 L6 26 Z" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" /><path d="M12 26 L16 16 L20 26" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" /></>,
};

export default function HomeView({ locale }: { locale: Locale }) {
  const t = getTranslation(locale);

  const categories = [
    { id: 'A', name: 'Bekleidung', icon: '👕', count: 31 },
    { id: 'B', name: 'Taschen', icon: '👜', count: 19 },
    { id: 'C', name: 'Wohnen', icon: '🏠', count: 27 },
    { id: 'D', name: 'Geschenke', icon: '🎁', count: 24 },
    { id: 'E', name: 'Tassen', icon: '☕', count: 15 },
    { id: 'F', name: 'Caps', icon: '🧢', count: 6 },
    { id: 'G', name: 'Teller', icon: '🍽️', count: 4 },
    { id: 'H', name: 'Stifte', icon: '✒️', count: 3 },
    { id: 'I', name: 'Schuhe', icon: '👟', count: 4 },
  ];

  return (
    <>
      <ProductHeroSection locale={locale} />

      {/* NEW PRODUCTS PREVIEW */}
      <NewProductsPreview />

      {/* Categories Section */}
      <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Entdecke alle Kategorien
            </h2>
            <p style={{ color: '#999', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              133 individuell bedruckbare Produkte – von Bekleidung bis Wohnaccessoires. 2 sofort verfügbar, 131 in Vorbereitung.
            </p>
            <Link
              href="/categories"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2.5rem',
                background: 'linear-gradient(135deg, #D4AF37, #a00014)',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              Alle Produkte ansehen →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="plt-card category-card-link"
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{cat.name}</p>
                <p style={{ color: '#888', fontSize: '0.8rem' }}>{cat.count} Produkte</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>{t.howItWorks.title}</h2>
            <p style={{ color: '#999', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>{t.howItWorks.sub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {t.howItWorks.steps.map((step) => (
              <div key={step.num} className="plt-card" style={{ padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'rgba(226,0,26,0.15)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.04em' }}>{step.num}</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.6rem' }}>{step.label}</p>
                <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>{t.outdoor.title}</h2>
            <p className="outdoor-sub" style={{ color: '#999', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 }}>{t.outdoor.sub}</p>
          </div>
          <div className="outdoor-grid">
            {t.outdoor.cards.map((c) => (
              <div key={c.key} className="plt-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <svg viewBox="0 0 32 32" width="52" height="52" style={{ marginBottom: '1.25rem' }}>{outdoorIcons[c.key]}</svg>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>{c.label}</p>
                <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>{c.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <ReviewsSection locale={locale} compact />
      </section>

      <section style={{ padding: '5rem 2rem 6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="trust-grid">
            {t.trust.map((item) => (
              <div key={item.key} className="plt-card" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                gap: '1rem', padding: '2rem 1.5rem',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: '#141414',
                  border: '1px solid rgba(226,0,26,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrustIcon name={item.key} />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{item.label}</p>
                  <p style={{ color: '#999', fontSize: '0.8rem', letterSpacing: '0.02em' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
