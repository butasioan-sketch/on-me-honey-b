"""Eigenes Modell SKU 038: Kulturbeutel: Box mit Griff und Reißverschluss
Referenz: public/products/038/front.jpg (Rohling offen)
Maße: Schätzwerte 24 × 18 × 9 cm.

blender -b -t 1 --python blender/038/build_038.py -- public/models/sku/038-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Toiletry038", [WHITE, ZIP])
rings = [se_ring(0.12, 0.045 + 0.003 * math.sin(math.pi * t), 5.0, 48, t * 0.18) for t in [k / 14 for k in range(15)]]
_loft(b, rings, mat_fn=lambda i, j: 1 if j == 12 else 0, cap_bottom=True, cap_top=True, cap_mat=0)
path_tube(b, arc((-0.05, 0.181, 0.0), (0.05, 0.181, 0.0), 0.035, n=14), 0.007, seg=8, mat=0, flat=0.35)
b.finish(thickness=0)
