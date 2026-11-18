/**
 * Freigabe-Gate für `shop_live` (OPORD Phase 7.3).
 *
 * Ein SKU darf nur kaufbar sein, wenn jede Prüfung grün ist. Das Gate
 * ändert keinen Status. Es meldet, was fehlt, und der Test
 * `tests/e2e/release-gate.spec.ts` schlägt fehl, sobald irgendwo
 * `shop_live` gesetzt ist, ohne dass das Gate grün ist.
 */
import { PRODUCTS_133, type Product133 } from "@/lib/products-all-133";
import { CATALOG, PRODUCT_FAMILIES } from "@/lib/catalog/families";
import { GARMENT_PROFILES } from "@/lib/print-spec";
import { PRODUCT_FLAT } from "@/lib/pricing";

export type GateCheckId =
  | "catalog"
  | "blank"
  | "photo"
  | "runtimeId"
  | "price"
  | "printProfile"
  | "productionPath"
  | "notBlocked"
  | "jonnyOk";

export interface GateCheck {
  id: GateCheckId;
  label: string;
  ok: boolean;
  detail: string;
}

export interface GateResult {
  sku: string;
  ok: boolean;
  checks: GateCheck[];
  /** Irgendeine Quelle meldet shop_live (Register, Katalog oder Familie). */
  flaggedLive: boolean;
}

/**
 * Betreiberfreigaben. Ein Eintrag nur mit Quelle, die Jonnys OK belegt.
 * 001/015: Preise final mit Jonny-OK 21.07.2026
 * (MeinVault/ClaudeData/PREISE-UND-BUNDLE-ESSENTIAL.md, Projekt-CLAUDE.md).
 */
export const RELEASE_APPROVALS: Record<
  string,
  { date: string; source: string }
> = {
  "001": { date: "2026-07-21", source: "PREISE-UND-BUNDLE-ESSENTIAL.md" },
  "015": { date: "2026-07-21", source: "PREISE-UND-BUNDLE-ESSENTIAL.md" },
};

/** 11-in-1-Aufsätze (102–133) bleiben laut ROE gesperrt. */
export function isBlockedSku(sku: string): boolean {
  const n = Number(sku);
  return n >= 102 && n <= 133;
}

function blankOk(p: Product133): boolean {
  const b = p.blank.trim().toLowerCase();
  return b.length > 0 && !b.includes("offen");
}

export function checkReleaseGate(sku: string): GateResult {
  const reg = PRODUCTS_133.find((p) => p.sku === sku);
  const rec = CATALOG[sku];
  const family = rec ? PRODUCT_FAMILIES[rec.familyId] : undefined;
  const shopId = rec?.shopId ?? null;
  const profile = shopId ? GARMENT_PROFILES[shopId] : undefined;
  const runtimePrice = shopId ? PRODUCT_FLAT[shopId] : undefined;

  const checks: GateCheck[] = [
    {
      id: "catalog",
      label: "Im Register und im Katalog",
      ok: !!reg && !!rec,
      detail: !reg
        ? "fehlt in products-all-133"
        : !rec
          ? "fehlt in CATALOG"
          : "ok",
    },
    {
      id: "blank",
      label: "Rohling gesourct",
      ok: !!reg && blankOk(reg),
      detail: reg ? reg.blank || "leer" : "—",
    },
    {
      id: "photo",
      label: "Produktfoto",
      ok: !!reg?.hasPhoto,
      detail: reg?.hasPhoto ? "vorhanden" : "fehlt",
    },
    {
      id: "runtimeId",
      label: "Shop-ID im Katalog = Register-ID",
      ok: !!shopId && reg?.id === shopId,
      detail: shopId
        ? `shopId ${shopId}, Register-ID ${reg?.id || "leer"}`
        : "keine shopId",
    },
    {
      id: "price",
      label: "VK > 0 und gleich dem Checkout-Preis",
      ok: !!reg && reg.price > 0 && runtimePrice === reg.price,
      detail: `Register ${reg?.price ?? "—"} €, Checkout ${runtimePrice ?? "fehlt"}`,
    },
    {
      id: "printProfile",
      label: "Druckprofil vorhanden, Overlay nicht als unverifiziert markiert",
      ok: !!profile && profile.overlayVerified !== false,
      detail: !profile
        ? "kein GARMENT_PROFILE"
        : profile.overlayVerified === false
          ? "overlayVerified: false"
          : "ok",
    },
    {
      id: "productionPath",
      label: "Produktionspfad (Familie mit 3D-Modell)",
      ok: !!family?.glbPath,
      detail: family
        ? (family.glbPath ?? "Familie ohne Modell")
        : `Familie ${rec?.familyId ?? "—"} unbekannt`,
    },
    {
      id: "notBlocked",
      label: "Nicht gesperrt (11-in-1)",
      ok: !isBlockedSku(sku),
      detail: isBlockedSku(sku) ? "SKU 102–133 gesperrt" : "ok",
    },
    {
      id: "jonnyOk",
      label: "Betreiberfreigabe",
      ok: sku in RELEASE_APPROVALS,
      detail: RELEASE_APPROVALS[sku]
        ? `${RELEASE_APPROVALS[sku].date} · ${RELEASE_APPROVALS[sku].source}`
        : "fehlt",
    },
  ];

  return {
    sku,
    ok: checks.every((c) => c.ok),
    checks,
    flaggedLive:
      reg?.status === "shop_live" ||
      !!rec?.shop_live ||
      (!!family?.shop_live && !!shopId),
  };
}

export function releaseReport(): GateResult[] {
  return PRODUCTS_133.map((p) => checkReleaseGate(p.sku));
}
