"""Eigenes Modell SKU 111: Thermobecher mit Klappdeckel
Referenz: public/products/111/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8,8 cm, Höhe 15 cm.

blender -b -t 1 --python blender/111/build_111.py -- public/models/sku/111-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Thermo111", [WHT, BLK])
prof = [(0.036, 0.0), (0.038, 0.006)] + [(lerp(0.038, 0.044, t), 0.006 + 0.124 * t) for t in [k / 12 for k in range(1, 13)]]
lathe(b, prof, wall=0.003)
solid(b, [(0.044, 0.128), (0.046, 0.130), (0.046, 0.142), (0.040, 0.150), (0.001, 0.150)], mat=0)   # Deckel
solid(b, [(0.0045, 0.149), (0.0045, 0.153)], seg=12, mat=1)
path_tube(b, [(0.0, 0.151, 0.012), (0.0, 0.158, 0.028), (0.0, 0.156, 0.040)], 0.008, seg=8, mat=0, flat=0.35)   # Klappe offen
finish(b)
