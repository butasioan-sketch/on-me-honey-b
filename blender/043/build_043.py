"""Eigenes Modell SKU 043: Laptop-Hülle: gepolsterte Reißverschlusshülle mit Zipper
Referenz: public/products/043/front.jpg (Rohling offen)
Maße: Schätzwerte 36 × 26 × 2,5 cm (13–14 Zoll).

blender -b -t 1 --python blender/043/build_043.py -- public/models/sku/043-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, path_tube, arc, pouch, se_ring, _loft  # noqa: E402,F401
from vessel import finish, handle, lathe, solid, lerp, smoothstep  # noqa: E402,F401

CER = ("Keramik weiß glasiert", (0.95, 0.95, 0.95), 0.18)
STEEL = ("Edelstahl", (0.70, 0.71, 0.73), 0.25)
WHT = ("Kunststoff weiß", (0.94, 0.94, 0.94), 0.45)
BLK = ("Schwarz", (0.05, 0.05, 0.055), 0.5)

ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Laptop043", [WHT, ZIP])
rings = [se_ring(0.18 - 0.001 * abs(2 * t - 1), 0.012 * math.sin(math.pi * min(1, 0.12 + 0.88 * t)) + 0.005, 6.0, 64, t * 0.26) for t in [k / 16 for k in range(17)]]
_loft(b, rings, mat_fn=lambda i, j: 1 if j >= 15 else 0, cap_bottom=True, cap_top=True, cap_mat=1)
path_tube(b, [(0.165, 0.262, 0.004), (0.180, 0.250, 0.006), (0.182, 0.238, 0.006)], 0.003, seg=6, mat=1)
finish(b)
