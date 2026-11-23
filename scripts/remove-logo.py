"""Entfernt das Platzhalter-Logo (goldener Honigdachs) aus einem Produktfoto, bevor es
an Foto-zu-3D geht. Der Stoff darunter ist weiß; das Logo ist farbig (Gold/Braun/Schwarz).

python3 scripts/remove-logo.py <in> <out> [maske_png]

Vorgehen: Logo-Maske = stark gesättigte ODER dunkle Pixel im inneren Bildbereich, größte
zusammenhängende Fläche, aufgeweitet. Füllen per Diffusion (wiederholtes Weichzeichnen
nur innerhalb der Maske, Ränder bleiben fest) → glatte Fortsetzung der Stoffhelligkeit.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter


def logo_mask(rgb):
    a = rgb.astype(np.float32) / 255
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-6)
    lum = a @ np.array([0.299, 0.587, 0.114])
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w]
    inner = (xx > w * 0.12) & (xx < w * 0.88) & (yy > h * 0.12) & (yy < h * 0.9)
    m = ((sat > 0.28) | (lum < 0.30)) & inner
    img = Image.fromarray((m * 255).astype(np.uint8))
    # Lücken im Logo schließen, Ränder großzügig erweitern
    img = img.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(15))
    m = np.array(img) > 127
    # nur die größte zusammenhängende Fläche (das Logo), nicht Schatten am Rand
    from collections import deque
    lab = np.zeros(m.shape, np.int32)
    best, best_n, cur = 0, 0, 0
    for y0, x0 in zip(*np.nonzero(m)):
        if lab[y0, x0]:
            continue
        cur += 1
        q = deque([(y0, x0)])
        lab[y0, x0] = cur
        n = 0
        while q:
            y, x = q.popleft()
            n += 1
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = cur
                    q.append((ny, nx))
        if n > best_n:
            best, best_n = cur, n
    return lab == best if best else m


def _diffuse(out, mask, iters, k):
    for _ in range(iters):
        blur = np.array(Image.fromarray(out.clip(0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(k)), np.float32)
        out[mask] = blur[mask]
    return out


def fill(rgb, mask):
    """Normalisierte Faltung: jeder Maskenpixel erhält den nähegewichteten Mittelwert der
    unverdeckten Umgebung – auf mehreren Skalen, damit Helligkeitsverläufe (Falten,
    Schatten) weiterlaufen statt zu einem flachen Grau zu verschwimmen."""
    from scipy.ndimage import gaussian_filter, distance_transform_edt
    img = rgb.astype(np.float32)
    valid = (~mask).astype(np.float32)
    dist = distance_transform_edt(mask)  # Abstand zum Maskenrand in Pixeln
    out = img.copy()
    filled = np.zeros_like(img)
    weight = np.zeros(mask.shape, np.float32)
    for sigma in (4, 10, 24, 60):
        den = gaussian_filter(valid, sigma)
        est = np.stack([gaussian_filter(img[..., c] * valid, sigma) for c in range(3)], -1) / np.maximum(den, 1e-4)[..., None]
        # kleine Skala nahe am Rand (Details), große Skala tief im Fleck (Verlauf)
        w = np.exp(-((dist - 1.5 * sigma) / (1.5 * sigma)) ** 2) * (den > 0.02)
        filled += est * w[..., None]
        weight += w
    filled /= np.maximum(weight, 1e-6)[..., None]
    out[mask] = filled[mask]
    # Stoffstruktur: feines Rauschen in der Stärke des umgebenden Stoffes
    ring = (distance_transform_edt(~mask) < 12) & ~mask
    hp = img - np.stack([gaussian_filter(img[..., c], 2) for c in range(3)], -1)
    sd = float(hp[ring].std()) if ring.any() else 1.0
    noise = np.random.default_rng(1).normal(0, min(sd, 3.0), img.shape[:2])[..., None]
    out[mask] += noise[mask]
    return out.clip(0, 255).astype(np.uint8)


def fill_alt(rgb, mask):
    out = rgb.astype(np.float32)
    # Startwert: Stoffton im schmalen Ring direkt um das Logo (nicht der Bildhintergrund)
    ring_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(11))
    ring = (np.array(ring_img) > 127) & ~mask
    out[mask] = np.median(out[ring], axis=0) if ring.any() else 235
    # grob nach fein: auf 1/4 Größe ausgleichen, hochskalieren, dann fein nacharbeiten
    h, w = mask.shape
    small = Image.fromarray(out.clip(0, 255).astype(np.uint8)).resize((w // 4, h // 4), Image.BILINEAR)
    sm_mask = np.array(Image.fromarray((mask * 255).astype(np.uint8)).resize((w // 4, h // 4))) > 127
    so = _diffuse(np.array(small, np.float32), sm_mask, 300, 2)
    up = np.array(Image.fromarray(so.clip(0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR), np.float32)
    out[mask] = up[mask]
    out = _diffuse(out, mask, 120, 2)
    noise = np.random.default_rng(1).normal(0, 1.0, out.shape)
    out[mask] += noise[mask]
    return out.clip(0, 255).astype(np.uint8)


def main(src, dst, mask_out=None):
    im = Image.open(src).convert("RGB")
    scale = 1.0
    if max(im.size) > 1400:  # Rechenzeit begrenzen
        scale = 1400 / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    rgb = np.array(im)
    m = logo_mask(rgb)
    if mask_out:
        Image.fromarray((m * 255).astype(np.uint8)).save(mask_out)
    res = fill(rgb, m)
    Image.fromarray(res).save(dst, quality=95)
    print("LOGO_REMOVED", src, f"{m.mean() * 100:.1f}% Fläche")


if __name__ == "__main__":
    main(*sys.argv[1:4])
