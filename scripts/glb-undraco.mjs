// Draco-GLB → unkomprimierte Kopie für Blender (Distributions-Builds lesen kein Draco).
//   node scripts/glb-undraco.mjs <in.glb> <out.glb>
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Aufruf: node scripts/glb-undraco.mjs <in.glb> <out.glb>");
  process.exit(1);
}
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "draco3d.decoder": await draco3d.createDecoderModule() });
const doc = await io.read(input);
for (const ext of doc.getRoot().listExtensionsUsed()) {
  if (ext.extensionName === "KHR_draco_mesh_compression") ext.dispose();
}
await io.write(output, doc);
