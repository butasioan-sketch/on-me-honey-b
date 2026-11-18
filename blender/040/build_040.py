"""Eigenes Modell SKU 040: Stiftemäppchen: flache, lange Reißverschlusstasche
Referenz: public/products/040/front.jpg (Rohling offen)
Maße: Schätzwerte 21 × 9 cm.

blender -b -t 1 --python blender/040/build_040.py -- public/models/sku/040-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIPW = ("Reißverschluss weiß", (0.86, 0.86, 0.87), 0.5)
b = Builder("PenPouch040", [WHITE, ZIPW])
pouch(b, 0.21, 0.09, 0.022, top_d=0.006, p=3.5, rows=12, zip_mat=1)
path_tube(b, [(0.098, 0.088, 0.004), (0.11, 0.075, 0.006), (0.112, 0.064, 0.006)], 0.002, seg=6, mat=1)  # Zipper-Anhänger
b.finish(thickness=0)
