"""Eigenes Modell SKU 132: Schuhoberteil: flach liegender Zuschnitt mit Ösenreihen
Referenz: public/products/132/front.jpg (Rohling offen)
Maße: Schätzwerte 30 × 22 cm.

blender -b -t 1 --python blender/132/build_132.py -- public/models/sku/132-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Upper132", [CANVAS, HOLE])
def upper_shape(p, u, v):
    # flacher U-förmiger Zuschnitt: vorne rund (Vorderkappe), hinten zwei Flügel
    w = 0.22 * (0.55 + 0.45 * math.sin(math.pi * min(1.0, v * 1.15)) ** 0.5)
    return Vector((p.x * w / 0.22, 0.0015 * math.sin(7 * u + 5 * v), p.z))
b.sheet(0.22, 0.30, nu=28, nv=36, transform=upper_shape,
        mat_fn=lambda i, j: 0)
for k in range(6):   # Ösenreihen
    h = 0.06 + k * 0.022
    for s in (-1, 1):
        path_tube(b, [(s * 0.032, h, 0.0012), (s * 0.032, h + 0.0001, 0.0012)], 0.0035, seg=10, mat=1, flat=0.25)
b.finish(thickness=0.0018)
