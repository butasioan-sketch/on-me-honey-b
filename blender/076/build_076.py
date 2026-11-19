"""Eigenes Modell SKU 076: Wimpel: Dreieck an einer Schnur
Referenz: public/products/076/front.jpg (Rohling offen)
Maße: Schätzwerte 20 × 30 cm.

blender -b -t 1 --python blender/076/build_076.py -- public/models/sku/076-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Pennant076", [WHITE])
b.sheet(0.20, 0.30, nu=24, nv=30, transform=lambda p, u, v: Vector((p.x * v, 0.01 * math.sin(3 * v + 2 * u), p.z)))
path_tube(b, [(-0.20, 0.31, 0.0), (0.0, 0.302, 0.0), (0.20, 0.31, 0.0)], 0.0015, seg=6)
b.finish(thickness=0.0008)
