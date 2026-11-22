// Foto-zu-3D-Ergebnis (TRELLIS/Tripo) in ein Shop-GLB umwandeln.
// node scripts/glb-from-photo3d.mjs <neu.glb> <ziel.glb> [referenz.glb]
// - Transformationen backen, Knoten zurücksetzen
// - auf Größe und Mitte des bisherigen Shop-Modells (Referenz, Standard: Ziel) einpassen,
//   damit Kamera, Druckfläche (relativ zur Bounding-Box) und Vorschau gleich bleiben
// - Mesh verschweißen und vereinfachen, Textur 1024 px WebP, Draco-Kompression
// - Material: nicht metallisch, stoffartig matt (Fotos zeigen Textil/Kunststoff)
import fs from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { transformMesh, weld, simplify, textureCompress, draco, prune, dedup, getBounds } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const [src, dst, refArg] = process.argv.slice(2);
const ref = refArg || dst;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "draco3d.decoder": await draco3d.createDecoderModule(),
});

const refDoc = await io.read(ref);
const rb = getBounds(refDoc.getRoot().listScenes()[0]);
const rSize = rb.max.map((v, i) => v - rb.min[i]);
const rCenter = rb.max.map((v, i) => (v + rb.min[i]) / 2);

const doc = await io.read(src);
const done = new Set();
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (mesh && !done.has(mesh)) { transformMesh(mesh, node.getWorldMatrix()); done.add(mesh); }
}
for (const node of doc.getRoot().listNodes()) { node.setTranslation([0, 0, 0]); node.setRotation([0, 0, 0, 1]); node.setScale([1, 1, 1]); }

const nb = getBounds(doc.getRoot().listScenes()[0]);
const nSize = nb.max.map((v, i) => v - nb.min[i]);
const nCenter = nb.max.map((v, i) => (v + nb.min[i]) / 2);
// Höhe (Y) ist bei aufrechten Artikeln das verlässlichste Maß; bei flachen die größte Kante
const k = rSize[1] > 0.3 * Math.max(...rSize) ? rSize[1] / nSize[1] : Math.max(...rSize) / Math.max(...nSize);
const T = [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0,
  rCenter[0] - nCenter[0] * k, rCenter[1] - nCenter[1] * k, rCenter[2] - nCenter[2] * k, 1];
for (const mesh of doc.getRoot().listMeshes()) transformMesh(mesh, T);

for (const mat of doc.getRoot().listMaterials()) {
  mat.setMetallicFactor(0);
  mat.setRoughnessFactor(0.82);
  mat.setDoubleSided(true);
}

await MeshoptSimplifier.ready;
await doc.transform(
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.0008 }),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 88 }),
  prune(),
  // Blender (Distributions-Build) kann kein Draco lesen: NODRACO=1 für Render-Kopien
  ...(process.env.NODRACO ? [] : [draco()]),
);
const fb = getBounds(doc.getRoot().listScenes()[0]);
await io.write(dst, doc);
const kb = Math.round(fs.statSync(dst).size / 1024);
console.log(JSON.stringify({ dst, kb, scale: +k.toFixed(4), size: fb.max.map((v, i) => +(v - fb.min[i]).toFixed(3)), refSize: rSize.map((v) => +v.toFixed(3)) }));
