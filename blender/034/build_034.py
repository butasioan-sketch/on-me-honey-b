"""Eigenes Modell SKU 034: Turnbeutel mit Kordelzug, oben gerafft
Referenz: public/products/034/front.jpg (Rohling offen)
Maße: Schätzwerte 33 × 45 cm.

blender -b -t 1 --python blender/034/build_034.py -- public/models/sku/034-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Gym034", [WHITE])
rings = []
for j in range(17):
    t = j / 16
    w = 0.33 / 2 * (1 - 0.35 * smoothstep(0.82, 1.0, t))       # oben gerafft
    d = 0.06 * math.sin(math.pi * min(1, t * 1.1)) ** 0.6 + 0.004
    ring = se_ring(w, d, 3.5, 48, t * 0.45)
    if t > 0.85:  # Raffung: Wellen
        ring = [(x, h, dd * (1 + 0.25 * math.sin(14 * math.atan2(dd, x)))) for (x, h, dd) in ring]
    rings.append(ring)
_loft(b, rings, cap_bottom=True)
path_tube(b, [(0.0, 0.45, 0.0), (0.03, 0.47, 0.01), (0.05, 0.46, 0.02), (0.07, 0.40, 0.03), (0.09, 0.30, 0.03)], 0.004, seg=8)
path_tube(b, [(0.0, 0.45, 0.0), (-0.03, 0.47, 0.01), (-0.05, 0.46, 0.02), (-0.07, 0.40, 0.03), (-0.09, 0.30, 0.03)], 0.004, seg=8)
b.finish(thickness=0.0015)
