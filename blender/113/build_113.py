"""Eigenes Modell SKU 113: Aluminium-Trinkflasche mit silberner Schraubkappe
Referenz: public/products/113/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 7 cm, Höhe 22 cm.

blender -b -t 1 --python blender/113/build_113.py -- public/models/sku/113-v1.glb [quelle.blend] [render-prefix]
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

ALU = ("Aluminium weiß", (0.92, 0.92, 0.93), 0.30)
b = Builder("Alu113", [ALU, STEEL])
prof = [(0.033, 0.0), (0.035, 0.004)] + [(0.035, 0.004 + 0.146 * t) for t in [k / 10 for k in range(1, 11)]]
prof += [(lerp(0.035, 0.013, smoothstep(0, 1, t)), 0.150 + 0.040 * t) for t in [k / 10 for k in range(1, 11)]]
solid(b, prof, mat=0)
solid(b, [(0.0145, 0.188), (0.0145, 0.212), (0.0125, 0.215), (0.001, 0.215)], mat=1)
finish(b)
