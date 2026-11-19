"""Eigenes Modell SKU 029: Halstuch: Quadrat, zweimal gefaltet, liegend mit weichen Falten
Referenz: public/products/029/front.jpg (Rohling offen)
Maße: Schätzwerte 50 × 50 cm, gefaltet 25 × 25 cm.

blender -b -t 1 --python blender/029/build_029.py -- public/models/sku/029-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Scarf029", [WHITE])
b.folded(0.25, 0.25, layers=3, layer_h=0.004, bulge=0.003)
b.finish(thickness=0.0012)
