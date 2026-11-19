"""Skaliert ein vorhandenes SKU-GLB gleichmäßig, sodass die größte Abmessung OHNE Ring/Öse
(Mesh mit der größten Fläche) dem Zielmaß entspricht. Für Modelle ohne eigenes Bauskript.

blender -b -t 1 --python blender/lib/rescale_glb.py -- <in.glb> <out.glb> <ziel_cm>
"""
import sys

import bpy

src, dst, target_cm = sys.argv[sys.argv.index("--") + 1:][:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]


def area(o):
    return sum(p.area for p in o.data.polygons) * max(o.matrix_world.to_scale()) ** 2


main = max(meshes, key=area)
dims = main.dimensions
factor = (float(target_cm) / 100) / max(dims)
roots = [o for o in bpy.context.scene.objects if o.parent is None]
for o in roots:
    o.scale = [s * factor for s in o.scale]
    o.location = [c * factor for c in o.location]
bpy.context.view_layer.update()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=dst, export_format="GLB", export_draco_mesh_compression_enable=False,
                          export_apply=True, export_yup=True)
print(f"RESCALE {src} Hauptteil {max(dims)*100:.1f} cm -> {target_cm} cm (Faktor {factor:.3f})")
