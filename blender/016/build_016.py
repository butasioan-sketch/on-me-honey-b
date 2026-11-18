"""Eigenes Modell SKU 016: Sporthose: schmal zulaufender Jogger, Kordel, Taschen, Beinbündchen
Referenz: public/products/016/front.jpg (Rohling offen)
Maße: Schätzwerte M (Hüfte 52 cm halb, Seitenlänge 100 cm).

blender -b --python blender/016/build_016.py -- public/models/sku/016-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Track016", drawcord=True, pockets=True, cuff=0.07,
    waist_w=0.185, hip_w=0.255, hip_d=0.135, rise=0.290, inseam=0.700,
    thigh_r=0.112, knee_r=0.080, hem_r=0.052, leg_sep=0.105, waistband=0.042,
))
