"""Eigenes Modell SKU 003: Herren-T-Shirt, gerader Schnitt
Referenz: public/products/003/front.jpg (Rohling offen)
Maße: Schätzwerte Herren L (Brust 56 cm halb, Länge 75 cm), Rohling offen.

blender -b -t 1 --python blender/003/build_003.py -- public/models/sku/003-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee003",
    length=0.75, half_w=0.280, waist_w=0.276, waist_h=0.25, hem_w=0.280,
    shoulder_x=0.240, shoulder_drop=0.048, armpit_h=0.52,
    neck_w=0.088, front_drop=0.080, back_drop=0.022, neck_d_front=0.072, neck_d_back=0.062,
    body_d=0.158,
    sleeve_len=0.215, sleeve_angle=36, sleeve_root=(0.104, 0.094), sleeve_cuff=(0.082, 0.070),
))
