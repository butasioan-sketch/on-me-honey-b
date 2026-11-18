"""Eigenes Modell SKU 048: Schlüsselband (Lanyard): aufgerolltes Satinband
Referenz: public/products/048/front.jpg (Rohling offen)
Maße: Schätzwerte Breite 2 cm, Rolle Ø 9 cm.

blender -b -t 1 --python blender/048/build_048.py -- public/models/sku/048-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Lanyard048", [WHITE])
pts = []
turns, r0, r1 = 3.2, 0.030, 0.045
n = 120
for k in range(n + 1):
    t = k / n
    ang = 2 * math.pi * turns * t
    r = lerp(r0, r1, t)
    pts.append((r * math.cos(ang), 0.01, r * math.sin(ang)))
# Band: senkrecht stehende Spirale, 2 cm hoch
rows = []
for (x, h, d) in pts:
    rows.append([b.V(x, 0.0, d), b.V(x, 0.02, d)])
b.quad_grid([[r[0] for r in rows], [r[1] for r in rows]])
b.finish(thickness=0.0008, rim_only=False)
