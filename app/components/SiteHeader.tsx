"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "./LocaleProvider";
import LocaleSwitcher from "./LocaleSwitcher";
import CartCount from "@/app/components/CartCount";
import { useState } from "react";

export default function SiteHeader() {
  const { t, locale } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="plt-header site-header">
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <Image
          src="/logo.png"
          alt="ON ME HONEY B"
          width={56}
          height={56}
          style={{ borderRadius: "10px", marginRight: "0.75rem" }}
          priority
        />
        <div className="brand-text">
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "#fff",
            }}
          >
            ON ME HONEY B
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "#888",
              textTransform: "uppercase",
            }}
          >
            Personalisierte Textilien
          </span>
        </div>
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menü"
        style={{ display: "none" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </>
          )}
        </svg>
      </button>

      <nav
        className="site-header-nav"
        style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
      >
        {/* Prominenter Home-Button */}
        <Link
          href="/"
          className="plt-nav-link"
          aria-label="Zur Startseite"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            fontWeight: 600,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>

        <Link href="/categories" className="plt-nav-link">
          Alle Produkte
        </Link>
        <Link href="/product/1" className="plt-nav-link">
          {t.nav.shirt}
        </Link>
        <Link href="/product/2" className="plt-nav-link">
          {t.nav.shorts}
        </Link>
        <Link href="/geschenke" className="plt-nav-link">
          {t.nav.gifts}
        </Link>
        <Link href="/so-gehts" className="plt-nav-link">
          {locale === "ro" ? "Cum funcționează" : locale === "en" ? "How it works" : "So geht's"}
        </Link>
        <LocaleSwitcher />

        {/* Prominenter Warenkorb */}
        <CartCount />
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>
              Alle Produkte
            </Link>
            <Link href="/product/1" onClick={() => setMobileMenuOpen(false)}>
              {t.nav.shirt}
            </Link>
            <Link href="/product/2" onClick={() => setMobileMenuOpen(false)}>
              {t.nav.shorts}
            </Link>
            <Link href="/geschenke" onClick={() => setMobileMenuOpen(false)}>
              {t.nav.gifts}
            </Link>
            <Link href="/so-gehts" onClick={() => setMobileMenuOpen(false)}>
              {locale === "ro" ? "Cum funcționează (video)" : locale === "en" ? "How it works (video)" : "So geht's (Video)"}
            </Link>
            <Link href="/versand" onClick={() => setMobileMenuOpen(false)}>
              {t.nav.shipping}
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
              {t.nav.cart}
            </Link>
            <div style={{ marginTop: "1rem" }}>
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
