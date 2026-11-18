"""Eigenes Modell SKU 060: Stoffservietten, gefaltet gestapelt
Referenz: public/products/060/front.jpg (Rohling offen)
Maße: Schätzwerte 40 × 40 cm, gefaltet 20 × 20 cm.

blender -b -t 1 --python blender/060/build_060.py -- public/models/sku/060-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Napkin060", [WHITE])
b.folded(0.20, 0.20, layers=5, layer_h=0.005, bulge=0.002)
b.finish(thickness=0.0012)
