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

  // PR 2: Lock prices
  test("/product/1 shows 44.99 and AirFit @smoke", async ({ page }) => {
    await page.goto("/product/1");
    await expect(page.locator("text=44.99")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=/AirFit/i")).toBeVisible();
  });

  test("/product/2 shows 39.99 and Shorts @smoke", async ({ page }) => {
    await page.goto("/product/2");
    await expect(page.locator("text=39.99")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=/Shorts/i")).toBeVisible();
  });

  // PR 2: Lock SKU routes
  test("/product/001 is not 404 and contains AirFit @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/product/001");
    expect(response?.status()).not.toBe(404);
    await expect(page.locator("text=/AirFit/i")).toBeVisible({
      timeout: 10000,
    });
  });

  test("/product/015 is not 404 and contains Shorts @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/product/015");
    expect(response?.status()).not.toBe(404);
    await expect(page.locator("text=/Shorts/i")).toBeVisible({
      timeout: 10000,
    });
  });

  test("/product/051 title/h1 contains Dekokissenbezüge, not AirFit @smoke", async ({
    page,
  }) => {
    await page.goto("/product/051");
    const heading = page.locator("h1, title").first();
    await expect(heading).toContainText(/Dekokissenbezüge/i, {
      timeout: 10000,
    });
    await expect(heading).not.toContainText(/AirFit/i);
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
});
