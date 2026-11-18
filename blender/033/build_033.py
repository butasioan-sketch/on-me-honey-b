"""Eigenes Modell SKU 033: Shopper: hoch, lange Henkel, Seitenfalte
Referenz: public/products/033/front.jpg (Rohling offen)
Maße: Schätzwerte 38 × 42 × 12 cm, Henkel 70 cm.

blender -b -t 1 --python blender/033/build_033.py -- public/models/sku/033-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Shopper033", [WHITE])
pouch(b, 0.38, 0.42, 0.12, top_d=0.10, p=7.0, rows=14, cap_top=False, w_top=0.39)
for side in (-1, 1):
    path_tube(b, arc((-0.075, 0.41, side * 0.05), (0.075, 0.41, side * 0.05), 0.30, n=22), 0.013, seg=8, flat=0.25)
b.finish(thickness=0.0015)
