"""Eigenes Modell SKU 024: Polyester-Socke mit Rippbündchen, Ferse und Fuß
Referenz: public/products/024/front.jpg (Rohling offen)
Maße: Schätzwerte Gr. 39–42 (Schaft 18 cm, Fuß 24 cm).

blender -b -t 1 --python blender/024/build_024.py -- public/models/sku/024-v1.glb [quelle.blend] [render-prefix]
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from soft import Builder, lerp, smoothstep  # noqa: E402,F401

WHITE = ("Polyester weiß", (0.93, 0.93, 0.93), 0.85)
RIB = ("Rippbündchen", (0.90, 0.90, 0.90), 0.92)
b = Builder("Sock024", [WHITE, RIB])
b.sock(leg_len=0.17, foot_len=0.17, r_leg=0.042, r_ankle=0.038, r_foot=0.040, cuff=0.045)
b.finish(thickness=0.0018)
