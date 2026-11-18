"""Eigenes Modell SKU 114: Campingbecher: flache, weite Schale mit Lasche
Referenz: public/products/114/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 11 cm, Höhe 6 cm.

blender -b -t 1 --python blender/114/build_114.py -- public/models/sku/114-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Camp114", [CER])
prof = [(0.038, 0.0), (0.041, 0.004)] + [(lerp(0.041, 0.055, t ** 0.7), 0.004 + 0.056 * t) for t in [k / 10 for k in range(1, 11)]]
lathe(b, prof, wall=0.0035)
path_tube(b, [(0.054, 0.052, 0.0), (0.072, 0.054, 0.0)], 0.008, seg=8, mat=0, flat=0.3)     # Grifflasche
finish(b)
