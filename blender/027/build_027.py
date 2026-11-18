"""Eigenes Modell SKU 027: Bandana: zum Dreieck gefaltetes Tuch, flach liegend mit Faltenwurf
Referenz: public/products/027/front.jpg (Rohling offen)
Maße: Schätzwerte 55 × 55 cm, gefaltet Dreieck.

blender -b -t 1 --python blender/027/build_027.py -- public/models/sku/027-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
b = Builder("Bandana027", [WHITE])
S = 0.39   # Kathete des gefalteten Dreiecks
def tri(p, u, v):
    # Quadrat -> Dreieck: obere Ecken zusammenziehen (u-Breite schrumpft mit v)
    return Vector((p.x * (1 - v), p.y, p.z))
from mathutils import Vector  # noqa: E402
b.sheet(S * 1.4, S * 0.7, nu=40, nv=24, drape=0.004, sag=0.003, transform=tri)
b.sheet(S * 1.4, S * 0.7, nu=40, nv=24, origin=(0, 0, -0.004), drape=0.003, transform=tri, seed=1.7)
b.finish(thickness=0.0012)
