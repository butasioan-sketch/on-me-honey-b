"""Eigenes Modell SKU 054: Küchentuch, hängend an einer Aufhängeschlaufe
Referenz: public/products/054/front.jpg (Rohling offen)
Maße: Schätzwerte 40 × 60 cm.

blender -b -t 1 --python blender/054/build_054.py -- public/models/sku/054-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("KitchenTowel054", [WHITE])
b.sheet(0.40, 0.60, nu=30, nv=40, drape=0.006, fold_lines=((0.3, 0.004, 0.08, True), (0.72, -0.004, 0.07, True)))
path_tube(b, arc((-0.012, 0.598, 0.0), (0.012, 0.598, 0.0), 0.06, n=12), 0.004, seg=6, flat=0.3)
b.finish(thickness=0.0018)
