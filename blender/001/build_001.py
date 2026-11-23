"""Eigenes Modell SKU 001: Unisex-T-Shirt, James & Nicholson JN827 white/carbon
Referenz: public/product-refs/jn827-tee-1024x1536.png
Maße Größe M laut Daiber-Datenblatt JN827 (daiber.de product-datasheet id 8168):
½ Brust = ½ Taille = ½ Saum 54 cm (gerader Schnitt), Länge ab Schulter 72 cm.

blender -b -t 1 --python blender/001/build_001.py -- public/models/sku/001-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee001",
    carbon=False,  # 21.11.: wie das Produktfoto rein weiß (vorher JN827-Carbon-Einsätze)
    # 54 cm flach gemessen; +1,7 % gleicht den Faltenwurf aus (gemessen 53,1 cm bei 0.270)
    half_w=0.2745, waist_w=0.2745, hem_w=0.2745, length=0.72,  # JN827 M
))
