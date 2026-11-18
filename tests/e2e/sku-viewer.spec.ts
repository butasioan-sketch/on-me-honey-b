import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CATALOG } from "../../lib/catalog/families";

test("every catalog SKU has a valid GLB header @smoke", () => {
  for (const sku of Object.keys(CATALOG)) {
    const file = readFileSync(`public/models/sku/${sku}-v1.glb`);
    expect(file.toString("ascii", 0, 4), sku).toBe("glTF");
    expect(file.readUInt32LE(4), sku).toBe(2);
    expect(file.readUInt32LE(8), sku).toBe(file.length);
  }
});

test("051 loads its own model only when requested @smoke", async ({ page }) => {
  const asset = "/models/sku/051-v1.glb";
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto("/product/051");
  await expect(
    page.getByRole("heading", { name: "Dekokissenbezüge" }),
  ).toBeVisible();
  await expect(page.getByAltText("Dekokissenbezüge")).toBeVisible();
  expect(requests).not.toContain(asset);

  const response = page.waitForResponse(
    (result) => new URL(result.url()).pathname === asset,
  );
  await page.getByRole("button", { name: "360°-Entwurf ansehen" }).click();
  expect((await response).ok()).toBe(true);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Produktfoto anzeigen" }).click();
  await expect(page.getByAltText("Dekokissenbezüge")).toBeVisible();
});

for (const sku of ["043", "081", "104", "122", "133"]) {
  test(`${sku} opens the SKU-specific 360° draft`, async ({ page }) => {
    const asset = `/models/sku/${sku}-v1.glb`;
    await page.goto(`/product/${sku}`);
    const response = page.waitForResponse(
      (result) => new URL(result.url()).pathname === asset,
    );
    await page.getByRole("button", { name: "360°-Entwurf ansehen" }).click();
    expect((await response).ok()).toBe(true);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 20000 });
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
    expect(schema?.image).toMatch(new RegExp(`/products/${sku}/front\\.png$`));
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
