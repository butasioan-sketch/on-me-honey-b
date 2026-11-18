"""A4-Testvorlage für den physischen Testdruck (Sublimation, Epson SC-F100).

2480 × 3508 px = 210 × 297 mm bei 300 dpi. Enthält:
- Maßskala an allen vier Rändern (1-mm-Striche, 5 mm mittel, 10 mm lang + Zahl)
- Randmotiv: farbiges Band 10 mm innen umlaufend, Rahmenlinie bei 5 mm
- Mittelkreuz, Eckwinkel, Beschriftung mit SKU und Sollmaßen
Prüfung nach dem Pressen: Skala mit Lineal vergleichen, Lage des Bandes zur
Kissenkante und zur Reißverschlussseite (0,5 cm frei laut BRILDOR) dokumentieren.

python3 scripts/make-print-test-a4.py 051 docs/print-tests/051-a4-randmotiv.png
Hinweis: Transferdruck gespiegelt (BRILDOR); diese Datei ist ungespiegelt.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

DPI = 300
W, H = 2480, 3508
MM = DPI / 25.4

sku = sys.argv[1] if len(sys.argv) > 1 else "051"
out = sys.argv[2] if len(sys.argv) > 2 else f"{sku}-a4-randmotiv.png"

img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)
    big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 70)
except OSError:
    font = big = ImageFont.load_default()

def px(mm):
    return round(mm * MM)

# Randmotiv: 10-mm-Band in Markenfarbe, Rahmenlinie bei 5 mm
band = (212, 175, 55)
for i in range(px(10)):
    d.rectangle([i, i, W - 1 - i, H - 1 - i], outline=band)
d.rectangle([px(5), px(5), W - 1 - px(5), H - 1 - px(5)], outline="black", width=3)

# Maßskala an allen Rändern (innerhalb des Bandes ab 10 mm)
for mm in range(0, 211):
    x = px(mm)
    L = px(6) if mm % 10 == 0 else (px(4) if mm % 5 == 0 else px(2.5))
    for y0, sgn in ((px(10), 1), (H - 1 - px(10), -1)):
        d.line([x, y0, x, y0 + sgn * L], fill="black", width=3 if mm % 10 == 0 else 2)
    if mm % 10 == 0 and 0 < mm < 210:
        d.text((x - 18, px(17)), str(mm), fill="black", font=font)
for mm in range(0, 298):
    y = px(mm)
    L = px(6) if mm % 10 == 0 else (px(4) if mm % 5 == 0 else px(2.5))
    for x0, sgn in ((px(10), 1), (W - 1 - px(10), -1)):
        d.line([x0, y, x0 + sgn * L, y], fill="black", width=3 if mm % 10 == 0 else 2)
    if mm % 10 == 0 and 30 <= mm < 290:
        d.text((px(18), y - 18), str(mm), fill="black", font=font)

# Mittelkreuz + Kreis 50 mm
cx, cy = W // 2, H // 2
d.line([cx - px(20), cy, cx + px(20), cy], fill="black", width=3)
d.line([cx, cy - px(20), cx, cy + px(20)], fill="black", width=3)
d.ellipse([cx - px(25), cy - px(25), cx + px(25), cy + px(25)], outline="black", width=3)

# Beschriftung
lines = [f"ON ME HONEY B · SKU {sku} · Testdruck", "A4 210 × 297 mm · 300 dpi",
         "Band 10 mm · Linie 5 mm · Kreis Ø 50 mm", "Transfer gespiegelt drucken · 180 °C / 60 s (BRILDOR)"]
d.text((cx - px(70), cy + px(40)), lines[0], fill="black", font=big)
for k, t in enumerate(lines[1:]):
    d.text((cx - px(70), cy + px(60) + k * 55), t, fill="black", font=font)

img.save(out, dpi=(DPI, DPI), optimize=True)
print(out, img.size)
