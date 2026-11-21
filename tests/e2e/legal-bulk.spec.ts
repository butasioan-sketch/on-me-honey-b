import { expect, test } from "@playwright/test";

test("Widerruf: kein Muster-Widerrufsrecht mehr, Gewährleistung erklärt @smoke", async ({ page }) => {
  await page.goto("/widerruf");
  await expect(page.getByRole("heading", { name: "Kein Widerrufsrecht" })).toBeVisible();
  await expect(page.getByText("binnen vierzehn Tagen")).toHaveCount(0);
  await expect(page.getByText(/Rücksendung/).first()).toBeVisible();
});

test("AGB: Handfertigung, Lieferzeit, Rücksendekosten, Großbestellung @smoke", async ({ page }) => {
  await page.goto("/agb");
  await expect(page.getByText(/kleines Start-up/)).toBeVisible();
  await expect(page.getByText(/spätestens 10 Werktage nach Zahlungseingang/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Rücksendekosten/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Anfrageformular" })).toHaveAttribute("href", "/grossbestellung");
});

test("Impressum nennt Start-up und Handarbeit @smoke", async ({ page }) => {
  await page.goto("/impressum");
  await expect(page.getByText(/kleines Start-up/)).toBeVisible();
  await expect(page.getByText(/§ 19 UStG/)).toBeVisible();
});

test("Großbestellung: Formular prüft Pflichtfelder und Mindestmenge @smoke", async ({ page }) => {
  await page.goto("/grossbestellung");
  await expect(page.getByRole("heading", { name: /Mehr als 20 Stück/ })).toBeVisible();
  await expect(page.getByLabel(/Stückzahl gesamt/)).toHaveAttribute("min", "21");
  // Serverseitige Prüfung: 20 Stück wird abgelehnt
  const res = await page.request.post("/api/inquiries", {
    data: { name: "Test", email: "test@example.com", products: "T-Shirts", quantity: 20 },
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).fields).toContain("quantity");
});

test("Checkout lehnt mehr als 20 Stück ab @smoke", async ({ page }) => {
  const res = await page.request.post("/api/payments/create-checkout", {
    data: {
      paymentMethod: "card",
      country: "DE",
      shippingId: "hermes",
      items: [
        { productId: "1", size: "L", quantity: 9, price: 44.99, designId: "x1" },
        { productId: "1", size: "M", quantity: 9, price: 44.99, designId: "x2" },
        { productId: "2", size: "L", quantity: 3, price: 39.99, designId: "x3" },
      ],
    },
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).code).toBe("bulk_inquiry_required");
});

test("Warenkorb zeigt bei 20 Stück den Hinweis auf das Anfrageformular @smoke", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "on_me_honey_b_cart",
      JSON.stringify([
        { id: "1", name: "AirFit Pro", price: 44.99, size: "L", quantity: 9, designId: "a", pages: 1 },
        { id: "1", name: "AirFit Pro", price: 44.99, size: "M", quantity: 9, designId: "b", pages: 1 },
        { id: "2", name: "AirFit Pro Shorts", price: 39.99, size: "L", quantity: 2, designId: "c", pages: 1 },
      ]),
    );
  });
  await page.goto("/cart");
  await expect(page.getByTestId("bulk-hint")).toBeVisible();
  await expect(page.getByTestId("bulk-hint").getByRole("link")).toHaveAttribute("href", "/grossbestellung");
});
