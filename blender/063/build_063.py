"""Eigenes Modell SKU 063: Topflappen, gesteppt mit Aufhängeschlaufe
Referenz: public/products/063/front.jpg (Rohling offen)
Maße: Schätzwerte 20 × 20 × 1,2 cm.

blender -b -t 1 --python blender/063/build_063.py -- public/models/sku/063-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Potholder063", [WHITE])
def quilt(p, u, v):
    q = 0.0035 * (abs(math.sin(math.pi * 6 * (u + v) / 2)) * abs(math.sin(math.pi * 6 * (u - v) / 2))) ** 0.3
    edge = smoothstep(0.0, 0.06, min(u, v, 1 - u, 1 - v))
    return Vector((p.x, (0.006 + q) * edge, p.z))
b.sheet(0.20, 0.20, nu=48, nv=48, transform=quilt)
def quilt_back(p, u, v):
    r = quilt(p, u, v)
    return Vector((r.x, -r.y, r.z))
b.sheet(0.20, 0.20, nu=48, nv=48, transform=quilt_back)
path_tube(b, arc((0.085, 0.198, 0.0), (0.10, 0.185, 0.0), 0.03, n=10), 0.004, seg=6, flat=0.35)
b.finish(thickness=0)
