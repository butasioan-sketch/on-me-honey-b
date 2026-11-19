"""Eigenes Modell SKU 025: Stirnband: breites, leicht gewölbtes Frotteeband
Referenz: public/products/025/front.jpg (Rohling offen)
Maße: Schätzwerte Umfang 52 cm, Breite 6 cm.

blender -b -t 1 --python blender/025/build_025.py -- public/models/sku/025-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Frottee weiß", (0.93, 0.93, 0.93), 0.95)
b = Builder("Headband025", [WHITE])
prof = []
for k in range(13):
    t = k / 12
    bulge = 0.004 * math.sin(math.pi * t)          # leicht gewölbt in der Mitte
    prof.append((t * 0.06, 0.088 + bulge, 0.075 + bulge))
b.tube(prof, seg=56, wobble=0.004)
b.finish(thickness=0.006, rim_only=False)
