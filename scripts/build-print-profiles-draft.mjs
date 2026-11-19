#!/usr/bin/env node
/**
 * Baut lib/catalog/print-profiles-draft.json aus den PROFILE-Zeilen von
 * blender/lib/render_print_views.py (eine JSON-Zeile je SKU).
 *
 *   node scripts/build-print-profiles-draft.mjs <profiles.jsonl>
 *
 * Die Profile sind VORLÄUFIG: kalibriert auf Renderings der eigenen 360°-Modelle,
 * deren Maße Schätzwerte sind. Kein Maßblatt, kein Testdruck. Sie machen keinen
 * Artikel kaufbar (siehe lib/catalog/release-gate.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src) {
  console.error('Aufruf: node scripts/build-print-profiles-draft.mjs <profiles.jsonl>');
  process.exit(1);
}

const profiles = fs.readFileSync(src, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  .sort((a, b) => a.sku.localeCompare(b.sku));
const seen = new Set();
for (const p of profiles) {
  if (seen.has(p.sku)) throw new Error(`SKU doppelt: ${p.sku}`);
  seen.add(p.sku);
  for (const side of ['front', 'back']) {
    const ov = p.overlay?.[side];
    if (!ov) throw new Error(`${p.sku}/${side}: Druckfläche fehlt`);
    if (ov.widthMm > 210 || ov.heightMm > 297) throw new Error(`${p.sku}/${side}: größer als A4`);
  }
  // Verschiebebereich einheitlich: nie über die Oberkante der Druckfläche (Kragen/Bund),
  // seitlich ±4 %, nach unten +6 % – gleiche Regel wie placement_for() im Renderer.
  for (const side of ['front', 'back']) {
    const ov = p.overlay[side];
    const left = Math.max(0, ov.left - 4);
    p.placement[side] = {
      top: ov.top,
      left: +left.toFixed(2),
      width: +Math.min(100 - left, ov.width + 8).toFixed(2),
      height: +Math.min(100 - ov.top, ov.height + 6).toFixed(2),
    };
  }
  p.frontSrc = `/products/${p.sku}/render-front.png`;
  p.backSrc = `/products/${p.sku}/render-back.png`;
  p.status = 'vorlaeufig';
  p.basis = 'Rendering des eigenen 360°-Modells (Schätzmaße), kein Maßblatt, kein Testdruck';
}

const out = {
  hinweis: 'Vorläufige Druckprofile Bekleidung vorne + hinten (max. DIN A4). Nicht testgedruckt.',
  erzeugtMit: 'blender/lib/render_print_views.py + scripts/build-print-profiles-draft.mjs',
  a4: { widthMm: 210, heightMm: 297 },
  profiles,
};
const target = path.join(ROOT, 'lib/catalog/print-profiles-draft.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`${profiles.length} Profile → ${path.relative(ROOT, target)}`);
