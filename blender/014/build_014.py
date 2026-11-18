"""Eigenes Modell SKU 014: Sport-BH, kurz, breites Unterbrustband
Referenz: public/products/014/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Unterbrust 36 cm halb, Länge 30 cm).

blender -b -t 1 --python blender/014/build_014.py -- public/models/sku/014-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Bra014", sleeveless=True, underband=0.045, hem_stitch=False,
    length=0.30, half_w=0.190, waist_w=0.180, waist_h=0.05, hem_w=0.180, armpit_h=0.19, armhole_h=0.14,
    shoulder_x=0.120, shoulder_drop=0.012,
    neck_w=0.090, front_drop=0.090, back_drop=0.120, neck_d_front=0.060, neck_d_back=0.055,
    body_d=0.110, armhole_open=0.55, fabric=0.0024, folds=0.3,
))
