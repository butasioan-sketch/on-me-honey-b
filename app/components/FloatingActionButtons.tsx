'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Schwebende Action-Buttons für Home + Warenkorb
 * Immer sichtbar, auch beim Scrollen
 */
export default function FloatingActionButtons() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Cart Count aktualisieren
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('on_me_honey_b_cart') || '[]');
        const count = cart.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('focus', updateCart);

    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('focus', updateCart);
    };
  }, []);

  // Sichtbarkeit beim Scrollen
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verstecke auf Home und Cart Seite
  if (pathname === '/' || pathname === '/cart') {
    return null;
  }

  return (
    <div
      className="floating-action-buttons"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {/* Home Button */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
          color: '#000',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(212, 175, 55, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.4)';
        }}
        title="Zur Startseite"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </Link>

      {/* Cart Button */}
      <Link
        href="/cart"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: cartCount > 0
            ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
            : 'linear-gradient(135deg, #555 0%, #666 100%)',
          boxShadow: cartCount > 0
            ? '0 4px 20px rgba(76, 175, 80, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          color: '#fff',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = cartCount > 0
            ? '0 6px 30px rgba(76, 175, 80, 0.6)'
            : '0 6px 30px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = cartCount > 0
            ? '0 4px 20px rgba(76, 175, 80, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)';
        }}
        title={`Warenkorb${cartCount > 0 ? ` (${cartCount})` : ''}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>

        {/* Badge für Anzahl */}
        {cartCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              height: '24px',
              padding: '0 6px',
              borderRadius: '12px',
              background: '#FF4444',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(255, 68, 68, 0.4)',
            }}
          >
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
