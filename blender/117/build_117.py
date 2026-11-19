"""Eigenes Modell SKU 117: Basecap: 6 Bahnen, Knopf, gebogener Schirm, Riemen mit Schnalle
Referenz: public/products/117/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 57 cm, Schirm 7,5 cm.

blender -b -t 1 --python blender/117/build_117.py -- public/models/sku/117-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="Basecap117",
))
