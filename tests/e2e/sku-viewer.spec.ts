import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CATALOG } from "../../lib/catalog/families";

test.use({ serviceWorkers: "block" });

test("every catalog SKU has a valid GLB header @smoke", () => {
  for (const sku of Object.keys(CATALOG)) {
    const file = readFileSync(`public/models/sku/${sku}-v1.glb`);
    expect(file.toString("ascii", 0, 4), sku).toBe("glTF");
    expect(file.readUInt32LE(4), sku).toBe(2);
    expect(file.readUInt32LE(8), sku).toBe(file.length);
  }
});

test("every catalog SKU has a GLB rendering instead of a photo @smoke", () => {
  for (const sku of Object.keys(CATALOG)) {
    const file = readFileSync(`public/products/${sku}/glb.webp`);
    expect(file.toString("ascii", 8, 12), sku).toBe("WEBP");
    expect(existsSync(`public/products/${sku}/front.jpg`), sku).toBe(false);
    expect(existsSync(`public/products/${sku}/front.png`), sku).toBe(false);
  }
});

for (const [sku, name] of [
  ["051", "Dekokissenbezüge"],
  ["043", null],
  ["081", null],
  ["104", null],
  ["122", null],
  ["133", null],
] as const) {
  test(`${sku} shows its own 3D model and the upload area, no photo`, async ({ page }) => {
    const asset = `/models/sku/${sku}-v1.glb`;
    const response = page.waitForResponse(
      (result) => new URL(result.url()).pathname === asset,
    );
    await page.goto(`/product/${sku}`);
    if (name) await expect(page.getByRole("heading", { name })).toBeVisible();
    expect((await response).ok()).toBe(true);
    await expect(page.locator('[data-testid="glb-viewer"] canvas')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /Bild hierher ziehen/ })).toBeVisible();
    await expect(page.locator('main img[src*="/products/"]')).toHaveCount(0);
  });
}

test("purchasable SKU aliases identify the same canonical products @smoke", async ({
  page,
}) => {
  for (const [sku, shopId] of [
    ["001", "1"],
    ["015", "2"],
  ]) {
    await page.goto(`/product/${sku}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/product/${shopId}$`),
    );
    const data = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const schema = data
      .map((value) => JSON.parse(value))
      .find((item) => item.sku === sku);
    expect(schema?.image).toMatch(new RegExp(`/products/${sku}/glb\\.webp$`));
    expect(schema?.offers?.url).toMatch(new RegExp(`/product/${shopId}$`));
  }
});

test("footer newsletter has a labeled keyboard focus target @smoke", async ({
  page,
}) => {
  await page.goto("/product/051");
  const email = page.getByRole("textbox", {
    name: "E-Mail-Adresse für den Newsletter",
  });
  await email.focus();
  await expect(email).toBeFocused();
  await expect(email).toHaveCSS("outline-width", "2px");
});

test("failed 3D model is announced", async ({ page }) => {
  await page.route("**/models/sku/051-v1.glb", (route) =>
    route.fulfill({ status: 404, body: "Missing model" }),
  );
  await page.goto("/product/051");
  await expect(
    page.getByRole("status").filter({ hasText: "3D-Modell konnte nicht geladen werden" }),
  ).toBeVisible({ timeout: 20000 });
});
