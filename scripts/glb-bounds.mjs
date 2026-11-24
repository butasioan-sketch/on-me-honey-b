// Maße (x = Breite, y = Höhe, z = Tiefe) von GLB-Dateien: node scripts/glb-bounds.mjs <a.glb> [...]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "draco3d.decoder": await draco3d.createDecoderModule() });
for (const f of process.argv.slice(2)) {
  const d = await io.read(f); const b = getBounds(d.getRoot().listScenes()[0]);
  const s = b.max.map((v, i) => (v - b.min[i]).toFixed(3));
  console.log(f.split("/").pop().slice(0, 3), "x", s[0], "y", s[1], "z", s[2]);
}
