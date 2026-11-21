import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ON ME HONEY B|Essential Collection/i);
  });

  test("homepage launch links use the selected language @smoke", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("on_me_honey_b_locale", "en"),
    );
    await page.goto("/");
    const hero = page.locator(".hero-product");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(
      "YOUR DESIGN.",
    );
    await expect(
      hero.getByRole("link", { name: "Enter the Studio", exact: true }).first(),
    ).toHaveAttribute("href", "/product/1");
    await expect(
      hero.getByRole("link", { name: "Explore the Essential Set" }),
    ).toHaveAttribute("href", "#essential-set");
    await expect(page.locator("#essential-set")).toBeVisible();
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
    await expect(page.locator("body")).toContainText(/44[.,]99/);
  });

  test("/product/2 shows 39.99 and Shorts @smoke", async ({ page }) => {
    await page.goto("/product/2");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Shorts/i,
    );
    await expect(page.locator("body")).toContainText(/39[.,]99/);
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

  test("season pages and /geschenke return 200, unknown season 404 @smoke", async ({
    request,
  }) => {
    for (const path of [
      "/saison/valentinstag",
      "/saison/ostern",
      "/saison/weihnachten",
      "/geschenke",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
    const unknown = await request.get("/saison/fasching");
    expect(unknown.status()).toBe(404);
  });

  test("header links to /geschenke @smoke", async ({ page }) => {
    await page.goto("/");
    const desktop = page.locator('header a.plt-nav-link[href="/geschenke"]');
    const burger = page.getByRole("button", { name: /menü|menu/i });
    await expect(
      desktop.or(burger).filter({ visible: true }).first(),
    ).toBeVisible();
    if (await desktop.isVisible()) {
      await expect(desktop).toBeVisible();
    } else {
      await burger.click();
      await expect(
        page.locator('.mobile-menu a[href="/geschenke"]'),
      ).toBeVisible();
    }
  });

  test("/geschenke lists only buyable products @smoke", async ({ page }) => {
    await page.goto("/geschenke");
    const cards = page.locator(".live-product-card");
    await expect(cards).toHaveCount(2);
    await expect(
      page.locator('.live-product-card[href="/product/1"]'),
    ).toBeVisible();
    await expect(
      page.locator('.live-product-card[href="/product/2"]'),
    ).toBeVisible();
  });

  test("every homepage category slug reaches a real category @smoke", async ({
    page,
    request,
  }) => {
    const categories = [
      ["bekleidung", "A"],
      ["taschen", "B"],
      ["wohnen", "C"],
      ["geschenke", "D"],
      ["tassen", "E"],
      ["caps", "F"],
      ["teller", "G"],
      ["stifte", "H"],
      ["schuhe", "I"],
    ];
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".category-card-link")).toHaveCount(
      categories.length,
    );
    await Promise.all(
      categories.map(async ([slug, id]) => {
        const path = `/categories/${slug}`;
        await expect(
          page.locator(`.category-card-link[href="${path}"]`),
        ).toBeVisible();
        const response = await request.get(path, { maxRetries: 1 });
        expect(response.status(), slug).toBe(200);
        expect(new URL(response.url()).pathname, slug).toBe(
          `/categories/${id}`,
        );
        expect(await response.text(), slug).not.toContain(
          "Kategorie nicht gefunden",
        );
      }),
    );
  });

  test("season and gift pages follow the chosen locale @smoke", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("on_me_honey_b_locale", "en"),
    );
    await page.goto("/saison/weihnachten");
    await expect(page.locator("h1")).toContainText("Christmas gifts");
    await page.goto("/geschenke");
    await expect(page.locator("h1")).toContainText("Gifts with your design");
    await expect(page.locator(".live-product-card").first()).toContainText(
      "Design now",
    );
  });

  test("homepage shows GLB renderings instead of product photos @smoke", async ({
    page,
  }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("glb.webp");
    expect(html).not.toContain("airfit-front-t.png");
    expect(html).not.toMatch(/\/products\/\d{3}\/front\./);
  });
});
