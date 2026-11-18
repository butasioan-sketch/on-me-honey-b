"""Eigenes Modell SKU 026: Schweißbänder (Paar): kurze Frotteeröhren
Referenz: public/products/026/front.jpg (Rohling offen)
Maße: Schätzwerte Ø 8 cm, Breite 8 cm.

blender -b -t 1 --python blender/026/build_026.py -- public/models/sku/026-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Frottee weiß", (0.93, 0.93, 0.93), 0.95)
b = Builder("Wristbands026", [WHITE])
for cx in (-0.055, 0.055):
    prof = [(t * 0.08, 0.040 + 0.002 * math.sin(math.pi * t), 0.040 + 0.002 * math.sin(math.pi * t)) for t in [k / 10 for k in range(11)]]
    b.tube(prof, seg=40, center=(cx, 0, 0), wobble=0.006)
b.finish(thickness=0.008, rim_only=False)
