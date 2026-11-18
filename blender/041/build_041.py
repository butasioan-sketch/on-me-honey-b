"""Eigenes Modell SKU 041: Kleine Geldbörse: gefaltet mit Verschlusslasche
Referenz: public/products/041/front.jpg (Rohling offen)
Maße: Schätzwerte 11 × 9 × 2 cm.

blender -b -t 1 --python blender/041/build_041.py -- public/models/sku/041-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
EDGE = ("Kante", (0.86, 0.86, 0.86), 0.7)
b = Builder("Wallet041", [WHITE, EDGE])
slab(b, 0.11, 0.09, 0.018, r=0.008, mat=0, edge_mat=1)
slab(b, 0.022, 0.035, 0.003, r=0.006, mat=0, edge_mat=1, h0=0.028, d0=0.0105)   # Lasche vorne
b.bm.verts.ensure_lookup_table()
b.finish(thickness=0, smooth=False)
