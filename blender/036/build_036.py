"""Eigenes Modell SKU 036: Kleine Sporttasche (Duffel) mit schwarzen Griffen und Reißverschluss
Referenz: public/products/036/front.jpg (Rohling offen)
Maße: Schätzwerte 40 × 25 × 20 cm.

blender -b -t 1 --python blender/036/build_036.py -- public/models/sku/036-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
BLACK = ("Gurtband schwarz", (0.05, 0.05, 0.06), 0.7)
ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Duffel036", [WHITE, BLACK, ZIP])
# Querschnitt wird entlang x geloftet: Ringe liegen in der h-d-Ebene
rings = []
for k in range(21):
    t = k / 20
    x = -0.20 + 0.40 * t
    s = 1 - 0.06 * (2 * t - 1) ** 6
    ring = [(x, 0.125 + 0.12 * s * c[0] / 0.1, 0.10 * s * c[2] / 0.1) for c in se_ring(0.1, 0.1, 2.6, 40)]
    rings.append(ring)
_loft(b, rings, mat_fn=lambda i, j: 2 if i in (39, 0) and 2 <= j <= 17 else 0, cap_bottom=True, cap_top=True, cap_mat=0)  # Reißverschluss oben entlang
for side in (-1, 1):
    path_tube(b, arc((-0.08, 0.235, side * 0.03), (0.08, 0.235, side * 0.03), 0.10, n=16), 0.008, seg=8, mat=1, flat=0.35)
b.finish(thickness=0)
