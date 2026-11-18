"""Eigenes Modell SKU 046: Reisepasshülle mit umlaufendem Reißverschluss
Referenz: public/products/046/front.jpg (Rohling offen)
Maße: Schätzwerte 14 × 10 × 1,8 cm.

blender -b -t 1 --python blender/046/build_046.py -- public/models/sku/046-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIPW = ("Reißverschluss weiß", (0.86, 0.86, 0.87), 0.5)
b = Builder("Passport046", [WHITE, ZIPW])
slab(b, 0.10, 0.14, 0.018, r=0.012, mat=0, edge_mat=1)
b.finish(thickness=0, smooth=False)
