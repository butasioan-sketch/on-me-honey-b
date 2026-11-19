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

if (failed === 0) {
  console.log('\n✅ Alle Overlays A4-konform!');
} else {
  console.error(`\n❌ ${failed} Overlay(s) fehlen oder überschreiten A4!`);
}

process.exit(failed ? 1 : 0);
