"""Eigenes Modell SKU 057: Gästehandtücher, gefaltet gestapelt
Referenz: public/products/057/front.jpg (Rohling offen)
Maße: Schätzwerte 30 × 50 cm, gefaltet 25 × 15 cm.

blender -b -t 1 --python blender/057/build_057.py -- public/models/sku/057-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("GuestTowel057", [WHITE])
b.folded(0.25, 0.15, layers=6, layer_h=0.007, bulge=0.003)
b.finish(thickness=0.0018)
