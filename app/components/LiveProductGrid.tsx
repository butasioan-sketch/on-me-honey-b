import Image from "next/image";
import Link from "next/link";
import type { Product133 } from "@/lib/products-all-133";
import { catalogFrontSrc } from "@/lib/catalog/families";

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

/** Raster für kaufbare Artikel (Saison- und Geschenkseiten). */
export default function LiveProductGrid({
  products,
}: {
  products: Product133[];
}) {
  if (products.length === 0) {
    return (
      <p style={{ color: "#aaa" }}>
        Die Auswahl wird gerade zusammengestellt.{" "}
        <Link href="/categories" style={{ color: "#D4AF37" }}>
          Alle Produkte ansehen
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
              alt={product.name.de}
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
              {product.name.de}
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
              Jetzt gestalten →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
