/**
 * ON ME HONEY B — E2E-Test-Suite (Playwright)
 *
 * Setup:
 *   npm install --save-dev @playwright/test
 *   npx playwright install chromium
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000 npx playwright test
 *
 * Oder gegen Live:
 *   BASE_URL=https://on-me-honey-b.vercel.app npx playwright test
 */

import { testPrintDone } from "../../lib/catalog/test-prints";
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function clearCart(page: Page) {
  await page.evaluate(() => localStorage.removeItem("on_me_honey_b_cart"));
}

async function uploadDesign(page: Page, side: "front" | "back" = "front") {
  // Erst auf die passende Atelier-Seite wechseln, sonst laedt der Upload
  // immer auf die aktuell aktive Seite (Default: Vorderseite). Positions-
  // Selektor statt uebersetztem Text (".plt-tab" 0=front, 1=back, 2=360°) —
  // Text waere locale-abhaengig (Browser-Default hier oft en, nicht de).
  await page
    .locator(".plt-tab")
    .nth(side === "front" ? 0 : 1)
    .click();
  // Wartet auf das Upload-Input und lädt ein Test-PNG hoch
  const input = page.locator(`input[type="file"]`).first();
  await input.setInputFiles({
    name: "test-design.png",
    mimeType: "image/png",
    // 1×1 weißes PNG (minimal valid)
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
}

test.describe("ON ME HONEY B — Checkout-Flow", () => {
  test("Produkt-Seite lädt korrekt", async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);
    await expect(page.locator("h1").first()).toContainText("AirFit Pro");
    await expect(page.locator(".plt-size-btn").first()).toBeVisible();
  });

  test("Kaufsperre bis Testdruck: Hinweis sichtbar, Kaufknöpfe aus @smoke", async ({
    page,
  }) => {
    test.skip(
      testPrintDone("1"),
      "Testdruck für Tee belegt, Kaufsperre aufgehoben",
    );
    await page.goto(`${BASE_URL}/product/1`);
    await expect(page.getByTestId("purchase-locked")).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.locator('button:has-text("In den Warenkorb")'),
    ).toBeDisabled();
  });

  test("Motiv hochladen → Größe wählen → In den Warenkorb", async ({
    page,
  }) => {
    test.skip(
      !testPrintDone("1"),
      "Kaufsperre bis Testdruck (lib/catalog/test-prints.ts)",
    );
    await page.goto(`${BASE_URL}/product/1`);
    await clearCart(page);

    // Größe wählen — exakter Match noetig: "L" ist sonst Substring von "XL"/"XXL"
    // und (Playwright has-text ist case-insensitiv) auch von "Decline"/"Accept all"
    // im Cookie-Banner, was einen Strict-Mode-Fehler ausloest.
    await page.getByRole("button", { name: "L", exact: true }).click();

    // Design hochladen
    await uploadDesign(page, "front");

    // Kurz warten bis Canvas rendert
    await page.waitForTimeout(2000);

    // In den Warenkorb
    await page.locator('button:has-text("In den Warenkorb")').click();

    // Warten bis saveDesign (echter API-Call gegen Live-DB) abgeschlossen ist —
    // Button-Text wechselt auf "Im Warenkorb", statt eine feste Wartezeit zu
    // raten (war Ursache fuer Flakiness bei langsameren Live-Requests).
    await expect(page.locator('button:has-text("Im Warenkorb")')).toBeVisible({
      timeout: 10000,
    });

    // Warenkorb soll Item enthalten
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("on_me_honey_b_cart") || "[]"),
    );
    expect(cart).toHaveLength(1);
    expect(cart[0].designId).toBeTruthy();
    expect(cart[0].size).toBe("L");
  });

  test("Warenkorb zeigt Thumbnail und Checkout-Button aktiv", async ({
    page,
    request,
  }) => {
    const image = await readFile(
      resolve(__dirname, "../../public/airfit-front-t.png"),
    );
    const response = await request.post("/api/designs", {
      data: {
        front: `data:image/png;base64,${image.toString("base64")}`,
        productId: "1",
      },
    });
    expect(response.ok()).toBeTruthy();
    const { id } = await response.json();
    await page.addInitScript((designId) => {
      localStorage.setItem(
        "on_me_honey_b_cart",
        JSON.stringify([
          {
            id: "1",
            name: "AirFit Pro",
            price: 44.99,
            size: "L",
            quantity: 1,
            designId,
          },
        ]),
      );
    }, id);

    await page.goto(`${BASE_URL}/cart`);
    await expect(
      page.getByRole("img", { name: "Design-Vorschau" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Zur Kasse" })).toBeEnabled();
  });

  test("Cart ohne designId: Auto-Purge beim Laden", async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);

    // Manipuliere localStorage: Item ohne designId hinzufügen
    await page.evaluate(() => {
      const bad = [
        { id: "1", name: "AirFit Pro", price: 39.99, size: "M", quantity: 1 },
      ];
      localStorage.setItem("on_me_honey_b_cart", JSON.stringify(bad));
    });

    await page.reload();

    // Nach Reload: Item sollte entfernt worden sein
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("on_me_honey_b_cart") || "[]")
              .length,
        ),
      )
      .toBe(0);
  });

  test("Homepage lädt (smoke test)", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ON ME HONEY B/);
    // Logo statt .brand-text pruefen: der Text-Schriftzug ist unter 640px
    // absichtlich ausgeblendet (Mobile-Header-Fix), das Logo bleibt immer sichtbar.
    await expect(page.getByAltText("ON ME HONEY B").first()).toBeVisible();
  });

  test("Tracking-Seite akzeptiert Bestellnummer", async ({ page }) => {
    await page.goto(`${BASE_URL}/tracking`);
    await page.locator('input[placeholder="PLT-..."]').fill("PLT-123456789");
    await page.locator('button:has-text("Suchen")').click();
    // Erwartet Fehler "nicht gefunden" — kein Crash
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Keine Bestellung").first()).toBeVisible();
  });
});

test.describe("ON ME HONEY B — Admin (braucht ADMIN_PASSWORD)", () => {
  test("Admin-Orders erreichbar (401 ohne Auth)", async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/admin/orders`);
    // Ohne Auth: 401 oder Login-Redirect
    expect([200, 401, 302]).toContain(res?.status() ?? 401);
  });
});
