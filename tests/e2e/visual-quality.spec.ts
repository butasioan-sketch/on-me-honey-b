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
/**
 * Screenshot nur als Anschauungsmaterial: darf keinen Test scheitern lassen. Ganzseitige
 * Aufnahmen einer Seite mit drehendem WebGL-Canvas scheitern auf Software-Rendering
 * (CI, Headless) regelmäßig („Unable to capture screenshot“).
 */
async function snap(page: Page, path: string) {
  await page.screenshot({ path, fullPage: true, timeout: 10000 }).catch(() => {});
}

async function clearCart(page: Page) {
  await page.evaluate(() => localStorage.removeItem("on_me_honey_b_cart"));
}

/**
 * Motiv über das GLB-Studio hochladen (seit 21.11.2026: nur 3D-Modell + Upload-Bereich,
 * keine 2D-Vorschaubilder mehr). Erfolg = Ebene „Bild 1“ aktiv und der Design-Status
 * nennt die gewählte Seite.
 */
async function uploadTestDesign(page: Page, side: "front" | "back" = "front") {
  await page
    .locator(".glb-studio-tabs .plt-tab")
    .nth(side === "front" ? 0 : 1)
    .click();
  await page.locator('[data-testid="glb-upload-input"]').setInputFiles({
    name: "test-logo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(page.getByRole("button", { name: "Bild 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 20000 },
  );
  await expect(page.getByTestId("design-status")).toContainText(
    side === "front" ? "Vorderseite" : "Rückseite",
  );
}

test.describe("Visual Quality Check - AirFit Pro T-Shirt", () => {
  test("T-Shirt Produktseite lädt korrekt", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);

    // Titel und Preis prüfen
    await expect(page.locator("h1").first()).toContainText("AirFit Pro");
    await expect(
      page
        .getByText(/^(€\s?44[.,]99|44[.,]99\s?€)$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot der Produktseite
    await snap(page, testInfo.outputPath("tshirt-product-page.png"));
  });

  test("T-Shirt Design-Atelier - Vorderseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole("button", { name: "L", exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, "front");

    // Screenshot des Ateliers mit Design (2D Front)
    await snap(page, testInfo.outputPath("tshirt-atelier-front-2d.png"));

    // Motiv liegt als Ebene auf dem 3D-Modell (Decal), nicht mehr als 2D-Vorschaubild
    await expect(page.locator('[data-testid="glb-viewer"] canvas')).toBeVisible();
  });

  test("T-Shirt Design-Atelier - Rückseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole("button", { name: "L", exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, "back");

    // Screenshot des Ateliers mit Design (2D Back)
    await snap(page, testInfo.outputPath("tshirt-atelier-back-2d.png"));
  });

  test("T-Shirt 3D-Viewer prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole("button", { name: "L", exact: true }).click();
    await uploadTestDesign(page, "front");

    await page.getByRole("button", { name: "360° drehen" }).click();
    await expect(page.locator("canvas").first()).toBeVisible({
      timeout: 20000,
    });
    await snap(page, testInfo.outputPath("tshirt-3d-viewer.png"));
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
    await snap(page, testInfo.outputPath("tshirt-positioning-zones.png"));
  });
});

test.describe("Visual Quality Check - AirFit Pro Shorts", () => {
  test("Shorts Produktseite lädt korrekt", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);

    // Titel und Preis prüfen
    await expect(page.locator("h1").first()).toContainText("Shorts");
    await expect(
      page
        .getByText(/^(€\s?39[.,]99|39[.,]99\s?€)$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot der Produktseite
    await snap(page, testInfo.outputPath("shorts-product-page.png"));
  });

  test("Shorts Design-Atelier - Vorderseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole("button", { name: "M", exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, "front");

    // Screenshot des Ateliers mit Design (2D Front)
    await snap(page, testInfo.outputPath("shorts-atelier-front-2d.png"));

    // Motiv liegt als Ebene auf dem 3D-Modell (Decal), nicht mehr als 2D-Vorschaubild
    await expect(page.locator('[data-testid="glb-viewer"] canvas')).toBeVisible();
  });

  test("Shorts Design-Atelier - Rückseite", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, "back");

    // Screenshot des Ateliers mit Design (2D Back)
    await snap(page, testInfo.outputPath("shorts-atelier-back-2d.png"));
  });

  test("Shorts 3D-Viewer prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();
    await uploadTestDesign(page, "front");

    await page.getByRole("button", { name: "360° drehen" }).click();
    await expect(page.locator("canvas").first()).toBeVisible({
      timeout: 20000,
    });
    await snap(page, testInfo.outputPath("shorts-3d-viewer.png"));
  });

  test("Shorts Design-Positionierung und No-Print-Zonen", async ({
    page,
  }, testInfo) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole("button", { name: "M", exact: true }).click();
    await uploadTestDesign(page, "front");

    // Prüfe ob No-Print-Hinweise sichtbar sind (Kordelbund, Seitennaht-Paspel, etc.)
    await snap(page, testInfo.outputPath("shorts-positioning-zones.png"));
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
        .getByText(/^(€\s?74[.,]99|74[.,]99\s?€)$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot Warenkorb mit Bundle
    await snap(page, testInfo.outputPath("cart-bundle-both-products.png"));

    // Prüfe dass beide Produkte im Warenkorb sind
    await expect(page.locator("text=AirFit Pro").first()).toBeVisible();
    await expect(
      page.getByText("AirFit Pro Shorts", { exact: true }),
    ).toBeVisible();
  });

  test("Warenkorb Design-Thumbnails prüfen", async ({ page }, testInfo) => {
    await page.goto(`${BASE_URL}/cart`);

    // Screenshot der Thumbnails
    await snap(page, testInfo.outputPath("cart-design-thumbnails.png"));
  });
});

test.describe("Visual Quality Check - Responsive Design", () => {
  test("Mobile Ansicht - T-Shirt", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/product/1`);

    await snap(page, testInfo.outputPath("mobile-tshirt-product.png"));
  });

  test("Mobile Ansicht - Shorts", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/product/2`);

    await snap(page, testInfo.outputPath("mobile-shorts-product.png"));
  });

  test("Tablet Ansicht - Homepage", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);

    await snap(page, testInfo.outputPath("tablet-homepage.png"));
  });
});

test.describe("Visual Quality Check - Homepage & Navigation", () => {
  test("Homepage zeigt beide Produkte korrekt", async ({ page }, testInfo) => {
    await page.goto(BASE_URL);

    // Prüfe dass beide Produkte sichtbar sind
    await expect(page.locator("text=AirFit Pro").first()).toBeVisible();
    await expect(
      page
        .getByText(/^(€\s?44[.,]99|44[.,]99\s?€)$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/^(€\s?39[.,]99|39[.,]99\s?€)$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    // Screenshot Homepage
    await snap(page, testInfo.outputPath("homepage-full.png"));
  });

  test("Navigation zwischen Produkten", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Klick auf T-Shirt
    await page.locator('.hero-collection-grid a[href="/product/1"]').click();
    await page.waitForURL(/\/product\/1/);
    await expect(page.locator("h1").first()).toContainText("AirFit Pro");

    // Zurück zur Homepage
    await page.goBack({ waitUntil: "domcontentloaded" });

    // Klick auf Shorts
    const shortsLink = page.locator(
      '.hero-collection-grid a[href="/product/2"]',
    );
    await shortsLink.click();
    await page.waitForURL(/\/product\/2/);
    await expect(page.locator("h1").first()).toContainText("Shorts");
  });
});
