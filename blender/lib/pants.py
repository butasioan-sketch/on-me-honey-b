"""Reproduzierbar nur mit einem Thread bauen: blender -b -t 1 … (sonst schwanken Normalen-Bytes).

Parametrischer Hosen-Generator (Shorts, Jogger, Leggings, Radler).

Aufbau: zwei Beinröhren, die oberhalb des Schritts leicht überlappen und dort
die Mittelnaht bilden; darüber ein Rippbund. Optional Kordel mit Ösen,
Beinbündchen, Seitenpaspel, Eingrifftaschen, Doppelsteppnaht am Saum.

Export wie tee.py: Meter, Y oben, Vorderseite +Z, Ursprung Bounds-Mitte,
kein Draco, UV Vorderseite u 0–0,5, Rückseite u 0,5–1.
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tee import _material, lerp, render_views, smoothstep  # noqa: E402

DEFAULTS = dict(
    name="Pants",
    waist_w=0.190,      # halbe Bundweite (flach gemessen)
    hip_w=0.250,        # halbe Hüftweite
    hip_d=0.135,        # halbe Hüfttiefe
    rise=0.300,         # Bund bis Schritt
    inseam=0.700,       # Schritt bis Saum
    thigh_r=0.105,      # Oberschenkelradius
    knee_r=0.075,
    hem_r=0.060,
    leg_sep=0.115,      # Abstand Beinmitte zur Mitte am Saum
    waistband=0.045,    # Bundhöhe
    drawcord=False,
    cuff=0.0,           # Beinbündchen (m)
    piping=False,       # Seitenpaspel
    pockets=False,      # Eingrifftaschen vorne
    folds=1.0,
    hem_stitch=True,
    fabric=0.0022,
    color=(0.92, 0.92, 0.92),
    rib_color=(0.89, 0.89, 0.89),
    piping_color=(0.05, 0.05, 0.06),
    seg=36, rows=44,
)


def build(config):
    c = dict(DEFAULTS)
    c.update(config)
    args = sys.argv[sys.argv.index("--") + 1:]
    output = Path(args[0]).resolve()
    blend_out = Path(args[1]).resolve() if len(args) > 1 and args[1] else None
    render_prefix = args[2] if len(args) > 2 else None
    output.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    mats = [_material("Polyester weiß", c["color"]),
            _material("Rippbund", c["rib_color"], rough=0.92),
            _material("Paspel", c["piping_color"], rough=0.6)]
    M_BODY, M_RIB, M_PIPE = 0, 1, 2

    H = c["rise"] + c["inseam"]          # Gesamthöhe, Saum bei 0
    crotch_h = c["inseam"]
    total = H - c["waistband"]           # Bein reicht bis Unterkante Bund
    SEG, ROWS = c["seg"], c["rows"]

    def leg_profile(h):
        """Beinröhre über glatte Außen- und Innenkante: Mittelpunkt x, Radius x, Radius Tiefe."""
        if h >= crotch_h:
            t = (h - crotch_h) / (total - crotch_h)
            half = lerp(c["hip_w"], c["waist_w"], t ** 1.3)  # Stoff fällt gleichmäßig vom Bund zur Hüfte
            x_out, x_in = half, -half * 0.06          # leichte Überlappung = Mittelnaht
            rz = lerp(c["hip_d"], c["hip_d"] * 0.88, t)
        else:
            t = 1 - h / crotch_h                       # 0 am Schritt, 1 am Saum
            k1 = smoothstep(0, 0.55, t)                # Schritt -> Knie
            k2 = smoothstep(0.55, 1, t)                # Knie -> Saum
            out_knee = c["leg_sep"] + c["knee_r"]
            in_knee = c["leg_sep"] - c["knee_r"]
            x_out = lerp(lerp(c["hip_w"], out_knee, k1), c["leg_sep"] + c["hem_r"], k2)
            x_in = lerp(lerp(-c["hip_w"] * 0.06, in_knee, k1), c["leg_sep"] - c["hem_r"], k2)
            r_now = (x_out - x_in) / 2
            rz = lerp(c["hip_d"], r_now * 0.95, smoothstep(0, 0.35, t))
        return (x_out + x_in) / 2, (x_out - x_in) / 2, rz

    def groove(dist, depth=0.0007, width=0.0012):
        return -depth * math.exp(-((dist / width) ** 2))

    def to_blender(x, h, d):
        return Vector((x, -d, h))

    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")

    for s in (-1, 1):
        rings = []
        for j in range(ROWS + 1):
            # dichter am Schritt und am Saum
            t = j / ROWS
            h = total * (t - 0.04 * math.sin(2 * math.pi * t))
            cx, rx, rz = leg_profile(h)
            ring = []
            for a in range(SEG):
                phi = 2 * math.pi * a / SEG      # 0 = außen
                co, si = math.cos(phi), math.sin(phi)
                r_s = 1.0
                # Faltenwurf: Querfalten über dem Knie/Knöchel bei weiten Hosen
                r_s += 0.012 * c["folds"] * math.sin(26 * h + 3 * phi) * math.exp(-(((h - 0.12) / 0.10) ** 2))
                r_s += 0.008 * c["folds"] * math.sin(19 * h - 2 * phi) * math.exp(-(((h - crotch_h * 0.55) / 0.12) ** 2))
                if c["hem_stitch"] and not c["cuff"]:
                    r_s += (groove(h - 0.020) + groove(h - 0.026)) / max(rx, 0.03)
                if c["pockets"] and si > 0.2 and co > -0.1:
                    # schräge Eingrifftasche: von der Bundkante nach außen-unten
                    line = total - 0.02 - (co - 0.1) * 0.20
                    r_s += groove(h - line, 0.0009, 0.0014) / max(rx, 0.03) * smoothstep(total - 0.22, total - 0.18, h)
                x = cx * s + s * rx * co * r_s
                d = rz * si * r_s
                ring.append(bm.verts.new(to_blender(x, h, d)))
            rings.append((ring, h))
        for j in range(ROWS):
            (ra, ha), (rb, hb) = rings[j], rings[j + 1]
            for a in range(SEG):
                b = (a + 1) % SEG
                q = [ra[a], ra[b], rb[b], rb[a]]
                if s < 0:
                    q.reverse()
                f = bm.faces.new(q)
                phi = 2 * math.pi * (a + 0.5) / SEG
                hm = (ha + hb) / 2
                m = M_BODY
                if c["cuff"] and hm < c["cuff"]:
                    m = M_RIB
                if c["piping"] and abs(math.atan2(math.sin(phi), math.cos(phi))) < 2 * math.pi / SEG * 0.6:
                    m = M_PIPE
                f.material_index = m
                for loop in f.loops:
                    lx, lh, ly = loop.vert.co.x, loop.vert.co.z, loop.vert.co.y
                    front = ly <= 0
                    loop[uv].uv = ((lx / (c["hip_w"] * 2.6) + 0.5) * 0.5 + (0 if front else 0.5), lh / H)

    # Rippbund: Superellipsen-Ring über beiden Beinen
    wb_rows, wb_seg = 4, 48
    band = []
    for j in range(wb_rows + 1):
        h = total - 0.004 + (c["waistband"] + 0.004) * j / wb_rows
        ring = []
        for a in range(wb_seg):
            phi = 2 * math.pi * a / wb_seg
            co, si = math.cos(phi), math.sin(phi)
            p = 3.0
            r = (abs(co) ** p + abs(si) ** p) ** (-1 / p)
            ring.append(bm.verts.new(to_blender(c["waist_w"] * 1.006 * r * co, h, c["hip_d"] * 0.885 * r * si)))
        band.append(ring)
    for j in range(wb_rows):
        for a in range(wb_seg):
            b = (a + 1) % wb_seg
            f = bm.faces.new([band[j][a], band[j][b], band[j + 1][b], band[j + 1][a]])
            f.material_index = M_RIB
            for loop in f.loops:
                loop[uv].uv = (0.99, 0.99)

    if c["drawcord"]:
        # Ösen + zwei hängende Kordelenden vorne mittig
        for side in (-1, 1):
            x0 = side * 0.022
            top = Vector(to_blender(x0, total + c["waistband"] * 0.45, c["hip_d"] * 0.90 + 0.002))
            pts = [top + Vector((side * 0.004 * k, -0.004 - 0.0015 * k, -0.028 * k)) for k in range(7)]
            prev = None
            for p in pts:
                ring = [bm.verts.new(p + Vector((math.cos(2 * math.pi * a / 8) * 0.0022, math.sin(2 * math.pi * a / 8) * 0.0022, 0))) for a in range(8)]
                if prev:
                    for a in range(8):
                        b = (a + 1) % 8
                        f = bm.faces.new([prev[a], prev[b], ring[b], ring[a]])
                        f.material_index = M_RIB
                prev = ring
            cap = bm.faces.new(prev[::-1])
            cap.material_index = M_RIB

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(c["name"])
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(c["name"], mesh)
    scene.collection.objects.link(obj)
    for m in mats:
        mesh.materials.append(m)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    sol = obj.modifiers.new("Stoffkante", "SOLIDIFY")
    sol.thickness = c["fabric"]
    sol.offset = -1
    sol.use_rim_only = True
    bpy.ops.object.modifier_apply(modifier="Stoffkante")
    bpy.ops.object.shade_smooth()
    used = {p.material_index for p in mesh.polygons}
    for idx in sorted(set(range(len(mesh.materials))) - used, reverse=True):
        mesh.materials.pop(index=idx)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0, 0, 0)

    if blend_out:
        blend_out.parent.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(blend_out))
    bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB",
                              export_draco_mesh_compression_enable=False,
                              export_apply=True, export_yup=True)
    print("EXPORT", output)
    if render_prefix:
        render_views(scene, render_prefix, H * 1.25)
