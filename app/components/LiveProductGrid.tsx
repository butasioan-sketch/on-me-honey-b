"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product133 } from "@/lib/products-all-133";
import { catalogFrontSrc } from "@/lib/catalog/families";
import { useLocale } from "@/app/components/LocaleProvider";

const LABELS = {
  de: {
    cta: "Jetzt gestalten →",
    empty: "Die Auswahl wird gerade zusammengestellt.",
    all: "Alle Produkte ansehen",
  },
  ro: {
    cta: "Creează acum →",
    empty: "Selecția este în curs de pregătire.",
    all: "Vezi toate produsele",
  },
  en: {
    cta: "Design now →",
    empty: "The selection is being put together.",
    all: "View all products",
  },
} as const;

const NUMBER_LOCALE = { de: "de-DE", ro: "ro-RO", en: "en-IE" } as const;

/** Raster für kaufbare Artikel (Saison- und Geschenkseiten). */
export default function LiveProductGrid({
  products,
}: {
  products: Product133[];
}) {
  const { locale } = useLocale();
  const l = LABELS[locale];
  const euro = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: "currency",
    currency: "EUR",
  });

  if (products.length === 0) {
    return (
      <p style={{ color: "#aaa" }}>
        {l.empty}{" "}
        <Link href="/categories" style={{ color: "#D4AF37" }}>
          {l.all}
        </Link>
      </p>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {products.map((product) => (
        <Link
          key={product.sku}
          href={`/product/${product.id}`}
          className="plt-card live-product-card"
          style={{
            display: "block",
            overflow: "hidden",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              aspectRatio: "1",
              background: "#1a1a1a",
              position: "relative",
            }}
          >
            <Image
              src={catalogFrontSrc(product.sku)}
              alt={product.name[locale]}
              width={400}
              height={400}
              sizes="(max-width: 600px) 100vw, 300px"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ padding: "1rem" }}>
            <h3
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: "0.25rem",
              }}
            >
              {product.name[locale]}
            </h3>
            <p style={{ color: "#D4AF37", fontWeight: 700 }}>
              {euro.format(product.price)}
            </p>
            <p
              style={{
                color: "#aaa",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            >
              {l.cta}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
