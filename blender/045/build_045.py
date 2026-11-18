"""Eigenes Modell SKU 045: Dokumententasche: flach mit schwarzem Reißverschluss
Referenz: public/products/045/front.jpg (Rohling offen)
Maße: Schätzwerte 33 × 24 cm.

blender -b -t 1 --python blender/045/build_045.py -- public/models/sku/045-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Docs045", [WHITE, ZIP])
pouch(b, 0.33, 0.24, 0.012, top_d=0.004, p=6.0, rows=12, zip_mat=1)
b.finish(thickness=0)
