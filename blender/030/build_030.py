"""Eigenes Modell SKU 030: Schal: lang, mehrfach gefaltet gestapelt
Referenz: public/products/030/front.jpg (Rohling offen)
Maße: Schätzwerte 180 × 30 cm, gefaltet 30 × 22 cm.

blender -b -t 1 --python blender/030/build_030.py -- public/models/sku/030-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.88)
b = Builder("Scarf030", [WHITE])
b.folded(0.30, 0.22, layers=6, layer_h=0.007, bulge=0.004)
b.finish(thickness=0.0015)
