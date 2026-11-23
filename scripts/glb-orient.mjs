// Dreht SKU-GLBs verlustfrei (Geometrie gebacken, Materialien unverändert).
// node scripts/glb-orient.mjs <x|y> public/models/sku <sku ...>
//   x: Rx(+90°) – flach liegende Artikel aufrichten (+Y-Fläche zeigt nach vorn, +Z)
//   y: Ry(+90°) – Längsseite nach vorn (Schuhe)
// Nach jedem Neubau aus blender/<sku>/build_<sku>.py erneut anwenden:
//   x: 029 030 048 052 055 057 058 059 060 061 123 124 125 126   y: 130 131
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { transformMesh } from "@gltf-transform/functions";

const [axis, dir, ...skus] = process.argv.slice(2);
const M = axis === "y" ? [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1] : [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const sku of skus) {
  const file = `${dir}/${sku}-v1.glb`;
  const doc = await io.read(file);
  const done = new Set();
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh || done.has(mesh)) continue;
    transformMesh(mesh, node.getWorldMatrix());
    transformMesh(mesh, M);
    done.add(mesh);
  }
  for (const node of doc.getRoot().listNodes()) { node.setTranslation([0, 0, 0]); node.setRotation([0, 0, 0, 1]); node.setScale([1, 1, 1]); }
  await io.write(file, doc);
  console.log("gedreht", axis, sku);
}
