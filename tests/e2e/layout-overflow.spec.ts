import { expect, test } from "@playwright/test";

// Kein seitliches Scrollen auf Handy, Tablet und Laptop.
// In der CI läuft der Next-Dev-Server; viele Seitenaufrufe in Firefox führten dort zu
// ChunkLoadErrors des Dev-Servers. Daher hier schlank und nur in Chromium. Volle Matrix
// (5 Breiten × 9 Seiten, Firefox + Chromium) wurde gegen eine Vercel-Preview geprüft:
//   BASE_URL=<preview> FULL_LAYOUT=1 npx playwright test tests/e2e/layout-overflow.spec.ts
const FULL = !!process.env.FULL_LAYOUT;
const WIDTHS = FULL ? [360, 414, 700, 900, 1280] : [360, 700, 1280];
const PAGES = FULL
  ? ["/", "/product/1", "/product/2", "/product/051", "/product/098", "/product/031", "/cart", "/categories", "/geschenke"]
  : ["/", "/product/1", "/product/051", "/cart", "/geschenke"];

for (const width of WIDTHS) {
  test(`kein horizontales Überlaufen bei ${width}px @smoke`, async ({ page, browserName }) => {
    test.skip(!FULL && browserName !== "chromium", "In der CI nur Chromium (Dev-Server-Last)");
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle").catch(() => {});
      // Erst messen, wenn das globale Stylesheet greift (im Dev-Modus wird CSS nachgeladen)
      await page.waitForFunction(() => {
        const skip = document.querySelector(".skip-to-content");
        return !skip || getComputedStyle(skip).position !== "static";
      }, null, { timeout: 15000 });
      const overflow = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const sw = document.documentElement.scrollWidth;
        const culprits = [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const st = getComputedStyle(el);
            return r.width > 0 && r.right > vw + 1 && st.position !== "fixed";
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 40)} right=${Math.round(el.getBoundingClientRect().right)}`);
        return { vw, sw, culprits };
      });
      expect(overflow.sw, `${path} @${width}px: ${overflow.culprits.join(" | ")}`).toBeLessThanOrEqual(overflow.vw + 1);
    }
  });
}
