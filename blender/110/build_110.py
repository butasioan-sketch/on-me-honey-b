"""Eigenes Modell SKU 110: Edelstahl-Trinkbecher mit Deckel und Metallband
Referenz: public/products/110/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8,5 cm, Höhe 17 cm.

blender -b -t 1 --python blender/110/build_110.py -- public/models/sku/110-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Tumbler110", [WHT, STEEL])
prof = [(0.033, 0.0), (0.034, 0.004)] + [(lerp(0.034, 0.042, t), 0.004 + 0.146 * t) for t in [k / 14 for k in range(1, 15)]]
lathe(b, prof, wall=0.002, mat_in=1, mat_rim=1)
solid(b, [(0.0435, 0.140), (0.0435, 0.152), (0.0425, 0.156)], mat=1)                 # Metallband
solid(b, [(0.0425, 0.150), (0.044, 0.152), (0.044, 0.163), (0.040, 0.170), (0.030, 0.172), (0.001, 0.172)], mat=0)  # Deckel
finish(b)
