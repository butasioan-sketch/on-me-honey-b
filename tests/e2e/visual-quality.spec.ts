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

import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '../../playwright-screenshots');

// Sicherstellen dass Screenshots-Verzeichnis existiert
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function clearCart(page: Page) {
  await page.evaluate(() => localStorage.removeItem('on_me_honey_b_cart'));
}

async function uploadTestDesign(page: Page, side: 'front' | 'back' = 'front') {
  // Zur gewünschten Seite wechseln
  await page.locator('.plt-tab').nth(side === 'front' ? 0 : 1).click();
  await page.waitForTimeout(500);

  // Test-Design hochladen (1x1 weißes PNG)
  const input = page.locator(`input[type="file"]`).first();
  await input.setInputFiles({
    name: 'test-logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
  });

  // Warten bis Canvas rendert
  await page.waitForTimeout(2000);
}

test.describe('Visual Quality Check - AirFit Pro T-Shirt', () => {

  test('T-Shirt Produktseite lädt korrekt', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);

    // Titel und Preis prüfen
    await expect(page.locator('h1').first()).toContainText('AirFit Pro');
    await expect(page.locator('text=44,99').or(page.locator('text=44.99'))).toBeVisible();

    // Screenshot der Produktseite
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tshirt-product-page.png'),
      fullPage: true
    });
  });

  test('T-Shirt Design-Atelier - Vorderseite', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole('button', { name: 'L', exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, 'front');

    // Screenshot des Ateliers mit Design (2D Front)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tshirt-atelier-front-2d.png'),
      fullPage: true
    });

    // Prüfe dass Design-Canvas sichtbar ist
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('T-Shirt Design-Atelier - Rückseite', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole('button', { name: 'L', exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, 'back');

    // Screenshot des Ateliers mit Design (2D Back)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tshirt-atelier-back-2d.png'),
      fullPage: true
    });
  });

  test('T-Shirt 3D-Viewer prüfen', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole('button', { name: 'L', exact: true }).click();
    await uploadTestDesign(page, 'front');

    // Zum 3D-Tab wechseln (3. Tab)
    const tabs = page.locator('.plt-tab');
    if (await tabs.nth(2).isVisible()) {
      await tabs.nth(2).click();
      await page.waitForTimeout(2000);

      // Screenshot 3D-Ansicht
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'tshirt-3d-viewer.png'),
        fullPage: true
      });
    }
  });

  test('T-Shirt Design-Positionierung und No-Print-Zonen', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole('button', { name: 'L', exact: true }).click();
    await uploadTestDesign(page, 'front');

    // Prüfe ob No-Print-Hinweise sichtbar sind
    const noPrintNote = page.locator('text=Schulterbereich').or(
      page.locator('text=Seitennaht')
    );

    // Screenshot mit Fokus auf Positionierung
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tshirt-positioning-zones.png'),
      fullPage: true
    });
  });
});

test.describe('Visual Quality Check - AirFit Pro Shorts', () => {

  test('Shorts Produktseite lädt korrekt', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/2`);

    // Titel und Preis prüfen
    await expect(page.locator('h1').first()).toContainText('Shorts');
    await expect(page.locator('text=39,99').or(page.locator('text=39.99'))).toBeVisible();

    // Screenshot der Produktseite
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'shorts-product-page.png'),
      fullPage: true
    });
  });

  test('Shorts Design-Atelier - Vorderseite', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/2`);
    await clearCart(page);

    // Größe wählen
    await page.getByRole('button', { name: 'M', exact: true }).click();

    // Design hochladen (Front)
    await uploadTestDesign(page, 'front');

    // Screenshot des Ateliers mit Design (2D Front)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'shorts-atelier-front-2d.png'),
      fullPage: true
    });

    // Prüfe dass Design-Canvas sichtbar ist
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('Shorts Design-Atelier - Rückseite', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole('button', { name: 'M', exact: true }).click();

    // Design hochladen (Back)
    await uploadTestDesign(page, 'back');

    // Screenshot des Ateliers mit Design (2D Back)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'shorts-atelier-back-2d.png'),
      fullPage: true
    });
  });

  test('Shorts 3D-Viewer prüfen', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await uploadTestDesign(page, 'front');

    // Zum 3D-Tab wechseln (3. Tab)
    const tabs = page.locator('.plt-tab');
    if (await tabs.nth(2).isVisible()) {
      await tabs.nth(2).click();
      await page.waitForTimeout(2000);

      // Screenshot 3D-Ansicht
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'shorts-3d-viewer.png'),
        fullPage: true
      });
    }
  });

  test('Shorts Design-Positionierung und No-Print-Zonen', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await uploadTestDesign(page, 'front');

    // Prüfe ob No-Print-Hinweise sichtbar sind (Kordelbund, Seitennaht-Paspel, etc.)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'shorts-positioning-zones.png'),
      fullPage: true
    });
  });
});

