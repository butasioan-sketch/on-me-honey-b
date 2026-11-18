"""Eigenes Modell SKU 021: Hoodie: aufgestellte Kapuze, Kängurutasche, Kapuzenkordeln, Bündchen und Bund
Referenz: public/products/021/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 58 cm halb, Länge 70 cm, Ärmel 62 cm).

blender -b -t 1 --python blender/021/build_021.py -- public/models/sku/021-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Hoodie021", underband=0.06,
    length=0.70, half_w=0.290, waist_w=0.285, hem_w=0.272, shoulder_x=0.245, armpit_h=0.47,
    neck_w=0.090, front_drop=0.060, back_drop=0.020, neck_d_front=0.072, neck_d_back=0.064,
    body_d=0.170, fabric=0.0035, folds=1.0,
    sleeve_len=0.590, sleeve_angle=64, sleeve_root=(0.108, 0.098), sleeve_cuff=(0.048, 0.042), cuff_rib=0.07,
    hood=dict(w=0.125, h=0.330, d=0.250), hood_cords=True,
    kangaroo=dict(w_top=0.300, w_bottom=0.360, h0=0.075, h1=0.270), seg_l=30,
))
