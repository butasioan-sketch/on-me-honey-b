"""Eigenes Modell SKU 015: Shorts James & Nicholson JN387: weit, knielang, Gummibund, Seitenpaspel
Referenz: public/product-refs/jn387-shorts-front-864x1200.png
Maße: Schätzwerte M (Bund 38 cm halb, Hüfte 54 cm halb, Seitenlänge 52 cm); JN387-Maße nachmessen.

blender -b --python blender/015/build_015.py -- public/models/sku/015-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Shorts015", piping=True,
    waist_w=0.200, hip_w=0.270, hip_d=0.140, rise=0.300, inseam=0.220,
    thigh_r=0.150, knee_r=0.145, hem_r=0.142, leg_sep=0.150, waistband=0.045, folds=0.3,
))
