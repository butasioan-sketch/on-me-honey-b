"""Eigenes Modell SKU 042: Brillenetui: Hartschalen-Kapsel mit umlaufendem Reißverschluss
Referenz: public/products/042/front.jpg (Rohling offen)
Maße: Schätzwerte 16 × 6,5 × 4,5 cm.

blender -b -t 1 --python blender/042/build_042.py -- public/models/sku/042-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIPW = ("Reißverschluss weiß", (0.86, 0.86, 0.87), 0.5)
b = Builder("Glasses042", [WHITE, ZIPW])
rings = []
n = 40
for k in range(n + 1):
    t = k / n
    x = -0.08 + 0.16 * t
    e = math.sqrt(max(0.0, 1 - (2 * t - 1) ** 8))       # runde Enden
    rings.append([(x, 0.0325 + 0.0325 * e * c[0] / 0.1, 0.0225 * e * c[2] / 0.1) for c in se_ring(0.1, 0.1, 2.4, 40)])
_loft(b, rings, mat_fn=lambda i, j: 1 if i in (10, 30) else 0, cap_bottom=False)  # umlaufende Teilungsnaht
b.finish(thickness=0)
