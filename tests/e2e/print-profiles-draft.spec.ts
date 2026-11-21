import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Rect = { top: number; left: number; width: number; height: number };
type Overlay = Rect & { widthMm: number; heightMm: number };
type Profile = {
  sku: string;
  kind: string;
  status: string;
  overlay: { front: Overlay; back: Overlay };
  placement: { front: Rect; back: Rect };
  frontSrc: string;
  backSrc: string;
};

const draft = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../lib/catalog/print-profiles-draft.json"), "utf8"),
) as { profiles: Profile[] };

test("vorläufige Druckprofile: Bekleidung vorne und hinten, je höchstens A4 @smoke", () => {
  expect(draft.profiles.length).toBeGreaterThanOrEqual(21);
  for (const p of draft.profiles) {
    expect(p.status, p.sku).toBe("vorlaeufig");
    for (const side of ["front", "back"] as const) {
      const ov = p.overlay[side];
      const pl = p.placement[side];
      expect(ov.widthMm, `${p.sku}/${side}`).toBeLessThanOrEqual(210);
      expect(ov.heightMm, `${p.sku}/${side}`).toBeLessThanOrEqual(297);
      // Seitenverhältnis bleibt A4 (210:297), Fläche liegt im Bild und im Verschiebebereich
      expect(Math.abs(ov.widthMm / ov.heightMm - 210 / 297), `${p.sku}/${side}`).toBeLessThan(0.01);
      expect(ov.left + ov.width, `${p.sku}/${side}`).toBeLessThanOrEqual(100);
      expect(ov.top + ov.height, `${p.sku}/${side}`).toBeLessThanOrEqual(100);
      expect(pl.left, `${p.sku}/${side}`).toBeLessThanOrEqual(ov.left);
      // Motiv darf nicht über die Oberkante der Druckfläche in Kragen/Bund geschoben werden
      expect(pl.top, `${p.sku}/${side}`).toBe(ov.top);
      const img = side === "front" ? p.frontSrc : p.backSrc;
      expect(fs.existsSync(path.join(__dirname, "../../public", img)), img).toBe(true);
    }
  }
});

test("vorläufige Druckprofile machen keinen Artikel kaufbar @smoke", async ({ page }) => {
  // 016 (Sporthose) hat jetzt ein vorläufiges Profil, bleibt aber Katalogartikel ohne Kaufen-Knopf.
  await page.goto("/product/016");
  await expect(page.getByText("Bald verfügbar")).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: /Bild hierher ziehen/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Jetzt bestellen/ })).toHaveCount(0);
});
