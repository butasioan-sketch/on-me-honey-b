"""Erzeugt kachelbare Material-Texturen (256 px) für die SKU-GLBs.

python3 blender/lib/make_textures.py <out_dir>
Normalmaps im glTF-Format (OpenGL, +Y), Farbtexturen sRGB. Alles prozedural und
nahtlos kachelbar (nur ganzzahlige Frequenzen), damit keine Kanten im Viewer entstehen.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

N = 256
rng = np.random.default_rng(21112026)
y, x = np.mgrid[0:N, 0:N] / N  # 0..1, kachelbar


def tile_noise(octaves=4, base=4, seed=0):
    """Kachelbares Rauschen als Summe zufälliger ganzzahliger Sinuswellen."""
    r = np.random.default_rng(seed)
    out = np.zeros((N, N))
    for o in range(octaves):
        f = base * 2 ** o
        for _ in range(6):
            kx, ky = r.integers(-f, f + 1, 2)
            ph = r.random() * 2 * np.pi
            out += np.cos(2 * np.pi * (kx * x + ky * y) + ph) / (2 ** o)
    out -= out.min()
    return out / max(out.max(), 1e-9)


def normal_from_height(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * N
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * N
    nx, ny, nz = -dx * strength, dy * strength, np.ones_like(h)
    ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    rgb = np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5
    return Image.fromarray((rgb * 255).round().astype(np.uint8), "RGB")


def jersey():
    # Rechts-Maschen: senkrechte Maschenstäbchen aus V-förmigen Schlingen
    cols, rows = 16, 22
    u = (x * cols) % 1.0
    v = (y * rows) % 1.0
    loop = np.abs(u - 0.5) * 2  # 0 Mitte, 1 Rand
    v_shape = np.clip(1 - np.abs(loop - (0.35 + 0.45 * v)) * 3.2, 0, 1)
    h = v_shape * (0.6 + 0.4 * np.sin(np.pi * v)) + 0.08 * tile_noise(3, 8, 1)
    return normal_from_height(h, 0.010)


def rib():
    # 1x1 Rippe: kräftige senkrechte Rippen + feine Maschen
    h = np.cos(np.pi * (x * 18)) ** 2 + 0.15 * np.sin(2 * np.pi * y * 40) ** 2 + 0.05 * tile_noise(3, 8, 2)
    return normal_from_height(h, 0.020)


def canvas():
    # Leinwandbindung: Kette/Schuss abwechselnd oben
    n = 24
    wx = np.sin(np.pi * ((x * n) % 1.0))
    wy = np.sin(np.pi * ((y * n) % 1.0))
    over = ((np.floor(x * n) + np.floor(y * n)) % 2)
    h = np.where(over > 0, wx * 0.7 + wy * 0.3, wy * 0.7 + wx * 0.3) + 0.06 * tile_noise(3, 8, 3)
    return normal_from_height(h, 0.012)


def terry():
    h = tile_noise(4, 16, 4) ** 1.5
    return normal_from_height(h, 0.030)


def microfiber():
    h = tile_noise(4, 24, 5)
    return normal_from_height(h, 0.004)


def brushed():
    # Gebürstetes Metall: feine Riefen in x-Richtung
    r = np.random.default_rng(6)
    h = np.zeros((N, N))
    for _ in range(60):
        ky = int(r.integers(20, 120))
        h += np.cos(2 * np.pi * ky * y + r.random() * 6.28) * (r.random() * 0.5 + 0.5)
    h = (h - h.min()) / np.ptp(h)
    return normal_from_height(h, 0.003)


def cork():
    gran = tile_noise(4, 20, 7)
    spots = (tile_noise(3, 32, 8) > 0.72).astype(float)
    base = np.array([0.72, 0.55, 0.36])
    dark = np.array([0.45, 0.31, 0.18])
    t = np.clip(gran * 0.7 + spots * 0.5, 0, 1)[..., None]
    rgb = base * (1 - t) + dark * t
    col = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
    return col, normal_from_height(gran + spots * 0.6, 0.02)


def mdf():
    fib = tile_noise(4, 24, 9)
    base = np.array([0.74, 0.60, 0.44])
    rgb = base[None, None, :] * (0.88 + 0.18 * fib[..., None])
    col = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
    return col, normal_from_height(fib, 0.006)


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in [("jersey_n", jersey), ("rib_n", rib), ("canvas_n", canvas), ("terry_n", terry),
                     ("microfiber_n", microfiber), ("brushed_n", brushed)]:
        fn().save(out / f"{name}.png", optimize=True)
    for name, fn in [("cork", cork), ("mdf", mdf)]:
        col, nrm = fn()
        col.save(out / f"{name}_c.jpg", quality=88)
        nrm.save(out / f"{name}_n.png", optimize=True)
    print("TEXTURES_OK", sorted(p.name for p in out.iterdir()))


if __name__ == "__main__":
    main(sys.argv[1])
