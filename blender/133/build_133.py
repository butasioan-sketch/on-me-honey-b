"""Eigenes Modell SKU 133: Schuhzunge mit Stichlöchern und Gummiband
Referenz: public/products/133/front.jpg (Rohling offen)
Maße: Schätzwerte 9 × 17 cm.

blender -b -t 1 --python blender/133/build_133.py -- public/models/sku/133-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, path_tube  # noqa: E402

CANVAS = ("Canvas weiß", (0.93, 0.93, 0.93), 0.85)
GORE = ("Gummizug", (0.86, 0.86, 0.87), 0.9)
HOLE = ("Ösenmarkierung", (0.25, 0.25, 0.27), 0.5)
WIDTH, HEIGHT = 0.090, 0.170

b = Builder("Tongue133", [CANVAS, HOLE, GORE])


def surface(u, v):
    x = (u - 0.5) * WIDTH * (0.86 + 0.14 * v)
    h = HEIGHT * v - 0.017 * (2 * u - 1) ** 4 * v ** 6
    d = 0.015 * math.sin(math.pi * v) + 0.003 * math.sin(math.pi * u) ** 2
    return x, h, d


def tongue_shape(_p, u, v):
    x, h, d = surface(u, v)
    return Vector((x, d, h))


b.sheet(WIDTH, HEIGHT, nu=32, nv=36, transform=tongue_shape)
band = []
for i in range(17):
    x, h, d = surface(0.04 + 0.92 * i / 16, 0.055)
    band.append((x, h, d + 0.001))
path_tube(b, band, 0.0045, seg=10, mat=2, flat=0.35)

for row in range(9):
    v = 0.14 + row * 0.086
    for u in (0.12, 0.88):
        path = []
        for dv in (-0.006, 0.006):
            x, h, d = surface(u, v + dv)
            path.append((x, h, d + 0.0012))
        path_tube(b, path, 0.0013, seg=8, mat=1, flat=0.5)

b.finish(thickness=0.0018, smooth=True)
