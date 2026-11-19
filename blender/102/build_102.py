"""Eigenes Modell SKU 102: Keramiktasse 6 oz, nach unten verjüngt
Referenz: public/products/102/front.jpg (Rohling offen)
Maße: Schätzwerte Ø oben 7,5 cm, Höhe 6,5 cm.

blender -b -t 1 --python blender/102/build_102.py -- public/models/sku/102-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Mug102", [CER])
# Referenz: bauchige Tulpenform, schmaler Fuß, Rand fast so weit wie der Bauch
R0, R1, H = 0.021, 0.037, 0.062


def r_at(t):
    return R0 + (R1 - R0) * math.sin(math.pi / 2 * t) ** 0.6


prof = [(R0 - 0.003, 0.0), (R0, 0.004)] + [(r_at(t), 0.004 + (H - 0.004) * t) for t in [k / 16 for k in range(1, 17)]]
lathe(b, prof, wall=0.0042)
handle(b, (r_at(0.80), r_at(0.25)), H * 0.25, H * 0.80, reach=0.0245, mat=0, shape="c")
finish(b)
