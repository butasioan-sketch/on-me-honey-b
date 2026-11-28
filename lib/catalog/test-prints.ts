/**
 * Physische Testdrucke je SKU — die Kaufsperre hängt daran.
 *
 * Entscheidung Jonny 24.11.2026: T-Shirt und Shorts erst nach bestandenem Testdruck
 * verkaufen. Kaufbar ist eine Shop-ID nur mit Eintrag hier (Datum + Quelle, z. B.
 * Foto des Testdrucks und Waschtest im Vault). Das Freigabe-Gate
 * (lib/catalog/release-gate.ts) liest dieselbe Liste.
 *
 * Klein gehalten, damit die Produktseite sie ohne das 133er-Register laden kann.
 */
import { CATALOG } from "./families";

export interface TestPrintEvidence {
  date: string;
  source: string;
}

export const PHYSICAL_TEST_PRINTS: Record<string, TestPrintEvidence> = {
  // Beispiel: "001": { date: "2026-12-02", source: "Vault ON-ME/Testdruck-001.md (Foto + Waschtest)" },
};

export function testPrintForSku(sku: string): TestPrintEvidence | undefined {
  return PHYSICAL_TEST_PRINTS[sku];
}

/** Kaufbar nur mit belegtem Testdruck. */
export function testPrintDone(shopId: string): boolean {
  const rec = Object.values(CATALOG).find((r) => r.shopId === shopId);
  return !!rec && !!PHYSICAL_TEST_PRINTS[rec.sku];
}
