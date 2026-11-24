import { expect, test } from "@playwright/test";

// SEO-Audit 24.11.2026: jede indexierbare Seite hat canonical + og:image,
// Vorschau-Artikel und private Seiten stehen nicht im Index.

const INDEXED = [
  "/",
  "/categories",
  "/categories/A",
  "/faq",
  "/versand",
  "/widerruf",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/bewertungen",
  "/product/1",
];

test("indexierbare Seiten haben canonical, og:image und kein noindex @smoke", async ({
  request,
}) => {
  for (const path of INDEXED) {
    const html = await (await request.get(path)).text();
    expect(html, `${path} canonical`).toMatch(
      /<link rel="canonical" href="[^"]+"/,
    );
    expect(html, `${path} og:image`).toMatch(
      /<meta property="og:image" content="[^"]+"/,
    );
    expect(html, `${path} noindex`).not.toMatch(
      /<meta name="robots" content="[^"]*noindex/,
    );
  }
});

test("Vorschau-Artikel und private Seiten sind noindex, ohne ungültiges Product-Schema @smoke", async ({
  request,
}) => {
  for (const path of ["/product/100", "/cart", "/tracking"]) {
    const html = await (await request.get(path)).text();
    expect(html, `${path} noindex`).toMatch(
      /<meta name="robots" content="noindex, follow"/,
    );
  }
  const preview = await (await request.get("/product/100")).text();
  expect(preview).not.toContain('"@type":"Product"');
  expect(preview).toMatch(
    /<meta property="og:image" content="[^"]*\/products\/100\/glb\.webp"/,
  );
});

test("Produktbeschreibung nennt den Preis im deutschen Format @smoke", async ({
  request,
}) => {
  const html = await (await request.get("/product/1")).text();
  expect(html).toMatch(/<meta name="description" content="[^"]*\d+,\d{2}\s€/);
});

test("Bewertungsseite hat genau eine h1 @smoke", async ({ page }) => {
  await page.goto("/bewertungen");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("Kategorieseiten haben eigenen Einleitungstext und eigene Beschreibung @smoke", async ({
  request,
}) => {
  const seen = new Set<string>();
  for (const c of ["A", "E", "I"]) {
    const html = await (await request.get(`/categories/${c}`)).text();
    const desc =
      html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
    expect(desc.length, `${c} description`).toBeGreaterThan(70);
    expect(seen.has(desc), `${c} doppelte description`).toBe(false);
    seen.add(desc);
    expect(html).toContain("eigenes 3D-Modell");
  }
});
