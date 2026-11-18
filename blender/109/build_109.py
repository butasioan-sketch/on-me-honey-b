"""Eigenes Modell SKU 109: Metallbecher: konisch, Edelstahlrand
Referenz: public/products/109/front.jpg (Rohling offen)
Maße: Schätzwerte Ø oben 8,5 cm, unten 6,5 cm, Höhe 11 cm.

blender -b -t 1 --python blender/109/build_109.py -- public/models/sku/109-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Metal109", [WHT, STEEL])
prof = [(0.031, 0.0), (0.0325, 0.004)] + [(lerp(0.0325, 0.0425, t), 0.004 + 0.106 * t) for t in [k / 12 for k in range(1, 13)]]
lathe(b, prof, wall=0.0015, mat_in=1, mat_rim=1)
finish(b)
