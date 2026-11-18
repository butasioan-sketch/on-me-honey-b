"""Eigenes Modell SKU 022: Sweatshirt: Rundhals mit Rippbündchen, Raglan, Bündchen und Bund
Referenz: public/products/022/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 57 cm halb, Länge 68 cm, Ärmel 62 cm).

blender -b -t 1 --python blender/022/build_022.py -- public/models/sku/022-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Sweat022", raglan=True, underband=0.06,
    length=0.68, half_w=0.285, waist_w=0.280, hem_w=0.268, shoulder_x=0.240, armpit_h=0.46,
    neck_w=0.086, front_drop=0.075, back_drop=0.022, body_d=0.165, fabric=0.0032,
    sleeve_len=0.600, sleeve_angle=64, sleeve_root=(0.104, 0.096), sleeve_cuff=(0.046, 0.040), cuff_rib=0.07, seg_l=22, nu=36, nv=50, seg_a=28,  # Budget < 300 KiB
))
