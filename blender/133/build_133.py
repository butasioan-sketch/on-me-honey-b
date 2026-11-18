"""Eigenes Modell SKU 133: Schuhzunge mit Stichlöchern und Gummiband
Referenz: public/products/133/front.jpg (Rohling offen)
Maße: Schätzwerte 9 × 17 cm.

blender -b -t 1 --python blender/133/build_133.py -- public/models/sku/133-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402,F401
from soft import Builder, path_tube, slab  # noqa: E402,F401
from vessel import finish, plate_loop, revolve_loop  # noqa: E402,F401
import shoe  # noqa: E402,F401

CER = ("Porzellan weiß glasiert", (0.96, 0.96, 0.96), 0.15)
CANVAS = ("Canvas weiß", (0.93, 0.93, 0.93), 0.85)
RUBBER = ("Gummisohle weiß", (0.95, 0.95, 0.95), 0.6)
GORE = ("Gummizug", (0.86, 0.86, 0.87), 0.9)
LIN = ("Futter", (0.90, 0.90, 0.90), 0.9)
HOLE = ("Öse/Loch", (0.25, 0.25, 0.27), 0.5)

b = Builder("Tongue133", [CANVAS, HOLE, GORE])
slab(b, 0.090, 0.170, 0.004, r=0.030, mat=0, edge_mat=0)
slab(b, 0.084, 0.018, 0.0045, r=0.004, mat=2, h0=0.0)        # Gummiband unten
for k in range(9):
    h = 0.03 + k * 0.016
    for s in (-1, 1):
        path_tube(b, [(s * 0.037, h, 0.0022), (s * 0.037, h + 0.0001, 0.0022)], 0.0012, seg=8, mat=1, flat=0.3)
b.finish(thickness=0, smooth=False)
