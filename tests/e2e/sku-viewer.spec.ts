import { expect, test } from "@playwright/test";

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
