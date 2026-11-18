"""Eigenes Modell SKU 058: Tischset, flach liegend
Referenz: public/products/058/front.jpg (Rohling offen)
Maße: Schätzwerte 45 × 32 cm.

blender -b -t 1 --python blender/058/build_058.py -- public/models/sku/058-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Placemat058", [WHITE])
def lie(p, u, v):
    return Vector((p.x, p.z - 0.16, p.y * 0.3 + 0.0))
b.sheet(0.45, 0.32, nu=30, nv=22, drape=0.0015, transform=lambda p, u, v: Vector((p.x, p.z, p.y)))
b.finish(thickness=0.0015)
