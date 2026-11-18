"""Eigenes Modell SKU 056: Sporthandtuch Mikrofaser, gerollt
Referenz: public/products/056/front.jpg (Rohling offen)
Maße: Schätzwerte 30 cm breit, Rolle Ø 9 cm.

blender -b -t 1 --python blender/056/build_056.py -- public/models/sku/056-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from mathutils import Vector  # noqa: E402
from soft import Builder, arc, lerp, path_tube, pouch, se_ring, slab, smoothstep, _loft  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("SportTowel056", [WHITE])
rows = []
turns, n = 3.0, 90
for k in range(n + 1):
    t = k / n
    ang = 2 * math.pi * turns * t
    r = lerp(0.012, 0.045, t)
    rows.append((r * math.cos(ang), r * math.sin(ang)))
# letzte Lage läuft flach aus (Handtuchende)
tail = [(rows[-1][0] + 0.02 * k, rows[-1][1] - 0.001 * k) for k in range(1, 5)]
pts = rows + tail
grid = [[b.V(-0.15 + 0.30 * i / 20, 0.045 + h, d) for (d, h) in pts] for i in range(21)]
b.quad_grid(grid)
b.finish(thickness=0.003, rim_only=False)
