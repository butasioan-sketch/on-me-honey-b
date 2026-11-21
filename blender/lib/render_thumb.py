"""Vorschaubild eines SKU-GLB für Übersichten (Kategorie, Startseite, Admin), ersetzt die alten Produktfotos.

blender -b -t 2 --python blender/lib/render_thumb.py -- <glb> <out_png>
Leicht gedrehte Vorderansicht (Perspektive), 600x800, transparenter Hintergrund.
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
glb, out_png = argv[0], argv[1]

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
scene.cycles.samples = 24
scene.cycles.use_denoising = False
scene.cycles.device = "CPU"
scene.render.resolution_x, scene.render.resolution_y = 600, 800
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
scene.view_settings.look = "None"

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
scene.world = world

fov = math.radians(30)
cam_data = bpy.data.cameras.new("cam")
cam_data.angle = fov
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
# Abstand so, dass die Bounding-Kugel in die schmalere Bildachse passt (Breite, 3:4)
dist = radius / math.sin(fov * 0.75 / 2) * 1.05
yaw = math.radians(-25)  # leicht von links vorne
cam.location = center + Vector((math.sin(-yaw) * dist * -1, -math.cos(yaw) * dist, size.z * 0.12))
direction = center - cam.location
cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

key = bpy.data.objects.new("key", bpy.data.lights.new("key", "SUN"))
key.data.energy = 2.8
key.rotation_euler = (math.radians(55), 0, math.radians(-30))
scene.collection.objects.link(key)
fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "SUN"))
fill.data.energy = 0.6
fill.rotation_euler = (math.radians(70), 0, math.radians(140))
scene.collection.objects.link(fill)

scene.render.filepath = out_png
bpy.ops.render.render(write_still=True)
print("THUMB_OK", out_png)
