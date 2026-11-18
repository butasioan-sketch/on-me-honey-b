"""Eigenes Modell SKU 050: Kartenetui: flache Hülle mit Einschub
Referenz: public/products/050/front.jpg (Rohling offen)
Maße: Schätzwerte 10,5 × 7 × 0,6 cm.

blender -b -t 1 --python blender/050/build_050.py -- public/models/sku/050-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
EDGE = ("Kante", (0.86, 0.86, 0.86), 0.7)
b = Builder("Cards050", [WHITE, EDGE])
slab(b, 0.105, 0.070, 0.006, r=0.006, mat=0, edge_mat=1)
slab(b, 0.090, 0.004, 0.0015, r=0.0015, mat=1, h0=0.055, d0=0.0035)   # Einschubkante
b.finish(thickness=0, smooth=False)
