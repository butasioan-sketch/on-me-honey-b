import raw from "@/data/products-3d.json";

export type Product3DKey = keyof typeof raw.products;

export interface Product3DConfig {
  sku: string;
  shopId: string;
  label: string;
  modelPath: string;
  physicalMm: { width: number; height: number };
  camera: {
    position: [number, number, number];
    fov: number;
    target: [number, number, number];
  };
  animation: {
    rotateSpeedRadPerSec: number;
    floatAmpM: number;
    floatFreqHz: number;
  };
  overlay: Record<
    "front" | "back",
    { x: number; y: number; w: number; h: number } | undefined
  >;
  shopLive: boolean;
  note?: string;
}

export const PRODUCTS_3D = raw.products as unknown as Record<
  Product3DKey,
  Product3DConfig
>;
export const A4 = raw.a4;

/** Prüft, ob das Overlay physisch ≤ A4 ist. */
export function validatePrintArea(key: Product3DKey) {
  const p = PRODUCTS_3D[key];
  const results: Array<{
    side: string;
    wMm: number;
    hMm: number;
    ok: boolean;
  }> = [];
  for (const [side, ov] of Object.entries(p.overlay)) {
    if (!ov) continue;
    const wMm = (ov.w / 100) * p.physicalMm.width;
    const hMm = (ov.h / 100) * p.physicalMm.height;
    const ok = wMm <= A4.widthMm + 0.5 && hMm <= A4.heightMm + 0.5;
    results.push({ side, wMm: Math.round(wMm), hMm: Math.round(hMm), ok });
  }
  return { product: key, results, allOk: results.every((r) => r.ok) };
}
