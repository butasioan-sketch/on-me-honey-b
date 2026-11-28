/**
 * Freigabe-Gate für `shop_live` (OPORD Phase 7.3).
 *
 * Ein SKU darf nur kaufbar sein, wenn jede Prüfung grün ist. Das Gate
 * ändert keinen Status. Es meldet, was fehlt, und der Test
 * `tests/e2e/release-gate.spec.ts` schlägt fehl, sobald irgendwo
 * `shop_live` gesetzt ist, ohne dass das Gate grün ist.
 */
import { PRODUCTS_133, type Product133 } from "@/lib/products-all-133";
import {
  CATALOG,
  getAtelierModelPath,
  PRODUCT_FAMILIES,
} from "@/lib/catalog/families";
import { GARMENT_PROFILES } from "@/lib/print-spec";
import { PRODUCT_FLAT } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { testPrintForSku } from "@/lib/catalog/test-prints";

export { testPrintDone } from "@/lib/catalog/test-prints";

export type GateCheckId =
  | "catalog"
  | "blank"
  | "photo"
  | "runtimeId"
  | "price"
  | "printProfile"
  | "productionPath"
  | "physicalTestPrint"
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

export interface Evidence {
  date: string;
  source: string;
}

/**
 * Belegter Produktionspfad je SKU. Ohne Eintrag kein shop_live.
 * - "3d": geprüftes GLB der Familie (glb-verify / Live=Git-Messung).
 * - "2d": validiertes Produktfoto plus Druckvorlage, kein 3D nötig.
 * physicalTestPrint: echter Testdruck gegen Vorschau/PDF (Pflicht).
 * blockLifted: nur für 102–133, aufgehobene 11-in-1-Sperre mit Beleg.
 */
export interface ProductionEvidence {
  mode: "3d" | "2d";
  /** GLB-Pfad (3d) oder Foto/Druckvorlage (2d), relativ zu public/. */
  asset: string;
  assetCheck: Evidence;
  physicalTestPrint?: Evidence;
  blockLifted?: Evidence;
}

export const PRODUCTION_EVIDENCE: Record<string, ProductionEvidence> = {
  "001": {
    mode: "3d",
    asset: "/models/shirt-white-v2.glb",
    assetCheck: {
      date: "2026-10-23",
      source: "OPORD 1.4: Live = Git 261040 B",
    },
  },
  "015": {
    mode: "3d",
    asset: "/models/shorts-white-v1.glb",
    assetCheck: { date: "2026-10-23", source: "OPORD 1.4: Live = Git 61780 B" },
  },
};

/**
 * Bekannte Ausnahmen für bereits live geschaltete SKUs. Nur die genannten
 * Prüfungen dürfen offen sein; jede weitere Lücke lässt den Test scheitern.
 */
export const LIVE_EXCEPTIONS: Record<
  string,
  { open: GateCheckId[]; reason: string }
> = {
  "001": {
    open: ["physicalTestPrint"],
    reason: "Live seit 07/2026, physischer Testdruck offen (Projekt-CLAUDE.md)",
  },
  "015": {
    open: ["physicalTestPrint"],
    reason: "Live seit 07/2026, physischer Testdruck offen (Projekt-CLAUDE.md)",
  },
};

/** 11-in-1-Aufsätze (102–133) bleiben laut ROE gesperrt. */
export function isBlockedSku(sku: string): boolean {
  const n = Number(sku);
  return n >= 102 && n <= 133;
}

function blankOk(p: Product133): boolean {
  const b = p.blank.trim().toLowerCase();
  return b.length > 0 && !/offen|kandidat/.test(b);
}

export function checkReleaseGate(sku: string): GateResult {
  const reg = PRODUCTS_133.find((p) => p.sku === sku);
  const rec = CATALOG[sku];
  const family = rec ? PRODUCT_FAMILIES[rec.familyId] : undefined;
  const shopId = rec?.shopId ?? null;
  const profile = shopId ? GARMENT_PROFILES[shopId] : undefined;
  const runtimeProduct = shopId ? getProduct(shopId) : undefined;
  const runtimePrice = shopId ? PRODUCT_FLAT[shopId] : undefined;
  const evidence = PRODUCTION_EVIDENCE[sku];
  const atelierPath = rec ? getAtelierModelPath(rec) : null;
  const pathOk =
    !!evidence &&
    (evidence.mode === "3d"
      ? atelierPath === evidence.asset
      : !!reg?.hasPhoto && evidence.asset.length > 0);

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
      label: "Aktives Laufzeitprodukt mit passender Katalog- und Register-ID",
      ok: !!runtimeProduct && reg?.id === shopId,
      detail: shopId
        ? `shopId ${shopId}, Register-ID ${reg?.id || "leer"}, Laufzeitprodukt ${runtimeProduct ? "aktiv" : "fehlt"}`
        : "keine shopId",
    },
    {
      id: "price",
      label: "VK > 0 und gleich Produktseiten- und Checkout-Preis",
      ok:
        !!reg &&
        reg.price > 0 &&
        runtimePrice === reg.price &&
        runtimeProduct?.price === reg.price,
      detail: `Register ${reg?.price ?? "—"} €, Produktseite ${runtimeProduct?.price ?? "fehlt"}, Checkout ${runtimePrice ?? "fehlt"}`,
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
      label: "Belegter Produktionspfad (3D geprüft oder Foto + 2D)",
      ok: pathOk,
      detail: !evidence
        ? "kein Nachweis"
        : evidence.mode === "3d" && atelierPath !== evidence.asset
          ? `3D-Nachweis ${evidence.asset} passt nicht zum Atelier-Modell (${atelierPath ?? "ohne Modell"})`
          : `${evidence.mode.toUpperCase()} · ${evidence.asset} · ${evidence.assetCheck.date} ${evidence.assetCheck.source}`,
    },
    {
      id: "physicalTestPrint",
      label: "Physischer Testdruck gegen Vorschau und PDF",
      ok: !!(evidence?.physicalTestPrint ?? testPrintForSku(sku)),
      detail: (() => {
        const tp = evidence?.physicalTestPrint ?? testPrintForSku(sku);
        return tp ? `${tp.date} · ${tp.source}` : "fehlt";
      })(),
    },
    {
      id: "notBlocked",
      label: "Nicht gesperrt (11-in-1) oder Sperre belegt aufgehoben",
      ok: !isBlockedSku(sku) || !!evidence?.blockLifted,
      detail: !isBlockedSku(sku)
        ? "ok"
        : evidence?.blockLifted
          ? `aufgehoben ${evidence.blockLifted.date} · ${evidence.blockLifted.source}`
          : "SKU 102–133 gesperrt",
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

/** Offene Prüfungen, die nicht durch LIVE_EXCEPTIONS gedeckt sind. */
export function uncoveredGaps(result: GateResult): GateCheckId[] {
  const allowed = LIVE_EXCEPTIONS[result.sku]?.open ?? [];
  return result.checks
    .filter((c) => !c.ok && !allowed.includes(c.id))
    .map((c) => c.id);
}

export function releaseReport(): GateResult[] {
  return PRODUCTS_133.map((p) => checkReleaseGate(p.sku));
}
