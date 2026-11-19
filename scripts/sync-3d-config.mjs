#!/usr/bin/env node
/**
 * sync-3d-config.mjs
 *
 * SINGLE SOURCE OF TRUTH ENFORCER
 * Regenerates data/products-3d.json FROM lib/print-spec.ts
 *
 * Master: lib/print-spec.ts ("NICHT ÄNDERN" - kalibrierte Overlays)
 * Derived: data/products-3d.json (für 3D-Viewer)
 *
 * Run: node scripts/sync-3d-config.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Read print-spec.ts and extract overlay values
const PRINT_SPEC = fs.readFileSync(path.join(ROOT, 'lib/print-spec.ts'), 'utf8');

// Extract TEE overlays
const teeOverlayFrontMatch = PRINT_SPEC.match(/const OVERLAY_FRONT = \{ top: ([\d.]+), left: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}/);
const teeOverlayBackMatch = PRINT_SPEC.match(/const OVERLAY_BACK = \{ top: ([\d.]+), left: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}/);

// Extract SHORTS overlay
const shortsOverlayMatch = PRINT_SPEC.match(/const SHORTS_OVERLAY = \{ top: ([\d.]+), left: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}/);

// Extract PILLOW overlay
const pillowOverlayMatch = PRINT_SPEC.match(/const PILLOW_OVERLAY = \{ top: ([\d.]+), left: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}/);

if (!teeOverlayFrontMatch || !teeOverlayBackMatch || !shortsOverlayMatch || !pillowOverlayMatch) {
  console.error('❌ Failed to extract overlay values from print-spec.ts');
  process.exit(1);
}

const config = {
  version: 2,
  generated_from: "lib/print-spec.ts",
  generated_at: new Date().toISOString(),
  a4: { widthMm: 210, heightMm: 297 },
  products: {
    tee: {
      sku: "001",
      shopId: "1",
      label: "AirFit Pro T-Shirt",
      modelPath: "/models/shirt-white-v2.glb",
      physicalMm: { width: 500, height: 850 },
      camera: {
        position: [0, 0.4, 2.2],
        fov: 35,
        target: [0, 0.4, 0]
      },
      animation: {
        rotateSpeedRadPerSec: 0.4,
        floatAmpM: 0.02,
        floatFreqHz: 1.2
      },
      overlay: {
        front: {
          y: parseFloat(teeOverlayFrontMatch[1]),
          x: parseFloat(teeOverlayFrontMatch[2]),
          h: parseFloat(teeOverlayFrontMatch[4]),
          w: parseFloat(teeOverlayFrontMatch[3])
        },
        back: {
          y: parseFloat(teeOverlayBackMatch[1]),
          x: parseFloat(teeOverlayBackMatch[2]),
          h: parseFloat(teeOverlayBackMatch[4]),
          w: parseFloat(teeOverlayBackMatch[3])
        }
      },
      shopLive: true
    },
    shorts: {
      sku: "015",
      shopId: "2",
      label: "AirFit Pro Shorts",
      modelPath: "/models/shorts-white-v1.glb",
      physicalMm: { width: 500, height: 600 },
      camera: {
        position: [0, 0.2, 1.8],
        fov: 35,
        target: [0, 0.2, 0]
      },
      animation: {
        rotateSpeedRadPerSec: 0.5,
        floatAmpM: 0.0,
        floatFreqHz: 0
      },
      overlay: {
        front: {
          y: parseFloat(shortsOverlayMatch[1]),
          x: parseFloat(shortsOverlayMatch[2]),
          h: parseFloat(shortsOverlayMatch[4]),
          w: parseFloat(shortsOverlayMatch[3])
        },
        back: {
          y: parseFloat(shortsOverlayMatch[1]),
          x: parseFloat(shortsOverlayMatch[2]),
          h: parseFloat(shortsOverlayMatch[4]),
          w: parseFloat(shortsOverlayMatch[3])
        }
      },
      shopLive: true
    },
    pillow: {
      sku: "051",
      shopId: "051",
      label: "Dekokissenbezüge",
      modelPath: "/models/pillow-cover-40x40.glb",
      physicalMm: { width: 400, height: 400 },
      camera: {
        position: [0, 0, 1.6],
        fov: 40,
        target: [0, 0, 0]
      },
      animation: {
        rotateSpeedRadPerSec: 0.3,
        floatAmpM: 0.03,
        floatFreqHz: 0.8
      },
      overlay: {
        front: {
          y: parseFloat(pillowOverlayMatch[1]),
          x: parseFloat(pillowOverlayMatch[2]),
          h: parseFloat(pillowOverlayMatch[4]),
          w: parseFloat(pillowOverlayMatch[3])
        },
        back: {
          y: parseFloat(pillowOverlayMatch[1]),
          x: parseFloat(pillowOverlayMatch[2]),
          h: parseFloat(pillowOverlayMatch[4]),
          w: parseFloat(pillowOverlayMatch[3])
        }
      },
      shopLive: false,
      note: "A4-Clamp applied from print-spec.ts master values"
    }
  }
};

// Write to data/products-3d.json
const dataDir = path.join(ROOT, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'products-3d.json');
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

console.log('✅ Synced print-spec.ts → data/products-3d.json');
console.log('   TEE overlay:', config.products.tee.overlay.front);
console.log('   SHORTS overlay:', config.products.shorts.overlay.front);
console.log('   PILLOW overlay:', config.products.pillow.overlay.front);
