"""Eigenes Modell SKU 132: Schuhoberteil: flach liegender Zuschnitt mit Ösenreihen
Referenz: public/products/132/front.jpg (Rohling offen)
Maße: Schätzwerte 30 × 22 cm.

blender -b -t 1 --python blender/132/build_132.py -- public/models/sku/132-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, path_tube  # noqa: E402

CANVAS = ("Canvas weiß", (0.93, 0.93, 0.93), 0.85)
HOLE = ("Ösenmarkierung", (0.25, 0.25, 0.27), 0.5)
WIDTH, HEIGHT = 0.22, 0.30

b = Builder("Upper132", [CANVAS, HOLE])


def surface(u, v):
    width = WIDTH * (0.64 + 0.36 * math.sin(math.pi * 0.78 * v) ** 1.2)
    h = HEIGHT * v - 0.024 * (2 * u - 1) ** 4 * v ** 6
    d = 0.0016 * math.sin(6 * u + 4 * v)
    return (u - 0.5) * width, h, d


def upper_shape(_p, u, v):
    x, h, d = surface(u, v)
    return Vector((x, d, h))


def on_surface(u, v, offset):
    x, h, d = surface(u, v)
    return x, h, d + offset


b.sheet(WIDTH, HEIGHT, nu=28, nv=36, transform=upper_shape)
for row in range(6):
    v = 0.20 + row * 0.073
    for u in (0.35, 0.65):
        path = [on_surface(u, v + step, 0.0017) for step in (-0.005, 0.005)]
        path_tube(b, path, 0.0024, seg=10, mat=1, flat=0.35)

corners = [(0.08, 0.04), (0.92, 0.04), (0.92, 0.96), (0.08, 0.96), (0.08, 0.04)]
seam = []
for (u0, v0), (u1, v1) in zip(corners, corners[1:]):
    for i in range(22):
        t = i / 22
        seam.append(on_surface(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t, 0.0013))
seam.append(seam[0])
path_tube(b, seam, 0.0012, seg=8, mat=0, flat=0.65)

b.finish(thickness=0.0018)
