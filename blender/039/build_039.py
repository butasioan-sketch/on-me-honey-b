"""Eigenes Modell SKU 039: Federmäppchen: dreieckiges Prisma mit schwarzem Reißverschluss
Referenz: public/products/039/front.jpg (Rohling offen)
Maße: Schätzwerte 22 × 8 × 8 cm.

blender -b -t 1 --python blender/039/build_039.py -- public/models/sku/039-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Pencil039", [WHITE, ZIP])
rings = []
for k in range(17):
    x = -0.11 + 0.22 * k / 16
    tri = []
    for a in range(36):
        phi = 2 * math.pi * a / 36
        r = 1 / math.cos((phi % (2 * math.pi / 3)) - math.pi / 3)   # Dreieck
        r = min(r, 1.6)
        tri.append((x, 0.045 + 0.045 * r * math.cos(phi) * 0.92, 0.045 * r * math.sin(phi) * 0.92))
    rings.append(tri)
_loft(b, rings, mat_fn=lambda i, j: 1 if i in (0, 1, 35) else 0, cap_bottom=True, cap_top=True, cap_mat=0)
b.finish(thickness=0)
