"""Original SKU 051 model. Run with Blender in background mode.

blender -b -t 4 --python blender/051/build_051.py -- output.glb [source.blend]
"""
import math
import sys
from pathlib import Path

import bpy

SIZE = 0.40
SEGMENTS = 32
HALF_DEPTH = 0.064  # Estimated fill for the preview. The cover is sold separately.

args = sys.argv[sys.argv.index("--") + 1:]
output = Path(args[0]).resolve()
output.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"


def cloth_material(name, color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (color, color, color, 1)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = material.diffuse_color
    shader.inputs["Roughness"].default_value = 0.82
    shader.inputs["Sheen Weight"].default_value = 0.24
    return material


cloth = cloth_material("Weiße Polyester-Mikrofaser", 0.93)
seam_cloth = cloth_material("Naht und verdeckte Reißverschlussblende", 0.78)


def surface(u, v, side):
    # A gently concave sewn outline with small rounded corners.
    x = SIZE / 2 * u * (0.90 + 0.10 * (abs(v) ** 2))
    z = SIZE / 2 * v * (0.90 + 0.10 * (abs(u) ** 2))
    round_corner = (abs(u * v) ** 20) * 0.005
    x -= math.copysign(round_corner, u)
    z -= math.copysign(round_corner, v)
    # Tension closes the two panels at the seam; wrinkles taper toward the centre.
    loft = max(0, (1 - u * u) * (1 - v * v)) ** 0.63
    edge_v = math.exp(-((abs(v) - 0.84) / 0.12) ** 2)
    edge_u = math.exp(-((abs(u) - 0.85) / 0.11) ** 2)
    folds = 0.007 * (
        edge_v * math.sin(16 * u + 4 * v + side) +
        edge_u * math.sin(14 * v - 5 * u - side)
    )
    return (x, side * loft * (HALF_DEPTH + folds + side * 0.002 * u), z)


width = SEGMENTS + 1
vertices, faces = [], []
for side in (-1, 1):
    offset = len(vertices)
    for row in range(width):
        for col in range(width):
            vertices.append(surface(2 * col / SEGMENTS - 1, 2 * row / SEGMENTS - 1, side))
    for row in range(SEGMENTS):
        for col in range(SEGMENTS):
            cell = offset + row * width + col
            face = (cell, cell + 1, cell + 1 + width, cell + width)
            faces.append(face if side < 0 else face[::-1])

mesh = bpy.data.meshes.new("Vorder- und Rückseite")
mesh.from_pydata(vertices, [], faces)
mesh.update()
pillow = bpy.data.objects.new("SKU 051 · Kissenbezug 40 × 40 cm", mesh)
bpy.context.collection.objects.link(pillow)
mesh.materials.append(cloth)
uv = mesh.uv_layers.new(name="Panel UV")
for face in mesh.polygons:
    face.use_smooth = True
    for loop_index in face.loop_indices:
        vertex = mesh.loops[loop_index].vertex_index
        row, col = divmod(vertex % (width * width), width)
        # Vorderseite links (u 0..0,5), Rückseite rechts (u 0,5..1): getrennte Motive vorne/hinten
        uv.data[loop_index].uv = (0.5 * col / SEGMENTS if vertex < width * width else 0.5 + 0.5 * (1 - col / SEGMENTS), row / SEGMENTS)


def add_seam(name, points, radius, closed=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, location in zip(spline.points, points):
        point.co = (*location, 1)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    curve.materials.append(seam_cloth)
    return obj


samples = [2 * i / SEGMENTS - 1 for i in range(SEGMENTS)]
boundary = (
    [(u, -1) for u in samples] + [(1, v) for v in samples] +
    [(-u, 1) for u in samples] + [(-1, -v) for v in samples]
)
seam = add_seam("Umlaufende Kantennähte", [surface(u, v, 1) for u, v in boundary], 0.0009, True)
# The supplier specifies a 30 cm concealed zip. The fold represents the cover flap.
zip_points = []
for i in range(31):
    u = -0.81 + 1.62 * i / 30
    x, y, z = surface(u, -0.985, -1)
    zip_points.append((x, y - 0.0006, z))
zip_flap = add_seam("Verdeckter 30-cm-Reißverschluss · Blende", zip_points, 0.0011)

assert len(mesh.polygons) == 2 * SEGMENTS**2
assert len(mesh.uv_layers) == 1
assert max(v[1] for v in vertices) - min(v[1] for v in vertices) > 0.12
if len(args) > 1:
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[1]).resolve()))
for obj in (pillow, seam, zip_flap):
    obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_draco_mesh_compression_enable=False,
)
