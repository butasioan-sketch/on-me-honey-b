"""Eigenes Modell SKU 037: Kosmetiktasche: trapezförmig mit Reißverschluss
Referenz: public/products/037/front.jpg (Rohling offen)
Maße: Schätzwerte 24 × 15 × 8 cm.

blender -b -t 1 --python blender/037/build_037.py -- public/models/sku/037-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
ZIP = ("Reißverschluss", (0.08, 0.08, 0.09), 0.5)
b = Builder("Cosmetic037", [WHITE, ZIP])
pouch(b, 0.21, 0.15, 0.08, top_d=0.012, p=3.2, rows=14, zip_mat=1, w_top=0.25)
b.finish(thickness=0)
