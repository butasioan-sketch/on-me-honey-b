import { expect, test } from "@playwright/test";
import { CATALOG } from "../../lib/catalog/families";
import {
  PRINT_METHODS,
  allowedPrintMethods,
  isSublimationOnlyFamily,
  printMethodForSku,
} from "../../lib/print-method";
import { GARMENT_PROFILES } from "../../lib/print-spec";

// Reine Logik-Prüfung, kein Browser nötig.
test.describe("Druckverfahren Sublimation / DTF", () => {
  const records = Object.values(CATALOG);

  test("alle 133 SKUs bekommen ein erlaubtes Verfahren", () => {
    expect(records.length).toBe(133);
    for (const r of records) {
      const m = printMethodForSku(r.sku, String(r.familyId));
      expect(allowedPrintMethods(String(r.familyId)), `SKU ${r.sku}`).toContain(
        m,
      );
    }
  });

  test("Hartware und Tassen werden nie mit DTF gedruckt", () => {
    for (const r of records) {
      if (isSublimationOnlyFamily(String(r.familyId))) {
        expect(
          printMethodForSku(r.sku, String(r.familyId)),
          `SKU ${r.sku}`,
        ).toBe("sublimation");
      }
    }
  });

  test("verkaufte Produkte bleiben Sublimation", () => {
    for (const sku of ["001", "015", "051"]) {
      expect(printMethodForSku(sku, String(CATALOG[sku].familyId))).toBe(
        "sublimation",
      );
    }
    for (const [id, profile] of Object.entries(GARMENT_PROFILES)) {
      expect(profile.method, `Profil ${id}`).toBe("sublimation");
    }
  });

  test("Baumwoll-Textilien bekommen DTF", () => {
    for (const sku of ["002", "003", "021", "022", "032", "117"]) {
      expect(
        printMethodForSku(sku, String(CATALOG[sku].familyId)),
        `SKU ${sku}`,
      ).toBe("dtf");
    }
  });

  test("DTF-Druckblatt ist transparent und PNG", () => {
    expect(PRINT_METHODS.dtf.sheetBackground).toBeNull();
    expect(PRINT_METHODS.dtf.sheetFormat).toBe("png");
    expect(PRINT_METHODS.sublimation.sheetBackground).toBe("#ffffff");
    expect(PRINT_METHODS.sublimation.sheetFormat).toBe("jpeg");
  });
});
