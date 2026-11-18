"""Eigenes Modell SKU 028: Schlauchtuch: Röhre aus dünnem Stoff, leicht gestaucht
Referenz: public/products/028/front.jpg (Rohling offen)
Maße: Schätzwerte Länge 25 cm, Umfang 50 cm.

blender -b -t 1 --python blender/028/build_028.py -- public/models/sku/028-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Tube028", [WHITE])
prof = []
for k in range(31):
    t = k / 30
    r = 0.080 + 0.0012 * math.sin(5 * math.pi * t)  # leichte Querwellen
    prof.append((t * 0.25, r, r * 0.97))
b.tube(prof, seg=48, wobble=0.006)
b.finish(thickness=0.0012)
