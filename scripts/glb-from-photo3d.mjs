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

// Foto-zu-3D liefert die Blickrichtung des Fotos, nicht die Shop-Ausrichtung (Front nach +Z):
// YAW=<Grad> dreht um die Hochachse, bevor eingepasst wird.
const yaw = (Number(process.env.YAW || 0) * Math.PI) / 180;
if (yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const R = [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  for (const mesh of doc.getRoot().listMeshes()) transformMesh(mesh, R);
}

const nb = getBounds(doc.getRoot().listScenes()[0]);
const nSize = nb.max.map((v, i) => v - nb.min[i]);
const nCenter = nb.max.map((v, i) => (v + nb.min[i]) / 2);
// Höhe (Y) ist bei aufrechten Artikeln das verlässlichste Maß; bei flachen die größte Kante
const k = rSize[1] > 0.3 * Math.max(...rSize) ? rSize[1] / nSize[1] : Math.max(...rSize) / Math.max(...nSize);
const T = [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0,
  rCenter[0] - nCenter[0] * k, rCenter[1] - nCenter[1] * k, rCenter[2] - nCenter[2] * k, 1];
for (const mesh of doc.getRoot().listMeshes()) transformMesh(mesh, T);

// ISLANDS=<Anteil> (z. B. 0.05): lose Teile mit weniger als diesem Anteil der Dreiecke entfernen
// (Foto-zu-3D modelliert Etiketten-/Logo-Reste gern als freischwebenden Ring).
if (process.env.ISLANDS) {
  await doc.transform(weld());
  const minShare = Number(process.env.ISLANDS);
  for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION"), idx = prim.getIndices();
    if (!pos || !idx) continue;
    const A = pos.getArray(), I = idx.getArray(), n = pos.getCount();
    const key = new Map(), gid = new Int32Array(n);
    for (let v = 0; v < n; v++) {
      const kk = `${Math.round(A[v * 3] * 1e5)},${Math.round(A[v * 3 + 1] * 1e5)},${Math.round(A[v * 3 + 2] * 1e5)}`;
      let g = key.get(kk); if (g === undefined) { g = key.size; key.set(kk, g); } gid[v] = g;
    }
    const par = Int32Array.from({ length: key.size }, (_, i) => i);
    const find = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
    for (let t = 0; t < I.length; t += 3) {
      const a = find(gid[I[t]]), b = find(gid[I[t + 1]]), c = find(gid[I[t + 2]]);
      par[b] = a; par[find(c)] = a;
    }
    const tris = I.length / 3, count = new Map();
    for (let t = 0; t < I.length; t += 3) { const r = find(gid[I[t]]); count.set(r, (count.get(r) || 0) + 1); }
    const keep = [];
    for (let t = 0; t < I.length; t += 3) if (count.get(find(gid[I[t]])) >= minShare * tris) keep.push(I[t], I[t + 1], I[t + 2]);
    const removed = tris - keep.length / 3;
    if (removed) {
      idx.setArray(new (I.constructor)(keep));
      console.error(`ISLANDS: ${removed} von ${tris} Dreiecken in ${[...count.values()].filter((c) => c < minShare * tris).length} losen Teilen entfernt`);
    }
  }
}

// SMOOTH="x0,x1,y0,y1" (Anteile der Breite / Höhe von oben): Beulen, die Foto-zu-3D aus
// Resten des Logo-Entfernens modelliert hat, an der Vorderseite glätten (Taubin, ohne
// Schrumpfen, weicher Übergang zum Rand). Die Stelle ist die Druckfläche – glatt ist dort richtig.
if (process.env.SMOOTH) {
  await doc.transform(weld());
  const [x0, x1, y0, y1] = process.env.SMOOTH.split(",").map(Number);
  const b = getBounds(doc.getRoot().listScenes()[0]);
  const sz = b.max.map((v, i) => v - b.min[i]);
  const zMid = (b.max[2] + b.min[2]) / 2;
  const cx = b.min[0] + sz[0] * (x0 + x1) / 2, rx = sz[0] * (x1 - x0) / 2;
  const cy = b.max[1] - sz[1] * (y0 + y1) / 2, ry = sz[1] * (y1 - y0) / 2;
  for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION"), idx = prim.getIndices();
    if (!pos || !idx) continue;
    const n = pos.getCount(), A = pos.getArray();
    // Punkte an gleicher Stelle (UV-Nähte) zu einer Gruppe zusammenfassen, sonst reißt die Fläche
    const gid = new Int32Array(n), key = new Map();
    for (let v = 0; v < n; v++) {
      const kk = `${Math.round(A[v * 3] * 1e5)},${Math.round(A[v * 3 + 1] * 1e5)},${Math.round(A[v * 3 + 2] * 1e5)}`;
      let g = key.get(kk); if (g === undefined) { g = key.size; key.set(kk, g); } gid[v] = g;
    }
    const m = key.size, P = new Float32Array(m * 3);
    for (let v = 0; v < n; v++) P.set([A[v * 3], A[v * 3 + 1], A[v * 3 + 2]], gid[v] * 3);
    const nb = Array.from({ length: m }, () => new Set());
    const I = idx.getArray();
    for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) {
      const a = gid[I[t + e]], c = gid[I[t + ((e + 1) % 3)]]; if (a !== c) { nb[a].add(c); nb[c].add(a); }
    }
    // Gewicht 1 im Kern, weich auslaufend bis 1,35 × Ellipse; nur vordere Hälfte
    const w = new Float32Array(m);
    for (let v = 0; v < m; v++) {
      if (P[v * 3 + 2] < zMid) continue;
      const d = Math.hypot((P[v * 3] - cx) / rx, (P[v * 3 + 1] - cy) / ry);
      w[v] = d <= 1 ? 1 : d >= 1.35 ? 0 : 0.5 + 0.5 * Math.cos(((d - 1) / 0.35) * Math.PI);
    }
    const step = (f) => {
      const Q = P.slice();
      for (let v = 0; v < m; v++) {
        if (!w[v] || !nb[v].size) continue;
        let sx = 0, sy = 0, sz2 = 0;
        for (const u of nb[v]) { sx += P[u * 3]; sy += P[u * 3 + 1]; sz2 += P[u * 3 + 2]; }
        const k2 = nb[v].size, a = f * w[v];
        Q[v * 3] += a * (sx / k2 - P[v * 3]); Q[v * 3 + 1] += a * (sy / k2 - P[v * 3 + 1]); Q[v * 3 + 2] += a * (sz2 / k2 - P[v * 3 + 2]);
      }
      P.set(Q);
    };
    const iters = Number(process.env.SMOOTH_ITERS || 40);
    for (let i = 0; i < iters; i++) { step(0.5); step(-0.53); }
    const out = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) out.set(P.subarray(gid[v] * 3, gid[v] * 3 + 3), v * 3);
    pos.setArray(out);
    prim.getAttribute("NORMAL")?.dispose();
  }
}

// WHITE=1: Foto-Textur verwerfen (Reste vom Logo-Entfernen), reines Weiß; Falten/Nähte
// stecken in der Geometrie bzw. Normal-Map und bleiben erhalten.
const white = !!process.env.WHITE;
for (const mat of doc.getRoot().listMaterials()) {
  if (white) { mat.setBaseColorTexture(null); mat.setBaseColorFactor([0.93, 0.93, 0.92, 1]); if (process.env.WHITE === "2") mat.setNormalTexture(null); }
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
