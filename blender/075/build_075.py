"""Eigenes Modell SKU 075: Kleine Dekofahne am Holzstab, wehend
Referenz: public/products/075/front.jpg (Rohling offen)
Maße: Schätzwerte Fahne 30 × 20 cm, Stab 45 cm.

blender -b -t 1 --python blender/075/build_075.py -- public/models/sku/075-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
WOOD = ("Holz", (0.62, 0.47, 0.30), 0.7)
b = Builder("Flag075", [WHITE, WOOD])
b.sheet(0.30, 0.20, nu=32, nv=20, origin=(0.15, 0.25, 0.0), transform=lambda p, u, v: Vector((p.x, 0.025 * math.sin(math.pi * 2.2 * u) * u, p.z - 0.03 * u * u)))
b.tube([(0.0, 0.004, 0.004), (0.45, 0.004, 0.004)], seg=10, center=(0.0, 0.0, 0.0), mat_fn=lambda i, j: 1)
b.finish(thickness=0.0008)
