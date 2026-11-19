#!/usr/bin/env node
/**
 * validate-print-area.mjs
 *
 * DIN-A4-WÄCHTER
 * Prüft, ob alle Overlays ≤ 210×297 mm
 * Blockiert Deploy bei Überschreitung
 *
 * Run: node scripts/validate-print-area.mjs [productKey]
 * Exit 0: alle OK | Exit 1: mindestens 1 FAIL
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const [, , only] = process.argv;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products-3d.json'), 'utf8'));
const A4 = cfg.a4;

let failed = 0;

for (const [key, p] of Object.entries(cfg.products)) {
  if (only && key !== only) continue;

  for (const side of ['front', 'back']) {
    const ov = p.overlay?.[side];
    if (!ov) {
      failed++;
      console.error(`❌ ${key}/${side}: Druckfläche fehlt`);
      continue;
    }

    const wMm = ov.w * p.physicalMm.width / 100;
    const hMm = ov.h * p.physicalMm.height / 100;
    const ok = wMm > 0 && hMm > 0 && wMm <= A4.widthMm && hMm <= A4.heightMm;

    console.log(`${ok ? '✅' : '❌'} ${key}/${side}: ${wMm.toFixed(2)} × ${hMm.toFixed(2)} mm  (A4 max ${A4.widthMm} × ${A4.heightMm})`);

    if (!ok) {
      failed++;
      console.error('   → Druckmaß ungültig oder größer als A4');
    }
  }
}

// Vorläufige Profile aus den 360°-Modellen (Bekleidung vorne + hinten), siehe
// lib/catalog/print-profiles-draft.json und blender/lib/render_print_views.py.
const draftPath = path.join(ROOT, 'lib/catalog/print-profiles-draft.json');
if (fs.existsSync(draftPath)) {
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  for (const p of draft.profiles) {
    if (only && p.sku !== only) continue;
    for (const side of ['front', 'back']) {
      const ov = p.overlay?.[side];
      const src = path.join(ROOT, 'public/products', p.sku, `render-${side}.png`);
      const ok = ov && ov.widthMm > 0 && ov.heightMm > 0 &&
        ov.widthMm <= A4.widthMm && ov.heightMm <= A4.heightMm &&
        ov.left >= 0 && ov.top >= 0 && ov.left + ov.width <= 100 && ov.top + ov.height <= 100 &&
        fs.existsSync(src);
      console.log(`${ok ? '✅' : '❌'} entwurf ${p.sku}/${side}: ${ov ? `${ov.widthMm} × ${ov.heightMm} mm` : 'fehlt'}`);
      if (!ok) {
        failed++;
        console.error('   → Druckfläche fehlt, größer als A4, außerhalb des Bildes oder Render fehlt');
      }
    }
  }
}

if (failed === 0) {
  console.log('\n✅ Alle Overlays A4-konform!');
} else {
  console.error(`\n❌ ${failed} Overlay(s) fehlen oder überschreiten A4!`);
}

process.exit(failed ? 1 : 0);
