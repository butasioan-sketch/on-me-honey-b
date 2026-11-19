"""SKU 052, folded pillowcase from public/products/052/front.jpg.

The supplier and physical dimensions are pending. Dimensions below are estimates
for the folded display shape and do not establish the opened cover's print area.

blender -b -t 1 --python blender/052/build_052.py -- public/models/sku/052-v1.glb [source.blend]
"""
import math
import sys
from pathlib import Path

import bpy

args = sys.argv[sys.argv.index("--") + 1:]
output = Path(args[0]).resolve()
output.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"
width, half_depth, radius = 0.32, 0.117, 0.005
across, run_steps, arc_steps = 26, 18, 8
section = []
for layer in range(4):
    direction = 1 if layer % 2 == 0 else -1
    for step in range(run_steps + 1):
        if layer and step == 0:
            continue
        t = step / run_steps
        section.append((direction * (2 * t - 1) * half_depth, layer * radius * 2))
    if layer == 3:
        break
    for step in range(1, arc_steps + 1):
        angle = math.pi * step / arc_steps
        section.append((
            direction * (half_depth + radius * math.sin(angle)),
            layer * radius * 2 + radius * (1 - math.cos(angle)),
        ))

vertices, faces = [], []
for row, (y, z) in enumerate(section):
    for col in range(across + 1):
        u = 2 * col / across - 1
        edge = (abs(y) / (half_depth + radius)) ** 4
        t = row / (len(section) - 1)
        wrinkle = 0.0017 * edge * math.sin(17 * u + 9 * t)
        curl = 0.009 * (max(0, t - 0.91) / 0.09) ** 2 * max(0, u) ** 2
        x = u * (width / 2 - 0.004 * edge) + 0.002 * math.sin(6 * t)
        vertices.append((x, y + 0.002 * math.sin(u * 6 + t * 5) * edge, z + wrinkle + curl - 3 * radius))
    if row == 0:
        continue
    for col in range(across):
        i = (row - 1) * (across + 1) + col
        faces.append((i, i + 1, i + across + 2, i + across + 1))

mesh = bpy.data.meshes.new("Gefaltete Stoffbahn")
mesh.from_pydata(vertices, [], faces)
mesh.update()
obj = bpy.data.objects.new("SKU 052 · gefalteter Kopfkissenbezug", mesh)
bpy.context.collection.objects.link(obj)

material = bpy.data.materials.new("Weißer Mikrofaserstoff")
material.use_nodes = True
shader = material.node_tree.nodes.get("Principled BSDF")
shader.inputs["Base Color"].default_value = (0.93, 0.93, 0.93, 1)
shader.inputs["Roughness"].default_value = 0.8
shader.inputs["Sheen Weight"].default_value = 0.23
mesh.materials.append(material)
uv = mesh.uv_layers.new(name="Stoffbahn UV")
for polygon in mesh.polygons:
    polygon.use_smooth = True
    for loop_id in polygon.loop_indices:
        row, col = divmod(mesh.loops[loop_id].vertex_index, across + 1)
        uv.data[loop_id].uv = (col / across, row / (len(section) - 1))

solidify = obj.modifiers.new("Stoffstärke", "SOLIDIFY")
solidify.thickness = 0.0014
assert len(faces) == (len(section) - 1) * across
assert mesh.validate() is False
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
if len(args) > 1:
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[1]).resolve()))
bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", use_selection=True,
                          export_apply=True, export_draco_mesh_compression_enable=False)
