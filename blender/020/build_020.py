"""Eigenes Modell SKU 020: Trainingsjacke: Reißverschluss, Stehkragen, Raglan, Bündchen und Bund
Referenz: public/products/020/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 56 cm halb, Länge 70 cm, Ärmel 62 cm).

blender -b -t 1 --python blender/020/build_020.py -- public/models/sku/020-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Jacket020", zip=True, raglan=True, underband=0.05,
    length=0.70, half_w=0.280, waist_w=0.272, hem_w=0.268, shoulder_x=0.235, armpit_h=0.48,
    neck_w=0.082, front_drop=0.040, back_drop=0.018, neck_d_front=0.070, neck_d_back=0.062,
    body_d=0.160, fabric=0.0030, folds=1.0,
    sleeve_len=0.600, sleeve_angle=64, sleeve_root=(0.100, 0.092), sleeve_cuff=(0.046, 0.040), cuff_rib=0.07,
    collar=dict(stand=0.060, fall=0.0, front_gap=0.004), seg_l=22, nu=36, nv=50, seg_a=28,  # Budget < 300 KiB
))
