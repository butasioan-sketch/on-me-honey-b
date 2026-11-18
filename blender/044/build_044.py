"""Eigenes Modell SKU 044: Tablet-Hülle: gepolsterte Reißverschlusshülle
Referenz: public/products/044/front.jpg (Rohling offen)
Maße: Schätzwerte 27 × 20 × 2 cm.

blender -b -t 1 --python blender/044/build_044.py -- public/models/sku/044-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIPW = ("Reißverschluss weiß", (0.86, 0.86, 0.87), 0.5)
b = Builder("Tablet044", [WHITE, ZIPW])
rings = [se_ring(0.135 - 0.001 * abs(2 * t - 1), 0.010 * math.sin(math.pi * min(1, 0.15 + 0.85 * t)) + 0.004, 6.0, 56, t * 0.20) for t in [k / 14 for k in range(15)]]
_loft(b, rings, mat_fn=lambda i, j: 1 if j >= 13 else 0, cap_bottom=True, cap_top=True, cap_mat=1)
b.finish(thickness=0)
