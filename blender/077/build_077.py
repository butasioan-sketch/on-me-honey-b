"""Eigenes Modell SKU 077: Kleines Stoffbanner mit Ösen an einer Schnur
Referenz: public/products/077/front.jpg (Rohling offen)
Maße: Schätzwerte 30 × 40 cm.

blender -b -t 1 --python blender/077/build_077.py -- public/models/sku/077-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
MET = ("Öse", (0.75, 0.75, 0.77), 0.3)
b = Builder("Banner077", [WHITE, MET])
b.sheet(0.30, 0.40, nu=26, nv=32, drape=0.002)
for s in (-1, 1):
    rows = []
    for a in range(17):
        ang = 2 * math.pi * a / 16
        rows.append(Vector((s * 0.13 + 0.008 * math.cos(ang), 0.0, 0.38 + 0.008 * math.sin(ang))))
    ring_o = [b.bm.verts.new(p + Vector((0, -0.0015, 0))) for p in rows[:-1]]
    ring_i = [b.bm.verts.new(p * 1.0 + (Vector((s * 0.13, -0.0015, 0.38)) - p) * 0.45) for p in rows[:-1]]
    for a in range(16):
        f = b.bm.faces.new([ring_o[a], ring_o[(a + 1) % 16], ring_i[(a + 1) % 16], ring_i[a]])
        f.material_index = 1
path_tube(b, [(-0.30, 0.46, 0.0), (-0.13, 0.385, 0.0), (0.13, 0.385, 0.0), (0.30, 0.46, 0.0)], 0.0015, seg=6)
b.finish(thickness=0.0010)
