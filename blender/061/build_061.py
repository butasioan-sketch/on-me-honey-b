"""Eigenes Modell SKU 061: Kleine Tischdecke, gefaltet
Referenz: public/products/061/front.jpg (Rohling offen)
Maße: Schätzwerte 80 × 80 cm, gefaltet 27 × 27 cm.

blender -b -t 1 --python blender/061/build_061.py -- public/models/sku/061-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Tablecloth061", [WHITE])
b.folded(0.27, 0.27, layers=4, layer_h=0.005, bulge=0.003)
b.finish(thickness=0.0012)
