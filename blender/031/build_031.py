"""Eigenes Modell SKU 031: Stoff-Aufnäher (Patch) mit Steppkante
Referenz: public/products/031/front.jpg (Rohling offen)
Maße: Schätzwerte 10 × 7 cm, 2 mm.

blender -b -t 1 --python blender/031/build_031.py -- public/models/sku/031-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
EDGE = ("Merrow-Kante", (0.88, 0.88, 0.88), 0.95)
b = Builder("Patch031", [WHITE, EDGE])
slab(b, 0.10, 0.07, 0.002, r=0.006, mat=0, edge_mat=1)
# umlaufende Steppkante als leicht erhabene Wulst
path = [(x, h, 0.0012) for (x, h) in [(-0.046, 0.004), (0.046, 0.004), (0.046, 0.066), (-0.046, 0.066), (-0.046, 0.004)]]
pts = []
for (a, c) in zip(path, path[1:]):
    for k in range(10):
        t = k / 10
        pts.append((lerp(a[0], c[0], t), lerp(a[1], c[1], t), 0.0012))
pts.append(path[-1])
path_tube(b, pts, 0.0012, seg=6, mat=1, flat=0.6)
b.finish(thickness=0, smooth=False)
