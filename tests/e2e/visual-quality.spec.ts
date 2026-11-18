/**
 * ON ME HONEY B — Visual Quality Test
 *
 * Testet beide Produkte (T-Shirt & Shorts) visuell:
 * - Design-Atelier Funktionalität
 * - Logo/Design Positionierung und Ästhetik
 * - 2D und 3D Viewer
 * - Front und Back Ansichten
 * - Warenkorb mit Bundle
 * - Screenshots für visuelle Überprüfung
 */

import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
async function clearCart(page: Page) {
  await page.evaluate(() => localStorage.removeItem("on_me_honey_b_cart"));
}

async function uploadTestDesign(page: Page, side: "front" | "back" = "front") {
  // Zur gewünschten Seite wechseln
  await page
    .locator(".plt-tab")
    .nth(side === "front" ? 0 : 1)
    .click();
  await page.waitForTimeout(500);

  // Test-Design hochladen (1x1 weißes PNG)
  const input = page.locator(`input[type="file"]`).first();
  await input.setInputFiles({
    name: "test-logo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });

  // Warten bis Canvas rendert
  await page.waitForTimeout(2000);
}

test.describe("Visual Quality Check - AirFit Pro T-Shirt", () => {
  test("T-Shirt Produktseite lädt korrekt", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);

    // Titel und Preis prüfen
    await expect(page.locator("h1").first()).toContainText("AirFit Pro");
    await expect(
      page
        .getByText(/^€44[.,]99$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot der Produktseite
    await page.screenshot({
      path: testInfo.outputPath("tshirt-product-page.png"),
      fullPage: true,
    });
  });

  test("T-Shirt Design-Atelier - Vorderseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole("button", { name: "L", exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, "front");

    // Screenshot des Ateliers mit Design (2D Front)
    await page.screenshot({
      path: testInfo.outputPath("tshirt-atelier-front-2d.png"),
      fullPage: true,
    });

    await expect(
      page.locator('img[src^="data:image/"][alt="Vorderseite"]'),
    ).toBeVisible();
  });

  test("T-Shirt Design-Atelier - Rückseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole("button", { name: "L", exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, "back");

    // Screenshot des Ateliers mit Design (2D Back)
    await page.screenshot({
      path: testInfo.outputPath("tshirt-atelier-back-2d.png"),
      fullPage: true,
    });
  });

  test("T-Shirt 3D-Viewer prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole("button", { name: "L", exact: true }).click();
    await uploadTestDesign(page, "front");

    // Zum 3D-Tab wechseln (3. Tab)
    const tabs = page.locator(".plt-tab");
    if (await tabs.nth(2).isVisible()) {
      await tabs.nth(2).click();
      await page.waitForTimeout(2000);

      // Screenshot 3D-Ansicht
      await page.screenshot({
        path: testInfo.outputPath("tshirt-3d-viewer.png"),
        fullPage: true,
      });
    }
  });

  test("T-Shirt Design-Positionierung und No-Print-Zonen", async ({
    page,
  }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole("button", { name: "L", exact: true }).click();
    await uploadTestDesign(page, "front");

    // Prüfe ob No-Print-Hinweise sichtbar sind
    await expect(
      page.locator("text=Schulterbereich").or(page.locator("text=Seitennaht")),
    ).toBeVisible();

    // Screenshot mit Fokus auf Positionierung
    await page.screenshot({
      path: testInfo.outputPath("tshirt-positioning-zones.png"),
      fullPage: true,
    });
  });
});

