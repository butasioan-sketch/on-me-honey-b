"""Eigenes Modell SKU 116: Stiftehalter in Becherform mit Stiften
Referenz: public/products/116/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8 cm, Höhe 10 cm.

blender -b -t 1 --python blender/116/build_116.py -- public/models/sku/116-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("PenCup116", [CER, WHT])
prof = [(0.036, 0.0), (0.039, 0.004)] + [(0.040, 0.004 + 0.096 * t) for t in [k / 10 for k in range(1, 11)]]
lathe(b, prof, wall=0.004)
for k, (ang, tilt, ln) in enumerate([(20, 0.18, 0.15), (95, -0.12, 0.14), (160, 0.10, 0.155), (230, -0.20, 0.145), (300, 0.15, 0.15), (0, 0.0, 0.16)]):
    a = math.radians(ang)
    x0, d0 = 0.018 * math.cos(a), 0.018 * math.sin(a)
    path_tube(b, [(x0, 0.006, d0), (x0 + tilt * ln * math.cos(a), 0.006 + ln, d0 + tilt * ln * math.sin(a))], 0.0045, seg=8, mat=1)
finish(b)
