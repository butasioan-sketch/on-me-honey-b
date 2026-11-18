"""Eigenes Modell SKU 121: Kindercap: kleinere Basecap
Referenz: public/products/121/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 52 cm, Schirm 6 cm.

blender -b -t 1 --python blender/121/build_121.py -- public/models/sku/121-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="Kids121", a=0.083, b=0.091, height=0.098, brim_len=0.062, brim_w=0.080, brim_curve=0.050,
))
