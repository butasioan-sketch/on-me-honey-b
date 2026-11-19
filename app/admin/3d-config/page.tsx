import {
  PRODUCTS_3D,
  validatePrintArea,
  type Product3DKey,
} from "@/lib/product-3d-config";
import Product3DViewer from "@/app/components/Product3DViewer";

export default function Admin3DConfigPage() {
  const keys = Object.keys(PRODUCTS_3D) as Product3DKey[];
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">3D-Produkt-Positionierung</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {keys.map((key) => {
          const p = PRODUCTS_3D[key];
          const v = validatePrintArea(key);
          return (
            <div key={key} className="border rounded-xl overflow-hidden">
              <Product3DViewer productKey={key} autoRotateDefault={true} />
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <strong>{p.label}</strong>
                  <span
                    className={p.shopLive ? "text-green-600" : "text-amber-600"}
                  >
                    {p.shopLive ? "LIVE" : "PILOT"}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  SKU {p.sku} · {p.modelPath}
                </div>
                {v.results.map((r) => (
                  <div
                    key={r.side}
                    className={`text-sm ${r.ok ? "text-green-700" : "text-red-600 font-bold"}`}
                  >
                    {r.ok ? "✅" : "❌"} {r.side}: {r.wMm}×{r.hMm} mm
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