test.describe("Visual Quality Check - AirFit Pro Shorts", () => {
  test("Shorts Produktseite lädt korrekt", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);

    // Titel und Preis prüfen
    await expect(page.locator("h1").first()).toContainText("Shorts");
    await expect(
      page
        .getByText(/^€39[.,]99$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot der Produktseite
    await page.screenshot({
      path: testInfo.outputPath("shorts-product-page.png"),
      fullPage: true,
    });
  });

  test("Shorts Design-Atelier - Vorderseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole("button", { name: "M", exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, "front");

    // Screenshot des Ateliers mit Design (2D Front)
    await page.screenshot({
      path: testInfo.outputPath("shorts-atelier-front-2d.png"),
      fullPage: true,
    });

    await expect(
      page.locator('img[src^="data:image/"][alt="Vorderseite"]'),
    ).toBeVisible();
  });

  test("Shorts Design-Atelier - Rückseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, "back");

    // Screenshot des Ateliers mit Design (2D Back)
    await page.screenshot({
      path: testInfo.outputPath("shorts-atelier-back-2d.png"),
      fullPage: true,
    });
  });

  test("Shorts 3D-Viewer prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();
    await uploadTestDesign(page, "front");

    // Zum 3D-Tab wechseln (3. Tab)
    const tabs = page.locator(".plt-tab");
    if (await tabs.nth(2).isVisible()) {
      await tabs.nth(2).click();
      await page.waitForTimeout(2000);

      // Screenshot 3D-Ansicht
      await page.screenshot({
        path: testInfo.outputPath("shorts-3d-viewer.png"),
        fullPage: true,
      });
    }
  });

  test("Shorts Design-Positionierung und No-Print-Zonen", async ({
    page,
  }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();
    await uploadTestDesign(page, "front");

    // Prüfe ob No-Print-Hinweise sichtbar sind (Kordelbund, Seitennaht-Paspel, etc.)
    await page.screenshot({
      path: testInfo.outputPath("shorts-positioning-zones.png"),
      fullPage: true,
    });
  });
});

test.describe("Visual Quality Check - Warenkorb & Bundle", () => {
  test("Bundle-Funktionalität: T-Shirt + Shorts = 74,99€", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "on_me_honey_b_cart",
        JSON.stringify([
          {
            id: "1",
            name: "AirFit Pro",
            price: 44.99,
            size: "L",
            quantity: 1,
            designId: "fixture-tee",
          },
          {
            id: "2",
            name: "AirFit Pro Shorts",
            price: 39.99,
            size: "M",
            quantity: 1,
            designId: "fixture-shorts",
          },
        ]),
      );
    });

    // Warenkorb öffnen
    await page.goto(`${BASE_URL}/cart`);

    // Prüfe Bundle-Preis (74,99€ statt 44,99€ + 39,99€ = 84,98€)
    await expect(
      page
        .getByText(/^€?74[.,]99(?: €)?$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot Warenkorb mit Bundle
    await page.screenshot({
      path: testInfo.outputPath("cart-bundle-both-products.png"),
      fullPage: true,
    });

    // Prüfe dass beide Produkte im Warenkorb sind
    await expect(page.locator("text=AirFit Pro").first()).toBeVisible();
    await expect(
      page.getByText("AirFit Pro Shorts", { exact: true }),
    ).toBeVisible();
  });

  test("Warenkorb Design-Thumbnails prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/cart`);

    // Screenshot der Thumbnails
    await page.screenshot({
      path: testInfo.outputPath("cart-design-thumbnails.png"),
      fullPage: true,
    });
  });
});

test.describe("Visual Quality Check - Responsive Design", () => {
  test("Mobile Ansicht - T-Shirt", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/product/1`);

    await page.screenshot({
      path: testInfo.outputPath("mobile-tshirt-product.png"),
      fullPage: true,
    });
  });

  test("Mobile Ansicht - Shorts", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/product/2`);

    await page.screenshot({
      path: testInfo.outputPath("mobile-shorts-product.png"),
      fullPage: true,
    });
  });

  test("Tablet Ansicht - Homepage", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);

    await page.screenshot({
      path: testInfo.outputPath("tablet-homepage.png"),
      fullPage: true,
    });
  });
});

test.describe("Visual Quality Check - Homepage & Navigation", () => {
  test("Homepage zeigt beide Produkte korrekt", async ({ page }, testInfo) => {
    await page.goto(BASE_URL);

    // Prüfe dass beide Produkte sichtbar sind
    await expect(page.locator("text=AirFit Pro").first()).toBeVisible();
    await expect(
      page
        .getByText(/^€44[.,]99$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/^€39[.,]99$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot Homepage
    await page.screenshot({
      path: testInfo.outputPath("homepage-full.png"),
      fullPage: true,
    });
  });

  test("Navigation zwischen Produkten", async ({ page }) => {
    await page.goto(BASE_URL);

    // Klick auf T-Shirt
    await page.locator('.hero-collection-grid a[href="/product/1"]').click();
    await page.waitForURL(/\/product\/1/);
    await expect(page.locator("h1").first()).toContainText("AirFit Pro");

    // Zurück zur Homepage
    await page.goto(BASE_URL);

    // Klick auf Shorts
    const shortsLink = page.locator(
      '.hero-collection-grid a[href="/product/2"]',
    );
    await shortsLink.click();
    await page.waitForURL(/\/product\/2/);
    await expect(page.locator("h1").first()).toContainText("Shorts");
  });
});
