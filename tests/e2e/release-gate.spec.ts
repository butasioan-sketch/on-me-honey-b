import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import {
  releaseReport,
  checkReleaseGate,
  uncoveredGaps,
  PRODUCTION_EVIDENCE,
} from "../../lib/catalog/release-gate";
import { catalogFrontSrc } from "../../lib/catalog/families";

test.describe("Freigabe-Gate shop_live", () => {
  test("no SKU is flagged shop_live without a green gate @smoke", () => {
    const report = releaseReport();
    expect(report).toHaveLength(133);
    const violations = report
      .filter((r) => r.flaggedLive && uncoveredGaps(r).length > 0)
      .map((r) => `${r.sku}: ${uncoveredGaps(r).join(", ")}`);
    expect(violations).toEqual([]);

    mkdirSync("test-results", { recursive: true });
    writeFileSync(
      "test-results/release-gate.json",
      JSON.stringify(
        report.map((r) => ({
          sku: r.sku,
          ok: r.ok,
          flaggedLive: r.flaggedLive,
          missing: r.checks.filter((c) => !c.ok).map((c) => c.id),
        })),
        null,
        2,
      ),
    );
  });

  test("001 and 015 pass, 051 and 11-in-1 stay closed @smoke", () => {
    for (const sku of ["001", "015"]) {
      const r = checkReleaseGate(sku);
      // live mit dokumentierter Ausnahme: nur der Testdruck ist offen
      expect(uncoveredGaps(r), sku).toEqual([]);
      expect(
        r.checks.filter((c) => !c.ok).map((c) => c.id),
        sku,
      ).toEqual(["physicalTestPrint"]);
    }
    const pillow = checkReleaseGate("051");
    expect(pillow.ok).toBe(false);
    expect(pillow.checks.find((c) => c.id === "price")?.ok).toBe(false);
    expect(pillow.checks.find((c) => c.id === "jonnyOk")?.ok).toBe(false);
    expect(
      checkReleaseGate("120").checks.find((c) => c.id === "notBlocked")?.ok,
    ).toBe(false);
  });

  test("every production evidence asset exists on disk @smoke", () => {
    const missing = Object.entries(PRODUCTION_EVIDENCE)
      .filter(([, e]) => !existsSync(`public${e.asset}`))
      .map(([sku, e]) => `${sku}: ${e.asset}`);
    expect(missing).toEqual([]);
  });

  test("photo flag matches a real file for every SKU @smoke", () => {
    const missing = releaseReport()
      .filter((r) => r.checks.find((c) => c.id === "photo")?.ok)
      .filter((r) => !existsSync(`public${catalogFrontSrc(r.sku)}`))
      .map((r) => r.sku);
    expect(missing).toEqual([]);
  });
});
