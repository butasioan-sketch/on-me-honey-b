"""Eigenes Modell SKU 112: Trinkflasche mit schwarzem Push-Pull-Verschluss
Referenz: public/products/112/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 7 cm, Höhe 23 cm.

blender -b -t 1 --python blender/112/build_112.py -- public/models/sku/112-v1.glb [quelle.blend] [render-prefix]
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

b = Builder("Bottle112", [WHT, BLK])
prof = [(0.031, 0.0), (0.035, 0.005)] + [(0.035, 0.005 + 0.165 * t) for t in [k / 10 for k in range(1, 11)]]
prof += [(lerp(0.035, 0.016, smoothstep(0, 1, t)), 0.170 + 0.025 * t) for t in [k / 8 for k in range(1, 9)]]
solid(b, prof, mat=0)
solid(b, [(0.017, 0.193), (0.018, 0.195), (0.018, 0.210), (0.012, 0.214), (0.009, 0.214)], mat=1)    # Kappe
solid(b, [(0.0075, 0.213), (0.0075, 0.228), (0.005, 0.230)], seg=20, mat=1)                           # Ventil
finish(b)
