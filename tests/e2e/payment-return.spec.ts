import { expect, test, type Page } from "@playwright/test";

async function seedPendingPurchase(page: Page) {
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
}

const readCart = (page: Page) =>
  page.evaluate(() => localStorage.getItem("on_me_honey_b_cart"));

const cases = [
  { name: "unpaid", paid: false, orderSaved: false, text: "noch nicht bestätigt", cleared: false },
  { name: "paid-without-order", paid: true, orderSaved: false, text: "Auftrag wird verarbeitet", cleared: false },
  { name: "paid-with-order", paid: true, orderSaved: true, text: "Zahlung erfolgreich", cleared: true },
];

for (const c of cases) {
  test(`checkout return keeps cart until the order is stored (${c.name}) @smoke`, async ({
    page,
  }) => {
    await seedPendingPurchase(page);
    await page.route("**/api/payments/checkout-status?*", (route) =>
      route.fulfill({
        json: { paid: c.paid, orderSaved: c.orderSaved, amount: 49.48 },
      }),
    );
    await page.goto("/?payment=success&session_id=cs_test_fixture");
    await expect(
      page.getByRole("status").filter({ hasText: c.text }),
    ).toBeVisible({ timeout: 20000 });
    expect((await readCart(page)) === null).toBe(c.cleared);
  });
}

test("checkout return confirms once the webhook has stored the order @smoke", async ({
  page,
}) => {
  await seedPendingPurchase(page);
  let calls = 0;
  await page.route("**/api/payments/checkout-status?*", (route) =>
    route.fulfill({
      json: { paid: true, orderSaved: ++calls > 1, amount: 49.48 },
    }),
  );
  await page.goto("/?payment=success&session_id=cs_test_fixture");
  await expect(
    page.getByRole("status").filter({ hasText: "Auftrag wird verarbeitet" }),
  ).toBeVisible({ timeout: 20000 });
  expect(await readCart(page)).not.toBeNull();
  await expect(
    page.getByRole("status").filter({ hasText: "Zahlung erfolgreich" }),
  ).toBeVisible({ timeout: 20000 });
  expect(await readCart(page)).toBeNull();
});

test("checkout return explains a delayed order after the last status check @smoke", async ({
  page,
}) => {
  await seedPendingPurchase(page);
  await page.clock.install();
  let calls = 0;
  await page.route("**/api/payments/checkout-status?*", (route) => {
    calls++;
    return route.fulfill({ json: { paid: true, orderSaved: false, amount: 49.48 } });
  });
  await page.goto("/?payment=success&session_id=cs_test_fixture");
  await expect(
    page.getByRole("status").filter({ hasText: "Auftrag wird verarbeitet" }),
  ).toBeVisible({ timeout: 20000 });
  // Je Statusprüfung die Uhr vorspulen und auf die tatsächliche Anfrage warten (robust bei Netzlatenz)
  for (let expected = 2; expected <= 20; expected++) {
    await page.clock.runFor(3100);
    await expect.poll(() => calls, { timeout: 15000 }).toBeGreaterThanOrEqual(expected);
  }
  await expect(
    page.getByRole("alert").filter({ hasText: "Bitte nicht erneut bezahlen" }),
  ).toBeVisible({ timeout: 20000 });
  expect(calls).toBe(20);
  expect(await readCart(page)).not.toBeNull();
});
