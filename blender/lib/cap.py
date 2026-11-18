"""Reproduzierbar nur mit einem Thread bauen: blender -b -t 1 … (sonst schwanken Normalen-Bytes).

Parametrischer Cap-Generator: Basecap, Trucker, 5-Panel, Sportcap, Kindercap, Visor.
Krone als Kuppel über ovaler Kopföffnung mit Bahnennähten, Knopf, hinterer
Bogenöffnung mit Riemen und Schnalle; gebogener Schirm mit optionaler Einfassung.

Export wie die anderen Generatoren: Meter, Y oben, Vorderseite +Z (Schirm zeigt
nach vorne), Ursprung Bounds-Mitte, kein Draco.
"""
import math
import sys
from pathlib import Path

from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from soft import Builder, path_tube  # noqa: E402
from tee import lerp, smoothstep  # noqa: E402

DEFAULTS = dict(
    name="Cap",
    a=0.093,              # halbe Kopfweite (seitlich)
    b=0.103,              # halbe Kopflänge (vorne/hinten)
    height=0.115,         # Kronenhöhe
    front_lift=0.0,       # Front höher (Trucker)
    panels=6,             # 6 oder 5 (5 = breite Frontbahn ohne Mittelnaht)
    button=True,
    brim_len=0.075,
    brim_w=0.095,         # halbe Schirmbreite
    brim_curve=0.060,     # Durchbiegung der Schirmseiten nach unten
    brim_binding=False,
    mesh_back=False,      # Trucker: Netz an Seiten/Rücken
    perforated=False,     # Sportcap: perforierte Seitenbahnen
    visor=False,          # nur Schirm + Stirnband
    band_h=0.035,         # Stirnbandhöhe (Visor)
    color=(0.93, 0.93, 0.93),
)


