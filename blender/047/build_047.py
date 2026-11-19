"""Eigenes Modell SKU 047: Kofferanhänger mit Sichtfenster und Riemen
Referenz: public/products/047/front.jpg (Rohling offen)
Maße: Schätzwerte 10 × 6,5 cm, Riemen 25 cm.

blender -b -t 1 --python blender/047/build_047.py -- public/models/sku/047-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
WIN = ("Sichtfenster", (0.80, 0.84, 0.88), 0.15)
BLACK = ("Schnalle schwarz", (0.05, 0.05, 0.06), 0.5)
b = Builder("Tag047", [WHITE, WIN, BLACK])
slab(b, 0.065, 0.10, 0.004, r=0.008, mat=0)
slab(b, 0.050, 0.055, 0.0008, r=0.004, mat=1, h0=0.012, d0=0.0025)   # Sichtfenster vorne unten (Referenz)
# Riemenschlaufe wie Referenz: ca. 2 cm breiter Gurt, Schlaufe gut 5 cm über dem Anhänger, schwarze Schnalle
path_tube(b, arc((0.0, 0.094, 0.004), (0.0, 0.094, -0.034), 0.040, n=24), 0.010, seg=8, mat=0, flat=0.22)
slab(b, 0.026, 0.011, 0.006, r=0.002, mat=2, h0=0.094 + 0.040 - 0.004, d0=-0.015)
b.finish(thickness=0, smooth=False)
