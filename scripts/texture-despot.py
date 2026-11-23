"""Dunkle Flecken (Generierungsfehler, Rest des Platzhalter-Logos) aus der Basistextur
eines weißen Artikels entfernen: Pixel deutlich unter dem Stoffton werden durch den
Stoffton ersetzt (Schattierung entsteht im Viewer aus Licht und Geometrie).
python3 scripts/texture-despot.py <textur.png> [schwelle=0.82]   (überschreibt die Datei)
Nur für weiße/helle Artikel verwenden; dunkle oder farbige Artikel nicht behandeln."""
import sys
import numpy as np
from PIL import Image, ImageFilter

p = sys.argv[1]
thr = float(sys.argv[2]) if len(sys.argv) > 2 else 0.82
a = np.array(Image.open(p).convert("RGB")).astype(np.float32)
lum = a.mean(-1)
bright = lum > np.percentile(lum, 60)
fabric = np.median(a[bright], axis=0)
mask = lum < fabric.mean() * thr
mask = np.array(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 127
a[mask] = fabric
# Übergänge weich: nur im Maskenrand leicht weichzeichnen
soft = np.array(Image.fromarray(a.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)
edge = np.array(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 127
a[edge] = soft[edge]
Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(p)
print("DESPOT", p, f"{mask.mean() * 100:.2f}% Pixel ersetzt, Stoffton {fabric.round()}")
