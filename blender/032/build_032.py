"""Eigenes Modell SKU 032: Stofftragetasche: flach, kurze Henkel
Referenz: public/products/032/front.jpg (Rohling offen)
Maße: Schätzwerte 38 × 42 cm, Henkel 60 cm.

blender -b -t 1 --python blender/032/build_032.py -- public/models/sku/032-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Tote032", [WHITE])
pouch(b, 0.38, 0.42, 0.035, top_d=0.030, p=6.0, rows=14, cap_top=False, bulge=0.004)
for side in (-1, 1):
    path_tube(b, arc((-0.085, 0.41, side * 0.016), (0.085, 0.41, side * 0.016), 0.22, n=20), 0.012, seg=8, flat=0.25)
b.finish(thickness=0.0015)
