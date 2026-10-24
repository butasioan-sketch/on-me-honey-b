import { notFound } from "next/navigation";
/* eslint-disable */
import { getProductBySKU } from "@/lib/products-all-133";
import Link from "next/link";

const STATUS_INFO = {
  shop_live: {
    label: "Shop Live",
    color: "bg-green-100 text-green-800",
    desc: "Produkt ist im Shop aktiv",
  },
  anker: {
    label: "Anker",
    color: "bg-blue-100 text-blue-800",
    desc: "Anker-EK vorhanden, noch nicht bestellt",
  },
  pilot: {
    label: "Pilot",
    color: "bg-purple-100 text-purple-800",
    desc: "In Entwicklung, Testphase",
  },
  offen: {
    label: "Offen",
    color: "bg-gray-100 text-gray-800",
    desc: "EK unbekannt, Blank nicht gesourct",
  },
  pruefen: {
    label: "Prüfen",
    color: "bg-yellow-100 text-yellow-800",
    desc: "11-in-1-Aufsatz unbewiesen",
  },
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const product = getProductBySKU(sku);

  if (!product) {
    notFound();
  }

  const statusInfo = STATUS_INFO[product.status];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
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
        Zurück zur Übersicht
      </Link>

      <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gray-50 border-b-2 border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-2">
                SKU {product.sku}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name.de}</h1>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                <span className="text-sm text-gray-600">{statusInfo.desc}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {product.price.toFixed(2)} €
              </div>
              <div className="text-sm text-gray-500">VK Shop</div>
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="p-8 border-b-2 border-gray-100">
          <h2 className="text-lg font-bold mb-4">Produktbild</h2>
          <div className="aspect-square max-w-md mx-auto bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={
                product.sku === "001"
                  ? "/airfit-front-t.png"
                  : product.sku === "015"
                    ? "/airfit-shorts-front.png"
                    : "/products/placeholder/coming-soon.svg"
              }
              alt={product.name.de}
              className="w-full h-full object-cover"
            />
          </div>
          {product.sku !== "001" && product.sku !== "015" && (
            <p className="text-center text-gray-500 mt-4">
              ⚠️ Platzhalter-Bild — Echtes Foto fehlt
            </p>
          )}
        </div>

        {/* Product Details */}
        <div className="p-8 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Kategorie
            </h3>
            <p className="text-lg font-medium">{product.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Familie
            </h3>
            <p className="text-lg font-medium">{product.family}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Print Shape
            </h3>
            <p className="text-lg font-medium">{product.printShape}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Machbarkeit
            </h3>
            <p className="text-lg font-medium">{product.machbarkeit}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Gewicht
            </h3>
            <p className="text-lg font-medium">{product.weightGsm} g/m²</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Seiten
            </h3>
            <p className="text-lg font-medium">{product.sides}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Blank-Artikel
            </h3>
            <p className="text-lg font-medium">{product.blank}</p>
          </div>
        </div>

        {/* Features */}
        <div className="p-8 bg-gray-50 border-t-2 border-gray-100">
          <h3 className="text-lg font-bold mb-4">Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-lg ${product.hasGLB ? "bg-green-100" : "bg-gray-100"}`}
            >
              <div className="text-2xl mb-2">{product.hasGLB ? "✓" : "✗"}</div>
              <div className="text-sm font-semibold">3D-Modell (GLB)</div>
            </div>
            <div
              className={`p-4 rounded-lg ${product.hasPhoto ? "bg-green-100" : "bg-gray-100"}`}
            >
              <div className="text-2xl mb-2">
                {product.hasPhoto ? "✓" : "✗"}
              </div>
              <div className="text-sm font-semibold">Echtes Foto</div>
            </div>
            <div
              className={`p-4 rounded-lg ${product.status === "shop_live" ? "bg-green-100" : "bg-gray-100"}`}
            >
              <div className="text-2xl mb-2">
                {product.status === "shop_live" ? "✓" : "✗"}
              </div>
              <div className="text-sm font-semibold">Shop-Aktiv</div>
            </div>
            <div
              className={`p-4 rounded-lg ${product.id ? "bg-green-100" : "bg-gray-100"}`}
            >
              <div className="text-2xl mb-2">{product.id ? "✓" : "✗"}</div>
              <div className="text-sm font-semibold">Shop-ID</div>
            </div>
          </div>
        </div>

        {/* Ready for Live Checklist */}
        <div className="p-8 border-t-2 border-gray-100">
          <h3 className="text-lg font-bold mb-4">Ready for Live Checkliste</h3>
          <div className="space-y-2">
            <ChecklistItem
              done={!!product.blank && !product.blank.includes("(offen)")}
              label="Blank-Artikel gesourct"
            />
            <ChecklistItem
              done={product.hasPhoto}
              label="Produktfoto vorhanden"
            />
            <ChecklistItem
              done={product.hasGLB || product.printShape !== "a4_flat"}
              label="3D-Modell oder 2D-only"
            />
            <ChecklistItem
              done={product.status === "shop_live"}
              label="Status = shop_live"
            />
            <ChecklistItem done={!!product.id} label="Shop-ID vergeben" />
            <ChecklistItem
              done={product.machbarkeit !== "pruefen"}
              label="Machbarkeit bestätigt"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
      >
        {done ? "✓" : "○"}
      </div>
      <span className={`text-sm ${done ? "text-gray-900" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}
