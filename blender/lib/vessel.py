"""Reproduzierbar nur mit einem Thread bauen: blender -b -t 1 … (sonst schwanken Normalen-Bytes).

Drehteil-Generator für Gefäße: Tassen, Becher, Flaschen, Teller, Schalen.
lathe(): Rotation eines Außenprofils mit Wandstärke (Außen-, Innenseite, Rand, Boden).
handle(): Henkel als Röhre mit elliptischem Querschnitt; dazu Deckel/Kappen als
geschlossene Drehteile. Druckfläche (wrap_cylinder) liegt auf der Außenseite;
UV der Außenseite als Abwicklung (u = Umfang, v = Höhe).

Export: Meter, Y oben, Vorderseite +Z (Henkel rechts, +x), Ursprung Bounds-Mitte, kein Draco.
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from soft import Builder, path_tube  # noqa: E402
from tee import lerp, smoothstep  # noqa: E402


def lathe(b, profile, wall=0.004, seg=64, mat_out=0, mat_in=None, mat_rim=None, bottom=True,
          inner_bottom=None, open_top=True, uv_wrap=True):
    """profile: Liste (radius, höhe) von unten nach oben (Außenkontur)."""
    mat_in = mat_out if mat_in is None else mat_in
    mat_rim = mat_out if mat_rim is None else mat_rim
    bm, uv = b.bm, b.uv
    h_max = max(h for _, h in profile)
    def ring(r, h):
        return [bm.verts.new(b.V(r * math.cos(2 * math.pi * a / seg), h, r * math.sin(2 * math.pi * a / seg))) for a in range(seg)]
    outer = [ring(r, h) for r, h in profile]
    for j in range(len(outer) - 1):
        for a in range(seg):
            a2 = (a + 1) % seg
            f = bm.faces.new([outer[j][a], outer[j][a2], outer[j + 1][a2], outer[j + 1][a]])
            f.material_index = mat_out
            if uv_wrap:
                for loop, (aa, jj) in zip(f.loops, ((a, j), (a + 1, j), (a + 1, j + 1), (a, j + 1))):
                    loop[uv].uv = (aa / seg, profile[jj][1] / h_max)
    if bottom:
        f = bm.faces.new(outer[0][::-1])
        f.material_index = mat_out
    if not open_top:
        f = bm.faces.new(outer[-1])
        f.material_index = mat_rim
        return outer
    # Innenseite: Profil nach innen versetzt, Boden innen höher
    ib = inner_bottom if inner_bottom is not None else profile[0][1] + wall * 1.5
    inner_prof = [(max(r - wall, 0.001), max(h, ib)) for r, h in profile if h >= ib - 1e-9]
    if inner_prof[0][1] > ib + 1e-6:
        inner_prof.insert(0, (max(profile[0][0] - wall, 0.001), ib))
    inner = [ring(r, h) for r, h in inner_prof]
    for j in range(len(inner) - 1):
        for a in range(seg):
            a2 = (a + 1) % seg
            f = bm.faces.new([inner[j][a2], inner[j][a], inner[j + 1][a], inner[j + 1][a2]])
            f.material_index = mat_in
    f = bm.faces.new(inner[0])
    f.material_index = mat_in
    # Rand: abgerundete Lippe zwischen außen und innen
    top_o, top_i = outer[-1], inner[-1]
    r_o, h_o = profile[-1]
    lip = []
    for k in range(1, 4):
        ang = math.pi * k / 4
        rr = r_o - wall / 2 + (wall / 2) * math.cos(ang)
        lip.append(ring(rr, h_o + (wall / 2) * math.sin(ang)))
    chain = [top_o] + lip + [top_i]
    for j in range(len(chain) - 1):
        for a in range(seg):
            a2 = (a + 1) % seg
            f = bm.faces.new([chain[j][a], chain[j][a2], chain[j + 1][a2], chain[j + 1][a]])
            f.material_index = mat_rim
    return outer


def solid(b, profile, seg=48, mat=0):
    """Geschlossenes Drehteil (Deckel, Kappe, Knopf): Profil (r, h), unten und oben zu."""
    return lathe(b, profile, seg=seg, mat_out=mat, bottom=True, open_top=False, uv_wrap=False)


def handle(b, r_body, h0, h1, reach=0.032, thick=(0.0055, 0.0035), mat=0, shape="c", side=1):
    """Henkel an der Außenwand (x-Richtung): C-Form oder D-Form."""
    pts = []
    n = 22
    r_hi, r_lo = (r_body if isinstance(r_body, tuple) else (r_body, r_body))
    for k in range(n + 1):
        t = k / n
        r_body = lerp(r_hi, r_lo, t)   # Henkelenden treffen die Wand auf ihrer Höhe
        if shape == "d":
            ang = math.pi * t
            x = r_body - 0.002 + reach * math.sin(ang) ** 0.6
        else:
            ang = math.pi * t
            x = r_body - 0.002 + reach * math.sin(ang) ** 0.55   # runde C-Form statt V
        h = lerp(h1, h0, t) + (h1 - h0) * 0.12 * math.sin(math.pi * t) * (1 if shape == "c" else 0)
        pts.append((side * x, h, 0.0))
    path_tube(b, pts, thick[0], seg=12, mat=mat, flat=thick[1] / thick[0])


def finish(b, ortho=None):
    b.finish(thickness=0, smooth=True, ortho=ortho)
