import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory, type Category } from "@/lib/products-all-133";

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
  const products = getProductsByCategory(categoryUpper);

  return {
    title: `${info.name} - ON ME HONEY B`,
    description: `${products.length} individuell bedruckbare ${info.name} Produkte. Premium AirFit Performance Fabric. Jetzt entdecken!`,
    openGraph: {
      title: `${info.name} - ON ME HONEY B`,
      description: `${products.length} individuell bedruckbare Produkte`,
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
    <div style={{ padding: "3rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <div className="p-4">
              <div className="text-xs text-gray-400 mb-1">
                SKU {product.sku}
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white group-hover:text-[#d4af37] transition-colors">
                {product.name.de}
              </h3>
              <div className="flex items-baseline justify-between">
                {product.status === "shop_live" && (
                  <div className="text-2xl font-bold text-white">
                    {product.price.toFixed(2)} €
                  </div>
                )}
                {product.status === "shop_live" ? (
                  <Link
                    href={`/product/${product.id}`}
                    className="px-4 py-2 bg-[#d4af37] text-black rounded-lg text-sm font-semibold hover:bg-[#c09b2f] transition-colors"
                  >
                    Gestalten
                  </Link>
                ) : (
                  <Link
                    href={`/product/${product.sku}`}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold border border-gray-600 hover:border-[#d4af37] transition-colors"
                  >
                    Ansehen
                  </Link>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                {product.blank.length > 40
                  ? `${product.blank.substring(0, 40)}...`
                  : product.blank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
