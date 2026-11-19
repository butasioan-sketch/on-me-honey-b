"""Eigenes Modell SKU 059: Tischläufer, gefaltet liegend mit Fall
Referenz: public/products/059/front.jpg (Rohling offen)
Maße: Schätzwerte 40 × 150 cm.

blender -b -t 1 --python blender/059/build_059.py -- public/models/sku/059-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Runner059", [WHITE])
b.folded(0.40, 0.18, layers=3, layer_h=0.004, bulge=0.002)
# ausgerollter Teil liegt flach auf dem Tisch und läuft unter dem gefalteten Stapel nach vorne aus
b.sheet(0.40, 0.50, nu=26, nv=30, drape=0.0012, transform=lambda p, u, v: Vector((p.x, p.z - 0.09, -0.0015 + p.y * 0.4)))
b.finish(thickness=0.0012)
