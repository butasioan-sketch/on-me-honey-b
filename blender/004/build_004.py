"""Eigenes Modell SKU 004: Kinder-T-Shirt, kastig
Referenz: public/products/004/front.jpg (Rohling offen)
Maße: Schätzwerte Kinder 122/128 (Brust 34 cm halb, Länge 46 cm), Rohling offen.

blender -b -t 1 --python blender/004/build_004.py -- public/models/sku/004-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee004",
    length=0.46, half_w=0.170, waist_w=0.170, waist_h=0.16, hem_w=0.172,
    shoulder_x=0.150, shoulder_drop=0.030, armpit_h=0.30,
    neck_w=0.062, front_drop=0.055, back_drop=0.016, neck_d_front=0.050, neck_d_back=0.042,
    body_d=0.098, fabric=0.0018,
    sleeve_len=0.115, sleeve_angle=34, sleeve_root=(0.068, 0.060), sleeve_cuff=(0.056, 0.046),
    folds=0.7,
))
