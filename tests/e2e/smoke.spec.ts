import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ON ME HONEY B|Essential Collection/i);
  });

  test("product page loads with h1 @smoke", async ({ page }) => {
    await page.goto("/product/1");

    // Wait for h1 to appear
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });

    // Should show product name (AirFit Pro or similar)
    await expect(h1).toContainText(/AirFit|T-Shirt/i);
  });

  test("product page has size buttons @smoke", async ({ page }) => {
    await page.goto("/product/1");

    // Size selection should exist
    const sizeButtons = page
      .locator("button")
      .filter({ hasText: /^(S|M|L|XL)$/ });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });
  });

  // Prices and names appear more than once. Assert the heading and the page text.
  test("/product/1 shows 44.99 and AirFit @smoke", async ({ page }) => {
    await page.goto("/product/1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AirFit/i,
    );
    await expect(page.locator("body")).toContainText("44.99");
  });

  test("/product/2 shows 39.99 and Shorts @smoke", async ({ page }) => {
    await page.goto("/product/2");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Shorts/i,
    );
    await expect(page.locator("body")).toContainText("39.99");
  });

  test("/product/001 is not 404 and contains AirFit @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/product/001");
    expect(response?.status()).not.toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AirFit/i,
    );
  });

  test("/product/015 is not 404 and contains Shorts @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/product/015");
    expect(response?.status()).not.toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Shorts/i,
    );
  });

  test("/product/051 title is Dekokissenbezüge, not AirFit @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/product/051");
    expect(response?.status()).not.toBe(404);
    await expect(page).toHaveTitle(/Dekokissenbezüge/);
    await expect(page).not.toHaveTitle(/AirFit/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dekokissenbezüge",
    );
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
      /AirFit/,
    );
  });

  test("/product/999 returns 404 @smoke", async ({ page }) => {
    const response = await page.goto("/product/999");
    expect(response?.status()).toBe(404);
  });

  // PR 2: No platypus on homepage
  test("homepage does not contain platypus @smoke", async ({ page }) => {
    await page.goto("/");
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain("platypus");
  });

  test("homepage does not ask for the missing tee photo @smoke", async ({
    page,
  }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("airfit-front-t.png");
    expect(html).not.toContain("airfit-tee-front.png");
  });
});