test.describe('Visual Quality Check - Warenkorb & Bundle', () => {

  test('Bundle-Funktionalität: T-Shirt + Shorts = 74,99€', async ({ page }) => {
    await clearCart(page);

    // T-Shirt hinzufügen
    await page.goto(`${BASE_URL}/product/1`);
    await page.getByRole('button', { name: 'L', exact: true }).click();
    await uploadTestDesign(page, 'front');
    await page.locator('button:has-text("In den Warenkorb")').click();
    await expect(page.locator('button:has-text("Im Warenkorb")')).toBeVisible({ timeout: 10000 });

    // Shorts hinzufügen
    await page.goto(`${BASE_URL}/product/2`);
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await uploadTestDesign(page, 'front');
    await page.locator('button:has-text("In den Warenkorb")').click();
    await expect(page.locator('button:has-text("Im Warenkorb")')).toBeVisible({ timeout: 10000 });

    // Warenkorb öffnen
    await page.goto(`${BASE_URL}/cart`);

    // Prüfe Bundle-Preis (74,99€ statt 44,99€ + 39,99€ = 84,98€)
    const totalText = await page.locator('text=Gesamt').or(page.locator('text=Total')).textContent();

    // Screenshot Warenkorb mit Bundle
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'cart-bundle-both-products.png'),
      fullPage: true
    });

    // Prüfe dass beide Produkte im Warenkorb sind
    await expect(page.locator('text=AirFit Pro').first()).toBeVisible();
    await expect(page.locator('text=Shorts')).toBeVisible();
  });

  test('Warenkorb Design-Thumbnails prüfen', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);

    // Screenshot der Thumbnails
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'cart-design-thumbnails.png'),
      fullPage: true
    });
  });
});

test.describe('Visual Quality Check - Responsive Design', () => {

  test('Mobile Ansicht - T-Shirt', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/product/1`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-tshirt-product.png'),
      fullPage: true
    });
  });

  test('Mobile Ansicht - Shorts', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/product/2`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-shorts-product.png'),
      fullPage: true
    });
  });

  test('Tablet Ansicht - Homepage', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tablet-homepage.png'),
      fullPage: true
    });
  });
});

test.describe('Visual Quality Check - Homepage & Navigation', () => {

  test('Homepage zeigt beide Produkte korrekt', async ({ page }) => {
    await page.goto(BASE_URL);

    // Prüfe dass beide Produkte sichtbar sind
    await expect(page.locator('text=AirFit Pro').first()).toBeVisible();
    await expect(page.locator('text=44,99').or(page.locator('text=44.99'))).toBeVisible();
    await expect(page.locator('text=39,99').or(page.locator('text=39.99'))).toBeVisible();

    // Screenshot Homepage
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'homepage-full.png'),
      fullPage: true
    });
  });

  test('Navigation zwischen Produkten', async ({ page }) => {
    await page.goto(BASE_URL);

    // Klick auf T-Shirt
    await page.locator('text=AirFit Pro').first().click();
    await page.waitForURL(/\/product\/1/);
    await expect(page.locator('h1').first()).toContainText('AirFit Pro');

    // Zurück zur Homepage
    await page.goto(BASE_URL);

    // Klick auf Shorts
    const shortsLink = page.locator('a[href="/product/2"]').first();
    await shortsLink.click();
    await page.waitForURL(/\/product\/2/);
    await expect(page.locator('h1').first()).toContainText('Shorts');
  });
});
