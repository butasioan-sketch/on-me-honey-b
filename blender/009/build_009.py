"""Eigenes Modell SKU 009: Sporttrikot, V-Ausschnitt, Raglan-Ärmel
Referenz: public/products/009/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 54 cm halb, Länge 72 cm).

blender -b -t 1 --python blender/009/build_009.py -- public/models/sku/009-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Jersey009", neck_style="v",
    length=0.72, half_w=0.270, waist_w=0.262, shoulder_x=0.228, armpit_h=0.50,
    neck_w=0.080, front_drop=0.120, back_drop=0.020,
    body_d=0.148, fabric=0.0016, folds=0.8,
    sleeve_len=0.200, sleeve_angle=36, raglan=True,
))
