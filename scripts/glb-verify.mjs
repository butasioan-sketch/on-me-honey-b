#!/usr/bin/env node
/**
 * GLB Verification Script (WAVE 4.4)
 * Validates shop GLB files against Accept table
 *
 * Usage: node scripts/glb-verify.mjs <file> --family=<tee|shorts|pillow|cap>
 */

import fs from 'fs';
import path from 'path';

const FAMILY_BUDGETS = {
  tee: { maxSize: 300 * 1024, minVerts: 500, minBBoxY: 0.12 },
  shorts: { maxSize: 100 * 1024, minVerts: 500, minBBoxY: 0.12 },
  pillow: { maxSize: 400 * 1024, minVerts: 200, minBBoxY: 0.12 },
  cap: { maxSize: 80 * 1024, minVerts: 200, minBBoxY: 0.10 },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args.find(a => !a.startsWith('--'));
  const familyArg = args.find(a => a.startsWith('--family='));
  const family = familyArg?.split('=')[1];

  if (!filePath) {
    console.error('Usage: node scripts/glb-verify.mjs <file> --family=<tee|shorts|pillow|cap>');
    process.exit(1);
  }

  if (!family || !FAMILY_BUDGETS[family]) {
    console.error(`Invalid family. Use: ${Object.keys(FAMILY_BUDGETS).join(', ')}`);
    process.exit(1);
  }

  return { filePath, family };
}

function readGLB(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Check magic bytes (glTF 2.0 binary)
  const magic = buffer.toString('utf8', 0, 4);
  if (magic !== 'glTF') {
    throw new Error(`Not a glTF binary file (magic: ${magic})`);
  }

  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    throw new Error(`Not glTF 2.0 (version: ${version})`);
  }

  // Read JSON chunk
  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.readUInt32LE(16);
  if (jsonChunkType !== 0x4E4F534A) { // "JSON"
    throw new Error('First chunk is not JSON');
  }

  const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonData);

  return { buffer, gltf };
}

function checkDraco(gltf) {
  const extensions = gltf.extensionsUsed || [];
  return extensions.includes('KHR_draco_mesh_compression');
}

function estimateVertexCount(gltf) {
  let totalVerts = 0;

  if (!gltf.meshes) return 0;

  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives || []) {
      if (primitive.attributes?.POSITION !== undefined) {
        const accessor = gltf.accessors?.[primitive.attributes.POSITION];
        if (accessor) {
          totalVerts += accessor.count;
        }
      }
    }
  }

  return totalVerts;
}

function calculateBBox(gltf) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  if (!gltf.meshes) return { min, max, sizeY: 0 };

  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives || []) {
      if (primitive.attributes?.POSITION !== undefined) {
        const accessor = gltf.accessors?.[primitive.attributes.POSITION];
        if (accessor?.min && accessor?.max) {
          for (let i = 0; i < 3; i++) {
            min[i] = Math.min(min[i], accessor.min[i]);
            max[i] = Math.max(max[i], accessor.max[i]);
          }
        }
      }
    }
  }

  const sizeY = max[1] - min[1];
  const maxDim = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);

  return { min, max, sizeY, maxDim };
}

function verify(filePath, family) {
  const budget = FAMILY_BUDGETS[family];
  const { buffer, gltf } = readGLB(filePath);
  const fileSize = buffer.length;

  console.log(`\n🔍 Verifying: ${path.basename(filePath)}`);
  console.log(`   Family: ${family}`);
  console.log(`   Size: ${(fileSize / 1024).toFixed(1)} KB`);

  const errors = [];
  const warnings = [];

  // 1. Check Draco
  if (checkDraco(gltf)) {
    errors.push('❌ FAIL: Draco compression detected (KHR_draco_mesh_compression)');
  } else {
    console.log('   ✓ No Draco compression');
  }

  // 2. Check vertex count
  const verts = estimateVertexCount(gltf);
  console.log(`   Vertices: ${verts}`);
  if (verts < budget.minVerts) {
    errors.push(`❌ FAIL: Too few vertices (${verts} < ${budget.minVerts})`);
  } else {
    console.log(`   ✓ Vertex count OK (≥ ${budget.minVerts})`);
  }

  // 3. Check BBox
  const bbox = calculateBBox(gltf);
  console.log(`   BBox Y-span: ${bbox.sizeY.toFixed(3)}`);
  console.log(`   BBox max-dim: ${bbox.maxDim.toFixed(3)}`);

  if (bbox.sizeY < budget.minBBoxY) {
    errors.push(`❌ FAIL: BBox Y too small (${bbox.sizeY.toFixed(3)} < ${budget.minBBoxY}) - flat mesh`);
  } else {
    console.log(`   ✓ BBox Y OK (≥ ${budget.minBBoxY})`);
  }

  // Unit scale check (±0.15)
  if (bbox.maxDim < 0.85 || bbox.maxDim > 1.15) {
    warnings.push(`⚠️  WARNING: BBox max-dim not ≈1.0 (${bbox.maxDim.toFixed(3)}) - camera may need adjustment`);
  } else {
    console.log(`   ✓ Unit scale OK (≈1.0)`);
  }

  // 4. Check file size
  if (fileSize > budget.maxSize) {
    errors.push(`❌ FAIL: File too large (${(fileSize / 1024).toFixed(1)} KB > ${(budget.maxSize / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`   ✓ Size OK (< ${(budget.maxSize / 1024).toFixed(1)} KB)`);
  }

  // Origin check
  const center = [
    (bbox.min[0] + bbox.max[0]) / 2,
    (bbox.min[1] + bbox.max[1]) / 2,
    (bbox.min[2] + bbox.max[2]) / 2,
  ];
  const centerDist = Math.sqrt(center[0]**2 + center[1]**2 + center[2]**2);
  if (centerDist > 0.2) {
    warnings.push(`⚠️  WARNING: BBox center far from origin (${centerDist.toFixed(3)}) - orbitTarget may need adjustment`);
  } else {
    console.log(`   ✓ Origin OK (center near 0,0,0)`);
  }

  // Results
  console.log();
  if (warnings.length > 0) {
    warnings.forEach(w => console.log(w));
    console.log();
  }

  if (errors.length > 0) {
    errors.forEach(e => console.log(e));
    console.log('\n❌ VERIFICATION FAILED\n');
    return false;
  } else {
    console.log('✅ VERIFICATION PASSED\n');
    return true;
  }
}

// Main
const { filePath, family } = parseArgs();

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const passed = verify(filePath, family);
process.exit(passed ? 0 : 1);
