"""Eigenes Modell SKU 035: Sportbeutel (Rucksack) mit Kordeln zu den unteren Ecken
Referenz: public/products/035/front.jpg (Rohling offen)
Maße: Schätzwerte 34 × 44 cm.

blender -b -t 1 --python blender/035/build_035.py -- public/models/sku/035-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
BLACK = ("Gurtband schwarz", (0.05, 0.05, 0.06), 0.7)
b = Builder("Gymsack035", [WHITE, BLACK])
pouch(b, 0.34, 0.44, 0.07, top_d=0.012, p=5.0, rows=14, cap_top=True)
for side in (-1, 1):
    pts = [(side * 0.02, 0.44, -0.006), (side * 0.10, 0.46, -0.03), (side * 0.17, 0.40, -0.045), (side * 0.18, 0.20, -0.045), (side * 0.165, 0.02, -0.03)]
    path_tube(b, pts, 0.004, seg=8, mat=0)
    path_tube(b, [(side * 0.17, 0.0, -0.02), (side * 0.17, 0.035, -0.03)], 0.006, seg=6, mat=1, flat=0.4)  # Ecklasche
b.finish(thickness=0.0015)
