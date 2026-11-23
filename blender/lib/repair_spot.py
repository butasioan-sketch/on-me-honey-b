"""Einzelnen Geometriefehler (Delle/Splitter) eines Foto-zu-3D-Netzes reparieren:
Ecken im Umkreis r um den Punkt stark glätten (Flächen und UVs bleiben).
blender -b --python blender/lib/repair_spot.py -- <in.glb> <out.glb> x y z r
Punkt (glTF-Koordinaten wie in Blender importiert) z. B. per Raycast aus dem Studio-Render."""
import sys
import bpy
import bmesh
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1:]
src, dst = a[0], a[1]
p = Vector(map(float, a[2:5]))
r = float(a[5])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
bm = bmesh.new()
bm.from_mesh(ob.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
mw = ob.matrix_world
# Nur glätten (UVs bleiben erhalten): innen stark, zum Rand hin schwächer
for ring, it in ((1.0, 40), (1.6, 10)):
    near = [v for v in bm.verts if (mw @ v.co - p).length < r * ring]
    for _ in range(it):
        bmesh.ops.smooth_vert(bm, verts=near, factor=0.7, use_axis_x=True, use_axis_y=True, use_axis_z=True)
print("SPOT_VERTS", len([v for v in bm.verts if (mw @ v.co - p).length < r]))
filled = []
bm.to_mesh(ob.data)
bm.free()
bpy.ops.export_scene.gltf(filepath=dst, export_format="GLB")
print("REPAIR_OK", len(filled))
