import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/site-url";
import {
  CATALOG,
  catalogFrontSrc,
  getProductById,
  type ProductRecord,
} from "@/lib/catalog/families";
import {
  getProduct,
  getProductName,
  getProductDescription,
  type Product,
} from "@/lib/products";
import { formatEuro } from "@/lib/format-price";

type Params = Promise<{ id: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = new Set(Object.keys(CATALOG));
  for (const { shopId } of Object.values(CATALOG)) {
    if (shopId) ids.add(shopId);
  }
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
  const url = `/product/${shop?.id ?? catalog.sku}`;

  if (shop) {
    const name = getProductName(shop, "de");
    const desc = getProductDescription(shop, "de");
    const price = formatEuro(shop.price, "de");
    return {
      alternates: { canonical: url },
      title: `${name} — Dein Design | ON ME HONEY B`,
      description: `${name} (${price}) — ${desc}. Lade dein Motiv hoch und gestalte dein Statement-Piece.`,
      openGraph: {
        title: `${name} | ON ME HONEY B`,
        description: `${desc} Jetzt gestalten!`,
        type: "website",
        url,
        images: [{ url: catalogFrontSrc(catalog.sku), alt: name }],
      },
    };
  }

  return {
    alternates: { canonical: url },
    title: `${catalog.name} — ON ME HONEY B`,
    description: `${catalog.name} (SKU ${catalog.sku}) — bald verfügbar bei ON ME HONEY B.`,
    // Noch nicht bestellbar: dünne Vorschauseite, nicht in der Sitemap → nicht indexieren,
    // Links aber verfolgen. Entfällt automatisch, sobald shop_live gesetzt ist.
    robots: { index: false, follow: true },
    openGraph: {
      title: `${catalog.name} | ON ME HONEY B`,
      description: "Bald verfügbar.",
      type: "website",
      url,
      images: [{ url: catalogFrontSrc(catalog.sku), alt: catalog.name }],
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
        name: getProductName(shop, "de"),
        description: `${getProductDescription(shop, "de")} Maßgefertigt auf Bestellung.`,
        brand: { "@type": "Brand", name: "ON ME HONEY B" },
        offers: {
          "@type": "Offer",
          price: String(shop.price),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/product/${shop.id}`,
          seller: { "@type": "Organization", name: "ON ME HONEY B" },
        },
        sku: catalog.sku,
        image: new URL(catalogFrontSrc(catalog.sku), siteUrl).href,
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {children}
    </>
  );
}
