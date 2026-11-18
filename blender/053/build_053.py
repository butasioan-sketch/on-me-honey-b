"""SKU 053 display model from public/products/053/front.jpg.

Dimensions and reverse construction are provisional until a sample is available.
blender -b -t 1 --python blender/053/build_053.py -- out.glb [source.blend]
"""
import math
import sys
from pathlib import Path

import bpy

args = sys.argv[sys.argv.index("--") + 1:]
output = Path(args[0]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

divisions, half_width, half_height = 36, 0.205, 0.195
row_size = divisions + 1


def point(u, v, side):
    corner = (abs(u * v) ** 13) * 0.013
    x = u * half_width * (0.945 + 0.055 * abs(v) ** 3) - math.copysign(corner, u)
    z = v * half_height * (0.95 + 0.05 * abs(u) ** 3) - math.copysign(corner, v)
    loft = max(0, (1 - u**2) * (1 - v**2)) ** 0.54
    folds_x = math.exp(-((abs(u) - 0.86) / 0.14) ** 2) * math.sin(13 * v + 1.3 * side)
    folds_z = math.exp(-((abs(v) - 0.89) / 0.12) ** 2) * math.sin(18 * u - side)
    return (x, side * loft * (0.071 + 0.009 * (folds_x + folds_z)), z)


def material(name, color):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (color, color, color, 1)
    p.inputs["Roughness"].default_value = 0.79
    p.inputs["Sheen Weight"].default_value = 0.29
    return m


samples = [2 * i / divisions - 1 for i in range(row_size)]
vertices = [point(u, v, side) for side in (-1, 1) for v in samples for u in samples]
faces = []
for panel in range(2):
    for r in range(divisions):
        for c in range(divisions):
            i = panel * row_size**2 + r * row_size + c
            face = (i, i + 1, i + row_size + 1, i + row_size)
            faces.append(face[::-1] if panel else face)

mesh = bpy.data.meshes.new("Stoffflächen mit Randfalten")
mesh.from_pydata(vertices, [], faces)
mesh.update()
obj = bpy.data.objects.new("SKU 053 · Zierkissenbezug mit Keder", mesh)
bpy.context.collection.objects.link(obj)
mesh.materials.append(material("Weißer Stoff", 0.92))
uv = mesh.uv_layers.new(name="Panel UV")
for f in mesh.polygons:
    f.use_smooth = True
    for loop in f.loop_indices:
        vertex = mesh.loops[loop].vertex_index
        panel, index = divmod(vertex, row_size**2)
        r, c = divmod(index, row_size)
        uv.data[loop].uv = ((c if panel == 0 else divisions - c) / divisions, r / divisions)

edge = [(u, -1) for u in samples[:-1]]
edge += [(1, v) for v in samples[:-1]]
edge += [(-u, 1) for u in samples[:-1]]
edge += [(-1, -v) for v in samples[:-1]]
curve = bpy.data.curves.new("Umlaufender runder Keder", "CURVE")
curve.dimensions = "3D"
curve.bevel_depth = 0.0021
curve.bevel_resolution = 2
spline = curve.splines.new("POLY")
spline.points.add(len(edge) - 1)
for control, (u, v) in zip(spline.points, edge):
    control.co = (*point(u, v, 1), 1)
spline.use_cyclic_u = True
pipe = bpy.data.objects.new("Keder", curve)
bpy.context.collection.objects.link(pipe)
curve.materials.append(material("Weißes Kederband", 0.82))

assert not mesh.validate()
assert len(mesh.polygons) == 2 * divisions**2
assert len(spline.points) == 4 * divisions
for part in (obj, pipe):
    part.select_set(True)
if len(args) > 1:
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[1]).resolve()))
bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", use_selection=True,
                          export_draco_mesh_compression_enable=False)
