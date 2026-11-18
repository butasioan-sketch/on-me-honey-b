"""Eigenes Modell SKU 133: Schuhzunge mit Stichlöchern und Gummiband
Referenz: public/products/133/front.jpg (Rohling offen)
Maße: Schätzwerte 9 × 17 cm.

blender -b -t 1 --python blender/133/build_133.py -- public/models/sku/133-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, path_tube  # noqa: E402

CANVAS = ("Canvas weiß", (0.93, 0.93, 0.93), 0.85)
GORE = ("Gummizug", (0.86, 0.86, 0.87), 0.9)
WIDTH, HEIGHT = 0.090, 0.170

b = Builder("Tongue133", [CANVAS, GORE])


def surface(u, v):
    x = (u - 0.5) * WIDTH * (0.86 + 0.14 * v)
    h = HEIGHT * v - 0.017 * (2 * u - 1) ** 4 * v ** 6
    d = 0.015 * math.sin(math.pi * v) + 0.003 * math.sin(math.pi * u) ** 2
    return x, h, d


nu, nv = 32, 36
holes = {(int(u * nu), int((0.14 + row * 0.086) * nv))
         for row in range(9) for u in (0.12, 0.88)}
rows = []
for j in range(nv + 1):
    vertices = []
    for i in range(nu + 1):
        x, h, d = surface(i / nu, j / nv)
        vertices.append(b.bm.verts.new(b.V(x, h, d)))
    rows.append(vertices)

for j in range(nv):
    for i in range(nu):
        if (i, j) not in holes:
            b.bm.faces.new([rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]])

band = []
for i in range(17):
    x, h, d = surface(0.04 + 0.92 * i / 16, 0.055)
    band.append((x, h, d + 0.001))
path_tube(b, band, 0.0045, seg=10, mat=1, flat=0.35)

b.finish(thickness=0.0018, rim_only=False, smooth=True)
