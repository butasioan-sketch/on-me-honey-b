"""Eigenes Modell SKU 104: Keramiktasse 11 oz (Standard)
Referenz: public/products/104/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8,2 cm, Höhe 9,5 cm.

blender -b -t 1 --python blender/104/build_104.py -- public/models/sku/104-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Mug104", [CER])
R0, R1, H = 0.041, 0.041, 0.095
prof = [(R0 - 0.004, 0.0), (R0, 0.004)] + [(lerp(R0, R1, t), 0.004 + (H - 0.004) * t) for t in [k / 12 for k in range(1, 13)]]
lathe(b, prof, wall=0.0042)
handle(b, (lerp(R0, R1, 0.80), lerp(R0, R1, 0.22)), H * 0.22, H * 0.80, reach=0.0340, mat=0, shape="c")
finish(b)
