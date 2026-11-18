import { expect, test } from "@playwright/test";

for (const paid of [false, true]) {
  test(`checkout return preserves cart until payment is confirmed (paid=${paid}) @smoke`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const cart = JSON.stringify([{ id: "1", designId: "test" }]);
      localStorage.setItem("on_me_honey_b_cart", cart);
      sessionStorage.setItem(
        "plt_pending_purchase",
        JSON.stringify({
          sessionId: "cs_test_fixture",
          cart,
        }),
      );
      localStorage.setItem("on_me_honey_b_locale", "de");
    });
    await page.route("**/api/payments/checkout-status?*", (route) =>
      route.fulfill({ json: { paid, amount: 49.48 } }),
    );
    await page.goto("/?payment=success&session_id=cs_test_fixture");
    await expect(
      page.getByRole("status").filter({
        hasText: paid ? "Zahlung erfolgreich" : "noch nicht bestätigt",
      }),
    ).toBeVisible({ timeout: 20000 });
    expect(
      (await page.evaluate(() =>
        localStorage.getItem("on_me_honey_b_cart"),
      )) === null,
    ).toBe(paid);
  });
}
