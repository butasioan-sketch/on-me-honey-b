import { expect, test } from "@playwright/test";

// Warenkorb in Englisch: keine deutschen Reste, Hinweis nach abgebrochener Zahlung.
test("cart in English has no German leftovers and explains a cancelled payment @smoke", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("on_me_honey_b_locale", "en");
    localStorage.setItem(
      "on_me_honey_b_cart",
      JSON.stringify([{ id: "1", name: "AirFit Pro", price: 44.99, size: "M", color: "White", quantity: 1, designId: "DSGN-TEST", pages: 1 }]),
    );
  });
  await page.goto("/cart?payment=cancel");
  await expect(page.getByRole("status").filter({ hasText: "Payment cancelled" })).toBeVisible({ timeout: 20000 });
  const body = page.locator("body");
  await expect(body).toContainText("each");
  await expect(body).toContainText("business days");
  for (const german of ["je Stück", "Werktage", "Sichere Zahlung", "Seite(n)"]) {
    await expect(body).not.toContainText(german);
  }
  await expect(page).toHaveURL(/\/cart$/);
});
