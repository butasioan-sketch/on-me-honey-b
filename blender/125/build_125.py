"""Eigenes Modell SKU 125: Großer Dekorationsteller mit breiter Fahne
Referenz: public/products/125/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 27 cm.

blender -b -t 1 --python blender/125/build_125.py -- public/models/sku/125-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402,F401
from soft import Builder, path_tube, slab  # noqa: E402,F401
from vessel import finish, plate_loop, revolve_loop  # noqa: E402,F401
import shoe  # noqa: E402,F401

CER = ("Porzellan weiß glasiert", (0.96, 0.96, 0.96), 0.15)
CANVAS = ("Canvas weiß", (0.93, 0.93, 0.93), 0.85)
RUBBER = ("Gummisohle weiß", (0.95, 0.95, 0.95), 0.6)
GORE = ("Gummizug", (0.86, 0.86, 0.87), 0.9)
LIN = ("Futter", (0.90, 0.90, 0.90), 0.9)
HOLE = ("Öse/Loch", (0.25, 0.25, 0.27), 0.5)

b = Builder("Plate125", [CER])
revolve_loop(b, plate_loop(0.135, 0.085, 0.010, 0.012), mat=0, seg=96)
finish(b)
