"use client";

import dynamic from "next/dynamic";
import SiteHeader from "./SiteHeader";
import { categoryForSku, type ProductRecord } from "@/lib/catalog/families";
import { PREVIEW_PROFILE_ID } from "@/lib/print-spec";

const GlbStudio = dynamic(() => import("./GlbStudio"), {
  ssr: false,
  loading: () => <div className="glb-studio-viewer" role="status" aria-label="3D-Modell lädt" />,
});

/**
 * Katalogartikel (shop_live=false): nur 3D-Modell + Upload-Vorschau (Jonny 21.11.2026).
 * Keine Produktfotos, kein Kauf.
 */
export default function CatalogProductView({ product }: { product: ProductRecord }) {
  const category = categoryForSku(product.sku);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <SiteHeader />

      <main className="glb-product">
        <GlbStudio
          profileId={PREVIEW_PROFILE_ID}
          modelPath={`/models/sku/${product.sku}-v1.glb`}
          productName={product.name}
          previewOnly
        />

        <div className="glb-product-buy">
          <p className="plt-label" style={{ color: "#a0a0a0", margin: 0 }}>
            SKU {product.sku}
          </p>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              margin: 0,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              margin: 0,
              padding: "0.6rem 1rem",
              background: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "12px",
              color: "#6fcf73",
              fontWeight: 600,
            }}
          >
            Bald verfügbar
          </p>
          <a href={category ? `/categories/${category}` : "/"} className="plt-btn-secondary" style={{ alignSelf: "flex-start", textDecoration: "none" }}>
            ← Zurück zum Katalog
          </a>
        </div>
      </main>
    </div>
  );
}
