"""Eigenes Modell SKU 062: Küchen-/Grillschürze mit Nackenband, Bindebändern und Tasche
Referenz: public/products/062/front.jpg (Rohling offen)
Maße: Schätzwerte 70 × 85 cm.

blender -b -t 1 --python blender/062/build_062.py -- public/models/sku/062-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
POCK = ("Tasche", (0.90, 0.90, 0.90), 0.85)
b = Builder("Apron062", [WHITE, POCK])
H = 0.85
def apron(p, u, v):
    hh = v * H
    if hh > 0.52:                       # Latz: schmal, oben abgerundete Armausschnitte
        t = (hh - 0.52) / (H - 0.52)
        w = lerp(0.70, 0.28, smoothstep(0, 0.45, t))
    else:
        w = 0.70
    return Vector((p.x * w / 0.70, p.y + 0.006 * math.sin(9 * u) * (1 - v), p.z))
b.sheet(0.70, H, nu=36, nv=44, drape=0.003, transform=apron, mat_fn=lambda i, j: 1 if 6 <= j <= 14 and 10 <= i <= 25 else 0)
path_tube(b, arc((-0.13, H, 0.0), (0.13, H, 0.0), 0.20, n=18), 0.008, seg=6, flat=0.25)
for s in (-1, 1):
    path_tube(b, [(s * 0.35, 0.52, 0.0), (s * 0.40, 0.50, -0.02), (s * 0.42, 0.40, -0.03), (s * 0.41, 0.25, -0.02)], 0.008, seg=6, flat=0.25)
b.finish(thickness=0.0018)
