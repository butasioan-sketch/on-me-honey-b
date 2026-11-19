import { expect, test } from "@playwright/test";

// 1×1 PNG – genügt, damit das Atelier eine Ebene anlegt.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("Atelier: Motiv und Ebenen sind per Tastatur bedienbar @smoke", async ({ page }) => {
  await page.goto("/product/1");
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "motiv.png",
    mimeType: "image/png",
    buffer: PNG,
  });

  const motif = page.getByRole("button", { name: "Motiv 1" });
  await expect(motif).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: /Bild 1/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Zoom")).toBeVisible();

  const before = await motif.evaluate((el) => (el as HTMLElement).style.left + "|" + (el as HTMLElement).style.top);
  await motif.focus();
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("Shift+ArrowDown");
  const after = await motif.evaluate((el) => (el as HTMLElement).style.left + "|" + (el as HTMLElement).style.top);
  expect(after).not.toBe(before);
});
