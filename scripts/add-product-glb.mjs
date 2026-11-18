#!/usr/bin/env node
// Usage: node scripts/add-product-glb.mjs <tee|shorts|pillow> <path-to.glb>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'data/products-3d.json');
const MODELS_DIR = path.join(ROOT, 'public/models');

const [, , productKey, glbPath] = process.argv;

if (!productKey || !glbPath) {
  console.error('Usage: node scripts/add-product-glb.mjs <tee|shorts|pillow> <path-to.glb>');
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const product = cfg.products[productKey];
if (!product) {
  console.error(`Unbekanntes Produkt: ${productKey}`);
  process.exit(1);
}

const size = fs.statSync(glbPath).size;
const sizeMb = (size / 1024 / 1024).toFixed(2);

// Validierung: Größe
const LIMITS = { tee: 600_000, shorts: 300_000, pillow: 500_000 };
if (size > LIMITS[productKey]) {
  console.error(`❌ ${productKey}: ${sizeMb} MB > Limit ${(LIMITS[productKey]/1e6).toFixed(1)} MB.`);
  console.error(`   → Draco-komprimieren: npx @gltf-transform/cli draco ${glbPath} out.glb --method edgebreaker`);
  process.exit(1);
}

// Validierung: GLB-Header + Draco
const buf = fs.readFileSync(glbPath);
const magic = buf.subarray(0, 4).toString('utf8');
if (magic !== 'glTF') {
  console.error('❌ Keine gültige GLB-Datei.');
  process.exit(1);
}

const hasDraco = buf.includes(Buffer.from('KHR_draco_mesh_compression'));
if (!hasDraco) {
  console.warn('⚠️  Kein Draco — Datei ist größer als nötig.');
}

// Kopieren
const dest = path.join(MODELS_DIR, path.basename(glbPath));
fs.copyFileSync(glbPath, dest);
console.log(`✅ Kopiert: ${path.relative(ROOT, dest)} (${sizeMb} MB)`);

// Config updaten
product.modelPath = `/models/${path.basename(glbPath)}`;
fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
console.log(`✅ data/products-3d.json aktualisiert: ${productKey} → ${product.modelPath}`);

// A4-Validator laufen lassen
try {
  execSync(`node scripts/validate-print-area.mjs ${productKey}`, { stdio: 'inherit' });
} catch {
  process.exit(1);
}

console.log('\n📦 Nächster Schritt:');
console.log('   git add public/models data/products-3d.json');
console.log('   git commit -m "feat(3d): update ' + productKey + ' GLB"');
console.log('   npx vercel --prod --yes');
