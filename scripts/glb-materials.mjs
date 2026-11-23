// Realistische Materialien für alle SKU-GLBs (Etappe B, 21.11.2026).
// node scripts/glb-materials.mjs public/models/sku [sku ...]
// Weist per Materialname Stofftexturen (Normalmaps), Glanz (Klarlack), Metall, Kork, MDF zu.
// Kachelgröße wird je Material physikalisch aus Fläche/UV-Fläche berechnet.
// Idempotent: vorhandene Texturen werden ersetzt, nicht gestapelt.
import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRTextureTransform, KHRMaterialsClearcoat, KHRMaterialsSheen } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";

const TEX = path.resolve("blender/textures");
const [dir, ...only] = process.argv.slice(2);

// [Muster im Materialnamen, Rezept]
const RULES = [
  [/Rippb|Rippbund|Gummizug/i, { normal: "rib_n.jpg", tile: 0.04, normalScale: 0.9, rough: 0.9 }],
  [/Frottee/i, { normal: "terry_n.jpg", tile: 0.03, normalScale: 1.0, rough: 0.95 }],
  [/Mikrofaser/i, { normal: "microfiber_n.jpg", tile: 0.02, normalScale: 0.6, rough: 0.85 }],
  [/Canvas|Gurtband|Kederband/i, { normal: "canvas_n.jpg", tile: 0.02, normalScale: 0.8, rough: 0.88 }],
  [/Polyester|Weißer Stoff|Textil|Kontrasteinsatz|Paspel|Einfassung|Merrow|Netz|Tasche|Naht/i,
    { normal: "jersey_n.jpg", tile: 0.02, normalScale: 0.55, rough: 0.86 }],
  [/Keramik|Porzellan|Emaille|Innenglasur/i, { rough: 0.06, clearcoat: 1, clearcoatRough: 0.03, noSheen: true }],
  [/Edelstahl|Aluminium(?! weiß)/i, { metal: 1, rough: 0.32, normal: "brushed_n.jpg", tile: 0.05, normalScale: 0.4, noSheen: true }],
  [/Metall|Schnalle(?! schwarz)|Karabiner|Öse|Reißverschluss(?! weiß)/i, { metal: 1, rough: 0.28, noSheen: true }],
  [/Kork/i, { color: "cork_c.jpg", normal: "cork_n.jpg", tile: 0.03, normalScale: 1.0, rough: 0.9, white: true, noSheen: true }],
  [/MDF|Holz/i, { color: "mdf_c.jpg", normal: "mdf_n.jpg", tile: 0.05, normalScale: 0.6, rough: 0.8, white: true, noSheen: true }],
  [/Druckfläche|Aluminium weiß/i, { rough: 0.32, clearcoat: 0.35, clearcoatRough: 0.15, noSheen: true }],
  [/Kunststoff|Gummisohle/i, { rough: 0.45, noSheen: true }],
];

function metersPerUv(prims) {
  let area = 0, uvArea = 0;
  for (const p of prims) {
    const pos = p.getAttribute("POSITION"), uv = p.getAttribute("TEXCOORD_0"), idx = p.getIndices();
    if (!pos || !uv) continue;
    const n = idx ? idx.getCount() : pos.getCount();
    const a = [], b = [], c = [], ua = [], ub = [], uc = [];
    for (let i = 0; i + 2 < n; i += 3) {
      const [i0, i1, i2] = idx ? [idx.getScalar(i), idx.getScalar(i + 1), idx.getScalar(i + 2)] : [i, i + 1, i + 2];
      pos.getElement(i0, a); pos.getElement(i1, b); pos.getElement(i2, c);
      uv.getElement(i0, ua); uv.getElement(i1, ub); uv.getElement(i2, uc);
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const cx = e1[1] * e2[2] - e1[2] * e2[1], cy = e1[2] * e2[0] - e1[0] * e2[2], cz = e1[0] * e2[1] - e1[1] * e2[0];
      area += Math.hypot(cx, cy, cz) / 2;
      uvArea += Math.abs((ub[0] - ua[0]) * (uc[1] - ua[1]) - (uc[0] - ua[0]) * (ub[1] - ua[1])) / 2;
    }
  }
  return uvArea > 1e-12 ? Math.sqrt(area / uvArea) : 0;
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const files = fs.readdirSync(dir).filter((f) => f.endsWith("-v1.glb") && (!only.length || only.includes(f.slice(0, 3)))).sort();
const report = [];
for (const f of files) {
  const file = path.join(dir, f);
  const doc = await io.read(file);
  const root = doc.getRoot();
  const tt = doc.createExtension(KHRTextureTransform);
  const cc = doc.createExtension(KHRMaterialsClearcoat);
  const texCache = new Map();
  const tex = (name) => {
    if (!texCache.has(name)) {
      texCache.set(name, doc.createTexture(name).setImage(fs.readFileSync(path.join(TEX, name))).setMimeType("image/jpeg").setURI(name));
    }
    return texCache.get(name);
  };
  const primsByMat = new Map();
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
    const m = p.getMaterial();
    if (m) primsByMat.set(m, [...(primsByMat.get(m) || []), p]);
  }
  const applied = [];
  for (const mat of root.listMaterials()) {
    const rule = RULES.find(([re]) => re.test(mat.getName() || ""));
    if (!rule) continue;
    const r = rule[1];
    if (r.rough !== undefined) mat.setRoughnessFactor(r.rough);
    if (r.metal !== undefined) mat.setMetallicFactor(r.metal);
    if (r.noSheen) mat.setExtension(KHRMaterialsSheen.EXTENSION_NAME, null);
    if (r.clearcoat) mat.setExtension(KHRMaterialsClearcoat.EXTENSION_NAME, cc.createClearcoat().setClearcoatFactor(r.clearcoat).setClearcoatRoughnessFactor(r.clearcoatRough ?? 0.05));
    const mpu = metersPerUv(primsByMat.get(mat) || []);
    const repeat = r.tile && mpu ? Math.max(1, mpu / r.tile) : 1;
    const transform = () => tt.createTransform().setScale([repeat, repeat]);
    if (r.normal && mpu) {
      mat.setNormalTexture(tex(r.normal)).setNormalScale(r.normalScale ?? 1);
      mat.getNormalTextureInfo().setExtension(KHRTextureTransform.EXTENSION_NAME, transform());
    }
    if (r.color && mpu) {
      if (r.white) mat.setBaseColorFactor([1, 1, 1, 1]);
      mat.setBaseColorTexture(tex(r.color));
      mat.getBaseColorTextureInfo().setExtension(KHRTextureTransform.EXTENSION_NAME, transform());
    }
    applied.push(`${mat.getName()}${r.normal ? ` ×${repeat.toFixed(1)}` : ""}`);
  }
  await doc.transform(prune());
  await io.write(file, doc);
  report.push(`${f.slice(0, 3)} ${(fs.statSync(file).size / 1024).toFixed(0)} KB: ${applied.join(", ") || "–"}`);
}
console.log(report.join("\n"));
