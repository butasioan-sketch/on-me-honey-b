import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CATALOG,
  getProductById,
  type ProductRecord,
} from "@/lib/catalog/families";
import {
  getProduct,
  getProductName,
  getProductDescription,
  type Product,
} from "@/lib/products";

type Params = Promise<{ id: string }>;

const SITE = "https://on-me-honey-b.vercel.app";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = new Set<string>(["1", "2", ...Object.keys(CATALOG)]);
  return [...ids].map((id) => ({ id }));
}

function resolveProduct(
  id: string,
): { catalog: ProductRecord; shop?: Product } | null {
  const catalog = getProductById(id);
  if (!catalog) return null;
  if (catalog.shop_live && catalog.shopId) {
    const shop = getProduct(catalog.shopId);
    if (shop) return { catalog, shop };
  }
  return { catalog };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const resolved = resolveProduct(id);
  if (!resolved) return notFound();

  const { catalog, shop } = resolved;
  const url = `${SITE}/product/${id}`;

  if (shop) {
    const name = getProductName(shop, "de");
    const desc = getProductDescription(shop, "de");
    const price = `${shop.price.toFixed(2)} €`;
    return {
      title: `${name} — Dein Design | ON ME HONEY B`,
      description: `${name} (${price}) — ${desc}. Lade dein Motiv hoch und gestalte dein Statement-Piece.`,
      openGraph: {
        title: `${name} | ON ME HONEY B`,
        description: `${desc} Jetzt gestalten!`,
        type: "website",
        url,
      },
    };
  }

  return {
    title: `${catalog.name} — ON ME HONEY B`,
    description: `${catalog.name} (SKU ${catalog.sku}) — bald verfügbar bei ON ME HONEY B.`,
    openGraph: {
      title: `${catalog.name} | ON ME HONEY B`,
      description: "Bald verfügbar.",
      type: "website",
      url,
    },
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const resolved = resolveProduct(id);
  if (!resolved) return notFound();

  const { catalog, shop } = resolved;
  const productSchema = shop
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${getProductName(shop, "de")} — ON ME Custom ${shop.id === "2" ? "Shorts" : "Shirt"}`,
        description: `${getProductDescription(shop, "de")} Maßgefertigt auf Bestellung.`,
        brand: { "@type": "Brand", name: "ON ME HONEY B" },
        offers: {
          "@type": "Offer",
          price: String(shop.price),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2027-12-31",
          seller: { "@type": "Organization", name: "ON ME HONEY B" },
        },
        image: `${SITE}/og.png`,
      }
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: catalog.name,
        description: "Bald verfügbar.",
        brand: { "@type": "Brand", name: "ON ME HONEY B" },
        sku: catalog.sku,
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
