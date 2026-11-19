import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory, type Category } from "@/lib/products-all-133";
import SiteHeader from "@/app/components/SiteHeader";

const CATEGORY_INFO = {
  A: { name: "Bekleidung und Mode", icon: "👕" },
  B: { name: "Taschen und Accessoires", icon: "👜" },
  C: { name: "Wohnen und Dekoration", icon: "🏠" },
  D: { name: "Geschenkartikel, Büro und Technik", icon: "🎁" },
  E: { name: "Tassen, Becher und Trinkgefäße", icon: "☕" },
  F: { name: "Kappen und Kopfbedeckungen", icon: "🧢" },
  G: { name: "Teller und Keramikartikel", icon: "🍽️" },
  H: { name: "Stifte und Schreibgeräte", icon: "✒️" },
  I: { name: "Schuhe", icon: "👟" },
} as const;

const STATUS_BADGES = {
  shop_live: { label: "", color: "" },
  anker: { label: "Bald verfügbar", color: "bg-blue-100 text-blue-800" },
  pilot: { label: "In Entwicklung", color: "bg-purple-100 text-purple-800" },
  offen: { label: "In Planung", color: "bg-gray-100 text-gray-800" },
  pruefen: { label: "Wird geprüft", color: "bg-yellow-100 text-yellow-800" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryUpper = category.toUpperCase() as Category;

  if (!CATEGORY_INFO[categoryUpper]) {
    return {
      title: "Kategorie nicht gefunden",
    };
  }

  const info = CATEGORY_INFO[categoryUpper];
  const url = `/categories/${categoryUpper}`;

  return {
    alternates: { canonical: url },
    title: `${info.name} - ON ME HONEY B`,
    description: `${info.name} im Katalog von ON ME HONEY B. Entdecke Produkte zur Personalisierung und sieh, welche bereits verfügbar sind.`,
    openGraph: {
      title: `${info.name} - ON ME HONEY B`,
      description: `${info.name} im Katalog von ON ME HONEY B.`,
      url,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!["A", "B", "C", "D", "E", "F", "G", "H", "I"].includes(category)) {
    notFound();
  }

  const categoryKey = category as Category;
  const products = getProductsByCategory(categoryKey);
  const info = CATEGORY_INFO[categoryKey];

  return (
    <>
      <SiteHeader />
      <div
        style={{ padding: "3rem 2rem", maxWidth: "1400px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link
            href="/categories"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#D4AF37",
              textDecoration: "none",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            <svg
              style={{ width: "20px", height: "20px", marginRight: "0.5rem" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zurück zu allen Kategorien
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "4rem" }}>{info.icon}</div>
            <div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "0.25rem",
                }}
              >
                {info.name}
              </h1>
              <p style={{ color: "#888", fontSize: "1rem" }}>
                {products.length} Produkte
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {products.map((product) => (
            <div
              key={product.sku}
              className="plt-card"
              style={{
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: product.status === "shop_live" ? "pointer" : "default",
              }}
            >
              {/* Product Image */}
              <div
                className="category-card-photo"
                style={{
                  aspectRatio: "1",
                  background: "#1a1a1a",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={
                    product.hasPhoto
                      ? `/products/${product.sku}/front.${product.sku === "001" || product.sku === "015" ? "png" : "jpg"}`
                      : "/products/placeholder/coming-soon.svg"
                  }
                  alt={product.name.de}
                  width={400}
                  height={400}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {product.status !== "shop_live" && (
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[product.status].color}`}
                  >
                    {STATUS_BADGES[product.status].label}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: "1rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#888",
                    marginBottom: "0.25rem",
                  }}
                >
                  SKU {product.sku}
                </div>
                <h3
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                    color: "#fff",
                  }}
                >
                  {product.name.de}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  {product.status === "shop_live" && (
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {product.price.toFixed(2)} €
                    </div>
                  )}
                  {product.status === "shop_live" ? (
                    <Link
                      href={`/product/${product.id}`}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#d4af37",
                        color: "#000",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      Gestalten
                    </Link>
                  ) : (
                    <Link
                      href={`/product/${product.sku}`}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#222",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        border: "1px solid #444",
                        display: "inline-block",
                      }}
                    >
                      Ansehen
                    </Link>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #333",
                    fontSize: "0.75rem",
                    color: "#888",
                  }}
                >
                  {product.blank.replace(
                    / \((offen|pilot|anker|pruefen|Kandidat)\)/g,
                    "",
                  ).length > 40
                    ? `${product.blank.replace(/ \((offen|pilot|anker|pruefen|Kandidat)\)/g, "").substring(0, 40)}...`
                    : product.blank.replace(
                        / \((offen|pilot|anker|pruefen|Kandidat)\)/g,
                        "",
                      )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
