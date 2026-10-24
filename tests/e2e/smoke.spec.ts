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
});
