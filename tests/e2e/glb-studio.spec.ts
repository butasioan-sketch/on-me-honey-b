import { expect, test } from "@playwright/test";

// 1×1 PNG – genügt, damit das Studio eine Ebene anlegt.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.use({ serviceWorkers: "block" });

for (const id of ["1", "2"]) {
  test(`Produkt ${id}: nur 3D-Modell + Upload, keine Produktfotos @smoke`, async ({ page }) => {
    await page.goto(`/product/${id}`);
    await expect(page.locator('[data-testid="glb-viewer"] canvas')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /Bild hierher ziehen/ })).toBeVisible();
    const photoSrcs = await page.locator("main img").evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).getAttribute("src") || ""),
    );
    expect(photoSrcs.filter((src) => /airfit|\/products\//.test(src))).toEqual([]);
  });
}

test("Studio: Motiv per Tastatur in Größe und Position ändern @smoke", async ({ page }) => {
  await page.goto("/product/1");
  await page.locator('[data-testid="glb-upload-input"]').setInputFiles({
    name: "motiv.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await expect(page.getByRole("button", { name: "Bild 1", exact: true })).toHaveAttribute("aria-pressed", "true", {
    timeout: 20000,
  });
  await expect(page.getByTestId("design-status")).toContainText("Vorderseite");

  const scale = page.getByLabel(/^Größe/);
  const before = await scale.inputValue();
  await scale.focus();
  await page.keyboard.press("ArrowRight");
  expect(await scale.inputValue()).not.toBe(before);

  const x = page.getByLabel("Position waagrecht");
  await x.focus();
  await page.keyboard.press("ArrowRight");
  expect(Number(await x.inputValue())).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Zentrieren" }).click();
  expect(Number(await x.inputValue())).toBe(0);

  await page.getByRole("button", { name: "Entfernen: Bild 1" }).click();
  await expect(page.getByRole("button", { name: "Bild 1", exact: true })).toHaveCount(0);
});
