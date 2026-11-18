import { test, expect } from "@playwright/test";
import { getMotifRect, getSheetRect } from "../../lib/print-position";

// 051 Kissen: Das A4-Blatt (210 × 297 mm) ist die Standard-Motivfläche
// (52,5 × 74,25 % des 40-cm-Bezugs). Blattkoordinaten in % je Achse.
const close = (a: number, b: number) =>
  expect(Math.abs(a - b)).toBeLessThan(1e-6);

test.describe("Druckblatt-Koordinaten 051", () => {
  test("Standardmotiv füllt das A4-Blatt vollständig @smoke", () => {
    const r = getSheetRect("front", { scale: 1, x: 0, y: 0 }, "3");
    close(r.left, 0);
    close(r.top, 0);
    close(r.width, 100);
    close(r.height, 100);
  });

  test("verkleinertes Motiv bleibt mittig auf dem Blatt @smoke", () => {
    const r = getSheetRect("front", { scale: 0.5, x: 0, y: 0 }, "3");
    close(r.left, 25);
    close(r.top, 25);
    close(r.width, 50);
    close(r.height, 50);
  });

  test("verschobenes Motiv: Versatz relativ zur Standardfläche @smoke", () => {
    // x = 20 % der Placement-Breite (80 %) = 16 % Foto = 16 / 52,5 Blattbreite
    const r = getSheetRect("front", { scale: 0.5, x: 20, y: -10 }, "3");
    close(r.left, 25 + (16 / 52.5) * 100);
    close(r.top, 25 - (8 / 74.25) * 100);
  });

  test("Motiv über den Rand hinaus ragt über 100 % (wird beim Zeichnen abgeschnitten) @smoke", () => {
    const r = getSheetRect("back", { scale: 1, x: 50, y: 0 }, "3");
    expect(r.left).toBeGreaterThan(0);
    expect(r.left).toBeLessThan(100);
    expect(r.left + r.width).toBeGreaterThan(100);
  });

  test("001/015 bleiben unverändert (Foto-Prozent wie bisher) @smoke", () => {
    for (const id of ["1", "2"]) {
      for (const t of [
        { scale: 1, x: 0, y: 0 },
        { scale: 0.6, x: 12, y: -7 },
      ]) {
        expect(getSheetRect("front", t, id)).toEqual(
          getMotifRect("front", t, id),
        );
      }
    }
  });
});
