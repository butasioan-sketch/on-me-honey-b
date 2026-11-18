"""Eigenes Modell SKU 001: Unisex-T-Shirt, James & Nicholson JN827 white/carbon
Referenz: public/product-refs/jn827-tee-1024x1536.png
Maße: Schätzwerte Größe M (B&C-Tabelle: 53 cm halbe Brust, 72 cm Länge), am JN827 nachmessen.

blender -b --python blender/001/build_001.py -- public/models/sku/001-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee001",
    carbon=True,   # Schulterstreifen + Seiteneinsätze laut Referenz
))
