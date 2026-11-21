"""Studio-Produktfoto eines SKU-GLB (ersetzt die alten Produktfotos in Übersichten).

blender -b -t 2 --python blender/lib/render_studio.py -- <glb> <out_png> [samples]
Wie die früheren Produktfotos: nahezu frontal, hellgraue Hohlkehle, große Softboxen,
weicher Bodenschatten, gerendert 900x1200, ausgeliefert 600x800 (3:4).
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
glb, out_png = argv[0], argv[1]
samples = int(argv[2]) if len(argv) > 2 else 64

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
center = (mn + mx) / 2
size = mx - mn
radius = max(size.length / 2, 1e-3)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = samples
# Distributions-Blender ohne OpenImageDenoise: Rauschen über adaptive Samples + 1,5-fache
# Überabtastung (900x1200 rendern, beim Konvertieren auf 600x800 verkleinern) senken.
scene.cycles.use_denoising = False
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.02
scene.cycles.device = "CPU"
scene.render.resolution_x, scene.render.resolution_y = 600, 800
vt = [i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items]
scene.view_settings.view_transform = "AgX" if "AgX" in vt else "Filmic"
scene.view_settings.exposure = 0.0
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass
scene.cycles.max_bounces = 4
scene.cycles.diffuse_bounces = 2
scene.cycles.glossy_bounces = 2
scene.cycles.transmission_bounces = 2

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.82, 0.82, 0.83, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.12
scene.world = world

# Hohlkehle: Boden (vorn) geht in einem Viertelkreis in die Rückwand über
floor_z = mn.z
span = radius * 12
back_y = mx.y + radius * 1.2
r = radius * 1.5
verts = [(center.x - span, center.y - span, floor_z), (center.x + span, center.y - span, floor_z)]
steps = 16
for i in range(steps + 1):
    a = i / steps * math.pi / 2
    yy = back_y - r + math.sin(a) * r
    zz = floor_z + (1 - math.cos(a)) * r
    verts += [(center.x - span, yy, zz), (center.x + span, yy, zz)]
verts += [(center.x - span, back_y, floor_z + span), (center.x + span, back_y, floor_z + span)]
faces = [(i, i + 1, i + 3, i + 2) for i in range(0, len(verts) - 2, 2)]
me = bpy.data.meshes.new("cyc")
me.from_pydata(verts, [], faces)
cyc = bpy.data.objects.new("cyc", me)
scene.collection.objects.link(cyc)
mat = bpy.data.materials.new("studio")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.42, 0.42, 0.43, 1)
bsdf.inputs["Roughness"].default_value = 0.9
cyc.data.materials.append(mat)

# Kamera: fast frontal, leicht erhöht
fov = math.radians(28)
cam_data = bpy.data.cameras.new("cam")
cam_data.angle = fov
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
dist = radius / math.sin(fov * 0.75 / 2) * 1.02
yaw = math.radians(-8)
cam.location = center + Vector((math.sin(yaw) * dist, -math.cos(yaw) * dist, size.z * 0.10))
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()


def softbox(name, loc, energy, sz):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = energy * radius ** 2  # W, skaliert mit Objektgröße
    d.size = sz * radius
    o = bpy.data.objects.new(name, d)
    o.location = center + Vector(loc) * radius
    o.rotation_euler = (center - o.location).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(o)


softbox("key", (-2.4, -2.4, 2.2), 300, 2.2)
softbox("fill", (2.6, -2.2, 0.6), 45, 4.0)
softbox("top", (0.6, 1.4, 3.0), 80, 2.5)

scene.render.filepath = out_png
bpy.ops.render.render(write_still=True)
print("THUMB_OK", out_png)
