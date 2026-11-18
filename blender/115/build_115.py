"""Eigenes Modell SKU 115: Kinderbecher mit zwei Griffen und Trinktülle
Referenz: public/products/115/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 7,5 cm, Höhe 11 cm.

blender -b -t 1 --python blender/115/build_115.py -- public/models/sku/115-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, path_tube, arc, pouch, se_ring, _loft  # noqa: E402,F401
from vessel import finish, handle, lathe, solid, lerp, smoothstep  # noqa: E402,F401

CER = ("Keramik weiß glasiert", (0.95, 0.95, 0.95), 0.18)
STEEL = ("Edelstahl", (0.70, 0.71, 0.73), 0.25)
WHT = ("Kunststoff weiß", (0.94, 0.94, 0.94), 0.45)
BLK = ("Schwarz", (0.05, 0.05, 0.055), 0.5)

b = Builder("Kids115", [WHT])
prof = [(0.033, 0.0), (0.0365, 0.004)] + [(0.0365, 0.004 + 0.076 * t) for t in [k / 10 for k in range(1, 11)]]
lathe(b, prof, wall=0.0025)
solid(b, [(0.037, 0.078), (0.0385, 0.080), (0.0385, 0.088), (0.030, 0.094), (0.001, 0.094)], mat=0)   # Deckel
solid(b, [(0.012, 0.092), (0.010, 0.106), (0.006, 0.111), (0.001, 0.111)], seg=24, mat=0)            # Tülle
for s in (-1, 1):
    handle(b, 0.0365, 0.022, 0.066, reach=0.020, thick=(0.006, 0.004), mat=0, side=s)
finish(b)
