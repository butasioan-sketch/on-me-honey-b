"""Studio-Renderings (blender/lib/render_studio.py, 600x800 PNG) als Shop-Vorschaubilder
übernehmen: public/products/<sku>/glb.webp.
python3 scripts/studio-to-thumbs.py <studio_dir> <sku ...>"""
import os
import sys
from PIL import Image

src, skus = sys.argv[1], sys.argv[2:]
for s in skus:
    p = os.path.join(src, f"{s}.png")
    if not os.path.exists(p):
        print("FEHLT", s)
        continue
    im = Image.open(p).convert("RGB")
    if im.size != (600, 800):
        im = im.resize((600, 800), Image.LANCZOS)
    out = f"public/products/{s}/glb.webp"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "WEBP", quality=86, method=6)
    print("THUMB", s, os.path.getsize(out) // 1024, "KB")
