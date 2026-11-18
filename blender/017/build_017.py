"""Eigenes Modell SKU 017: Jogginghose: weiterer Schnitt, Kordel, Taschen, Beinbündchen
Referenz: public/products/017/front.jpg (Rohling offen)
Maße: Schätzwerte M (Hüfte 55 cm halb, Seitenlänge 101 cm).

blender -b -t 1 --python blender/017/build_017.py -- public/models/sku/017-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Jogger017", drawcord=True, pockets=True, cuff=0.075,
    waist_w=0.195, hip_w=0.275, hip_d=0.145, rise=0.300, inseam=0.700,
    thigh_r=0.125, knee_r=0.100, hem_r=0.058, leg_sep=0.115, waistband=0.048, folds=1.2,
))
