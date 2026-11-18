"""Eigenes Modell SKU 055: Geschirrtuch (Waffelpiqué), gefaltet
Referenz: public/products/055/front.jpg (Rohling offen)
Maße: Schätzwerte 50 × 70 cm, gefaltet 25 × 17 cm.

blender -b -t 1 --python blender/055/build_055.py -- public/models/sku/055-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("TeaTowel055", [WHITE])
b.folded(0.17, 0.25, layers=4, layer_h=0.005, bulge=0.002)
b.finish(thickness=0.0015)
