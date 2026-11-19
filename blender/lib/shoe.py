"""Reproduzierbar nur mit einem Thread bauen: blender -b -t 1 … (sonst schwanken Normalen-Bytes).

Schuh-Generator: Slip-on/Stoffschuh (Sohle + Obermaterial mit Einstieg und Gummizug),
flache Schnittteile (Oberteil mit Ösen, Zunge mit Stichlöchern).
Export: Meter, Y oben, Spitze zeigt nach vorne (+Tiefe), Ursprung Bounds-Mitte, kein Draco.
"""
import math
import sys
from pathlib import Path

from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from soft import Builder, slab  # noqa: E402,F401
from tee import lerp, smoothstep  # noqa: E402

L = 0.28


def half_width(t):
    """t 0 = Ferse, 1 = Spitze: halbe Fußbreite."""
    heel, waist, ball = 0.034, 0.038, 0.050
    if t < 0.12:
        # runde Ferse: Viertelkreis-Kontur
        return heel * math.sqrt(max(0.0, 1 - ((0.12 - t) / 0.12) ** 2)) * 0.96 + 0.002
    if t < 0.15:
        return heel * 0.98
    if t < 0.45:
        return lerp(heel, waist, (t - 0.15) / 0.30)
    if t < 0.72:
        return lerp(waist, ball, smoothstep(0.45, 0.72, t))
    return ball * math.sqrt(max(0.0, 1 - ((t - 0.72) / 0.28) ** 2.2)) + 0.002


def shoe(b, ox=0.0, mirror=1, mats=(0, 1, 2, 3), sole_h=0.026, stations=40, seg=28):
    M_UP, M_SOLE, M_GORE, M_LINING = mats
    bm = b.bm
    # Sohle: Umriss auf zwei Höhen, Spitze leicht angehoben
    outline = []
    for k in range(stations + 1):
        t = k / stations
        outline.append((t, half_width(t)))
    pts_l = [(ox + mirror * -w, t) for t, w in outline]
    pts_r = [(ox + mirror * w, t) for t, w in reversed(outline)]
    ring = pts_l + pts_r

    def spring(t):
        return 0.012 * smoothstep(0.82, 1.0, t)
    lower, upper = [], []
    for x, t in ring:
        d = (t - 0.5) * L
        lower.append(bm.verts.new(b.V(x, spring(t), d)))
        upper.append(bm.verts.new(b.V(x, sole_h + spring(t) * 0.6, d)))
    n = len(ring)
    f = bm.faces.new(lower[::-1]); f.material_index = M_SOLE
    for i in range(n):
        j = (i + 1) % n
        f = bm.faces.new([lower[i], lower[j], upper[j], upper[i]]); f.material_index = M_SOLE
    # Obermaterial: Querschnittsbögen über dem Umriss. In der Einstiegszone enden die Bögen
    # beidseitig an einer glatten Kragenlinie; dazwischen bleibt genau ein offener Streifen.
    half = seg // 2

    def open_angle(t):
        u = (t - 0.04) / 0.56
        if not 0 < u < 1:
            return 0.0
        return math.radians(68) * math.sqrt(max(0.0, 1 - (2 * u - 1) ** 2)) ** 0.6

    rows = []
    for k in range(stations + 1):
        t = k / stations
        w = half_width(t) * 0.97
        hgt = lerp(0.044, 0.058, smoothstep(0.0, 0.45, t)) if t < 0.6 else lerp(0.058, 0.026, smoothstep(0.6, 1.0, t))
        d = (t - 0.5) * L
        oa = open_angle(t)
        row = []
        for j in range(seg + 1):
            if j <= half:
                ang = (math.pi / 2 - oa) * j / half
            else:
                ang = (math.pi / 2 + oa) + (math.pi / 2 - oa) * (j - half) / (seg - half)
            x = -w * math.cos(ang)
            h = sole_h + spring(t) * 0.6 + hgt * math.sin(ang) ** 0.75
            row.append(bm.verts.new(b.V(ox + mirror * x, h, d)))
        rows.append(row)
    for k in range(stations):
        t = (k + 0.5) / stations
        opening = open_angle(k / stations) > 0 or open_angle((k + 1) / stations) > 0
        for j in range(seg):
            if opening and j == half:
                continue                       # Einstiegsöffnung
            q = [rows[k][j], rows[k][j + 1], rows[k + 1][j + 1], rows[k + 1][j]]
            if mirror < 0:
                q.reverse()
            f = bm.faces.new(q)
            ang = math.pi * (j + 0.5) / seg
            gore = 0.50 < t < 0.62 and 2 <= abs(j - half) <= 5
            f.material_index = M_GORE if gore else M_UP
    # Der hintere Bogen ist planar. Eine Fläche schließt ihn ohne interne Nähte.
    back = rows[0]
    heel = bm.faces.new(back[::-1] if mirror > 0 else back)
    heel.material_index = M_UP
    # Spitze schließen
    front = rows[-1]
    tip = bm.verts.new(b.V(ox, sole_h + 0.012, 0.5 * L + 0.001))
    for j in range(seg):
        q = [front[j], front[j + 1], tip] if mirror > 0 else [front[j + 1], front[j], tip]
        f = bm.faces.new(q); f.material_index = M_UP
