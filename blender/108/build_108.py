"""Eigenes Modell SKU 108: Emaillebecher: gesprenkelt weiß, schwarzer Rand, Drahtgriff
Referenz: public/products/108/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8,5 cm, Höhe 8 cm.

blender -b -t 1 --python blender/108/build_108.py -- public/models/sku/108-v1.glb [quelle.blend] [render-prefix]
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

EN = ("Emaille weiß", (0.95, 0.95, 0.95), 0.12)
b = Builder("Enamel108", [EN, BLK])
R, H = 0.0425, 0.080
prof = [(R - 0.006, 0.0), (R - 0.001, 0.003)] + [(R - 0.002 * (1 - t), 0.003 + (H - 0.003) * t) for t in [k / 10 for k in range(1, 11)]]
lathe(b, prof, wall=0.0012, mat_rim=1)
handle(b, R, H * 0.18, H * 0.86, reach=0.030, thick=(0.0025, 0.0025), mat=1, shape="d")
finish(b)
