"""Eigenes Modell SKU 008: Langarmshirt, Rundhals, Bündchen
Referenz: public/products/008/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 52 cm halb, Länge 72 cm, Ärmel 62 cm).

blender -b --python blender/008/build_008.py -- public/models/sku/008-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Long008",
    length=0.72, half_w=0.260, waist_w=0.252, shoulder_x=0.222, armpit_h=0.50,
    body_d=0.145, folds=0.9,
    sleeve_len=0.600, sleeve_angle=72, sleeve_root=(0.092, 0.084), sleeve_cuff=(0.048, 0.042), cuff_rib=0.06,
    seg_l=30,
))