def build(config):
    c = dict(DEFAULTS)
    c.update(config)
    mats = [("Polyester weiß", c["color"], 0.80),
            ("Netz", (0.70, 0.71, 0.73), 0.95),  # sichtbar dunkler als der Stoff (Referenz 118)
            ("Perforation", (0.72, 0.72, 0.74), 0.90),  # Lochfeld wirkt grauer (Referenz 120)
            ("Schnalle", (0.05, 0.05, 0.06), 0.45),
            ("Einfassung", (0.88, 0.88, 0.89), 0.85)]
    M_BODY, M_MESH, M_PERF, M_BUCKLE, M_BIND = range(5)
    bld = Builder(c["name"], mats)
    A, B, H = c["a"], c["b"], c["height"]
    seams = ([math.radians(d) for d in (90, 150, 210, 270, 330, 30)] if c["panels"] == 6
             else [math.radians(d) for d in (40, 140, 210, 270, 330)])
    # phi: 0 = rechts (+x), 90° = vorne (+Tiefe), 270° = hinten

    def crown_point(theta, phi):
        """theta 0 = Scheitel, pi/2 = Rand."""
        front = max(0.0, math.sin(phi)) ** 2
        # Front-Erhöhung verschwindet zum Scheitel hin (keine Spitze oben)
        h = H * (1 + c["front_lift"] * front * math.sin(theta) ** 1.5) * math.cos(theta) ** 0.85
        r = math.sin(theta) ** 0.9
        x, d = A * r * math.cos(phi), B * r * math.sin(phi)
        # Nahtrillen
        g = 0.0
        for s in seams:
            dphi = math.atan2(math.sin(phi - s), math.cos(phi - s))
            g += -0.0012 * math.exp(-((dphi / 0.025) ** 2)) * math.sin(theta)
        k = 1 + g / max(A, 1e-6)
        return Vector((x * k, h * (1 + g * 0.2), d * k))

    def zone_mat(theta, phi):
        back = math.sin(phi) < -0.15
        side = abs(math.cos(phi)) > 0.55
        if c["mesh_back"] and (back or side) and math.sin(phi) < 0.55:
            return M_MESH
        if c["perforated"] and side and theta > 0.5 and math.sin(phi) > -0.6:
            return M_PERF
        return M_BODY

    if not c["visor"]:
        NT, NP = 14, 48   # Cap-Budget 80 KiB
        rows = []
        for i in range(NT + 1):
            theta = (math.pi / 2) * (0.02 + 0.98 * i / NT)
            rows.append([crown_point(theta, 2 * math.pi * j / NP) for j in range(NP)])
        verts = [[bld.bm.verts.new(bld.V(p.x, p.y, p.z)) for p in row] for row in rows]
        for i in range(NT):
            for j in range(NP):
                j2 = (j + 1) % NP
                phi = 2 * math.pi * (j + 0.5) / NP
                theta = (math.pi / 2) * (0.02 + 0.98 * (i + 0.5) / NT)
                # hintere Bogenöffnung über dem Riemen
                rel = math.atan2(math.sin(phi + math.pi / 2), math.cos(phi + math.pi / 2))  # 0 = hinten
                if abs(rel) < 0.42 and theta > math.pi / 2 * (0.62 + 0.25 * (abs(rel) / 0.42) ** 2):
                    continue
                f = bld.bm.faces.new([verts[i][j], verts[i][j2], verts[i + 1][j2], verts[i + 1][j]])
                f.material_index = zone_mat(theta, phi)
        top = bld.bm.faces.new(verts[0][::-1])
        top.material_index = M_BODY
        if c["button"]:
            ring = []
            for j in range(16):
                phi = 2 * math.pi * j / 16
                ring.append((0.008 * math.cos(phi), H + 0.003, 0.008 * math.sin(phi)))
            pts = [[bld.V(x, h - 0.004 + 0.004 * k / 3 + 0.0015 * math.sin(math.pi * k / 3), d * (1 - 0.3 * (k / 3) ** 2)) for (x, h, d) in ring] for k in range(4)]
            r = bld.quad_grid(pts, lambda i, j: M_BODY, closed_u=True)
            bld.bm.faces.new(r[-1]).material_index = M_BODY
        # Riemen mit Schnalle über der Öffnung
        strap = [(A * math.cos(p) * 1.005, 0.012, B * math.sin(p) * 1.005) for p in [math.radians(270 + d) for d in (-26, -13, 0, 13, 26)]]
        path_tube(bld, strap, 0.0045, seg=8, mat=M_BODY)
        bx = A * math.cos(math.radians(282)) * 1.03
        bd = B * math.sin(math.radians(282)) * 1.03
        path_tube(bld, [(bx - 0.008, 0.012, bd), (bx + 0.008, 0.012, bd)], 0.009, seg=4, mat=M_BUCKLE, flat=0.35)
    else:
        # Visor: Stirnband vorne + Riemen hinten
        NP = 64
        rows = []
        for k in range(4):
            h = c["band_h"] * k / 3
            rows.append([Vector((A * math.cos(2 * math.pi * j / NP), h, B * math.sin(2 * math.pi * j / NP))) for j in range(NP)])
        verts = [[bld.bm.verts.new(bld.V(p.x, p.y, p.z)) for p in row] for row in rows]
        for k in range(3):
            for j in range(NP):
                phi = 2 * math.pi * (j + 0.5) / NP
                if math.sin(phi) < -0.55:
                    continue
                f = bld.bm.faces.new([verts[k][j], verts[k][(j + 1) % NP], verts[k + 1][(j + 1) % NP], verts[k + 1][j]])
                f.material_index = M_BODY
        strap = [(A * math.cos(p), 0.015, B * math.sin(p)) for p in [math.radians(270 + d) for d in range(-58, 59, 8)]]  # von Bandende zu Bandende
        path_tube(bld, strap, 0.005, seg=8, mat=M_BODY)
        ba = math.radians(290)
        bx, bd = A * math.cos(ba) * 1.03, B * math.sin(ba) * 1.03
        path_tube(bld, [(bx - 0.008, 0.015, bd), (bx + 0.008, 0.015, bd)], 0.011, seg=4, mat=M_BUCKLE, flat=0.35)

    # Schirm: gebogen, vorne angesetzt
    NU, NV = 22, 8
    L, W = c["brim_len"], c["brim_w"]
    top_rows, bot_rows = [], []
    for jv in range(NV + 1):
        v = jv / NV
        row_t, row_b = [], []
        for iu in range(NU + 1):
            u = -1 + 2 * iu / NU
            phi = math.pi / 2 - u * math.radians(62)
            rx, rd = A * math.cos(phi), B * math.sin(phi)
            reach = L * (0.22 + 0.78 * math.sqrt(max(0.0, 1 - u * u)) ** 0.7) * v   # abgerundete Ecken
            x = rx * (0.975 + 0.175 * v) + u * W * 0.25 * v   # Ansatz leicht innerhalb der Krone
            d = rd * 0.975 + reach
            # Seiten biegen nach unten, proportional zur Schirmlänge an dieser Stelle (keine Steilklappen)
            h = 0.004 - c["brim_curve"] * (u * u) * (reach / L) * 0.6 - 0.010 * v * v
            row_t.append(bld.bm.verts.new(bld.V(x, h, d)))
            row_b.append(bld.bm.verts.new(bld.V(x, h - 0.004, d)))
        top_rows.append(row_t)
        bot_rows.append(row_b)
    for jv in range(NV):
        for iu in range(NU):
            m = M_BIND if (c["brim_binding"] and jv == NV - 1) else M_BODY
            f = bld.bm.faces.new([top_rows[jv][iu], top_rows[jv][iu + 1], top_rows[jv + 1][iu + 1], top_rows[jv + 1][iu]])
            f.material_index = m
            f = bld.bm.faces.new([bot_rows[jv][iu], bot_rows[jv + 1][iu], bot_rows[jv + 1][iu + 1], bot_rows[jv][iu + 1]])
            f.material_index = m
    for iu in range(NU):   # Vorderkante
        f = bld.bm.faces.new([top_rows[NV][iu], top_rows[NV][iu + 1], bot_rows[NV][iu + 1], bot_rows[NV][iu]])
        f.material_index = M_BIND if c["brim_binding"] else M_BODY
    for jv in range(NV):   # Seitenkanten
        for iu in (0, NU):
            f = bld.bm.faces.new([top_rows[jv][iu], top_rows[jv + 1][iu], bot_rows[jv + 1][iu], bot_rows[jv][iu]])
            f.material_index = M_BODY

    bld.finish(thickness=0.0018 if not c["visor"] else 0.0025)
