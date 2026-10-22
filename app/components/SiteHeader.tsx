'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './LocaleProvider';
import LocaleSwitcher from './LocaleSwitcher';
import CartCount from '@/app/components/CartCount';

export default function SiteHeader() {
  const { t } = useLocale();

  return (
    <header className="plt-header site-header">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image src="/logo.png" alt="ON ME HONEY B" width={56} height={56} style={{ borderRadius: '10px', marginRight: '0.75rem' }} priority />
        <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>ON ME</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.08em', color: '#888', textTransform: 'uppercase' }}>Premium Custom Shirts</span>
        </div>
      </Link>
      <nav className="site-header-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {/* Prominenter Home-Button */}
        <Link
          href="/"
          className="plt-nav-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontWeight: 600
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </Link>

        <Link href="/categories" className="plt-nav-link">Alle Produkte</Link>
        <Link href="/product/1" className="plt-nav-link">{t.nav.shirt}</Link>
        <Link href="/product/2" className="plt-nav-link">{t.nav.shorts}</Link>
        <Link href="/versand" className="plt-nav-link">{t.nav.shipping}</Link>
        <LocaleSwitcher />

        {/* Prominenter Warenkorb */}
        <CartCount />
      </nav>
    </header>
  );
}
