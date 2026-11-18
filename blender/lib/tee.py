"""Parametrischer T-Shirt-Generator (Blender 4, headless).

Aufbau: Vorder- und Rückenteil als eigene Stoffbahnen (Superellipsen-Profil),
die an Seiten- und Schulternaht zusammenlaufen; Rundhals vorne tiefer als
hinten; eingesetzte Ärmel; Doppelsteppnaht an Saum und Ärmel; Faltenwurf.
Optional: Carbon-Kontraste (JN827), Raglan-Naht, Taillierung.

Export: Meter, Y oben, Vorderseite +Z, Ursprung Bounding-Box-Mitte,
kein Draco, UV Vorderseite u 0–0,5, Rückseite u 0,5–1.

Aufruf aus einem SKU-Skript:
    import tee
    tee.build(CONFIG)   # liest output/.blend/render-prefix aus sys.argv nach "--"
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

DEFAULTS = dict(
    name="Tee",
    length=0.72,          # hoher Schulterpunkt bis Saum
    half_w=0.265,         # halbe Brustweite
    waist_w=0.256,        # halbe Weite an der Taille
    waist_h=0.25,         # Taillenhöhe über Saum
    hem_w=None,           # halbe Saumweite (None = half_w)
    shoulder_x=0.226,     # halbe Schulterbreite
    shoulder_drop=0.046,  # Schulterneigung vom Hals bis Schulterpunkt
    armpit_h=0.50,
    neck_w=0.086,
    front_drop=0.085,
    back_drop=0.022,
    neck_d_front=0.070,
    neck_d_back=0.060,
    body_d=0.150,
    sleeve_len=0.185,
    sleeve_angle=38.0,    # Grad unter der Horizontalen
    sleeve_root=(0.098, 0.088),  # Radius oben/Tiefe am Armloch
    sleeve_cuff=(0.074, 0.062),  # Radius oben/Tiefe an der Öffnung
    fabric=0.0022,
    color=(0.92, 0.92, 0.92),
    rib_color=(0.89, 0.89, 0.89),
    carbon=False,         # JN827: Schulterstreifen + Seiteneinsätze
    carbon_color=(0.05, 0.052, 0.056),
    raglan=False,         # Raglan-Naht vom Hals zur Achsel
    side_seam_lines=False,  # Teilungsnähte vorne (Laufshirt)
    folds=1.0,            # Stärke des Faltenwurfs
    sleeveless=False,     # Tanktop/Träger: offene Armausschnitte statt Ärmel
    armhole_h=None,       # Unterkante Armausschnitt (None = armpit_h)
    armhole_open=0.55,    # Öffnungstiefe des Armausschnitts relativ zur Rumpftiefe
    neck_style="round",   # "round" oder "v"
    cuff_rib=0.0,         # Länge Rippbündchen am Ärmelende (m)
    back_tail=0.0,        # Rückenteil am Saum länger (m), gerundeter Saum
    underband=0.0,        # Rippband am Saum (m), z. B. Sport-BH
    hem_stitch=True,
    placket=None,         # dict(length, width, buttons) Knopfleiste vorne
    collar=None,          # dict(stand, fall) Polokragen
    crotch=None,          # dict(leg_h, crotch_w, open) Baby-Body: Schritt + Beinausschnitte
    nu=40, nv=56,         # Raster je Stoffbahn (Budget < 300 KiB)
    seg_a=32, seg_l=18,   # Raster je Ärmel
)

BAND_ROWS = 4
BAND = 0.040
P_SE = 2.7


def smoothstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def _material(name, rgb, rough=0.82, sheen=0.25):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    m.use_backface_culling = False  # Innenseite durch Öffnungen sichtbar
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = rough
    for key in ("Sheen Weight", "Sheen"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = sheen
            break
    return m


def build(config):
    c = dict(DEFAULTS)
    c.update(config)
    args = sys.argv[sys.argv.index("--") + 1:]
    output = Path(args[0]).resolve()
    blend_out = Path(args[1]).resolve() if len(args) > 1 and args[1] else None
    render_prefix = args[2] if len(args) > 2 else None
    output.parent.mkdir(parents=True, exist_ok=True)

    L, HW, SX, AH, NW = c["length"], c["half_w"], c["shoulder_x"], c["armpit_h"], c["neck_w"]
    HEM_W = c["hem_w"] if c["hem_w"] is not None else HW
    NU, NV = c["nu"], c["nv"]
    ang = math.radians(c["sleeve_angle"])

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"

    mats = [_material("Polyester weiß", c["color"]),
            _material("Kontrasteinsatz carbon", c["carbon_color"], rough=0.72),
            _material("Rippbündchen", c["rib_color"], rough=0.92)]
    M_WHITE, M_CARBON, M_RIB = 0, 1, 2

    AHOLE = c["armhole_h"] if c["armhole_h"] is not None else AH

    def armhole_t(h):
        """0 an der Unterkante des Armausschnitts, 1 an der Schulternaht."""
        return min(1.0, max(0.0, (h - AHOLE) / (L - c["shoulder_drop"] - AHOLE)))

    def body_width(v):
        h = v * L
        if c["sleeveless"] and h > AHOLE:
            # Armausschnitt: schnell nach innen, oben fast senkrechter Träger
            t = armhole_t(h)
            return SX + (HW - SX) * (1 - t) ** 3
        chest_h = AH - 0.03
        cr = c["crotch"]
        if cr and h <= cr["leg_h"]:
            t = smoothstep(0, cr["leg_h"], h) ** 0.55
            return lerp(cr["crotch_w"], c["waist_w"], t)
        if h <= c["waist_h"]:
            return lerp(HEM_W, c["waist_w"], smoothstep(0, c["waist_h"], h))
        if h <= chest_h:
            return lerp(c["waist_w"], HW, smoothstep(c["waist_h"], chest_h, h))
        t = (h - chest_h) / (L - chest_h)
        return lerp(HW, SX, smoothstep(0, 1, t))

    def top_height(x, front):
        ax = abs(x)
        if ax >= NW:
            return L - c["shoulder_drop"] / (SX - NW) * (ax - NW)
        drop = c["front_drop"] if front else c["back_drop"]
        if front and c["neck_style"] == "v":
            return L - drop * (1 - ax / NW) ** 1.1
        return L - drop * math.sqrt(max(0.0, 1 - (ax / NW) ** 2))

    def neck_depth(x, front):
        ax = abs(x)
        if ax >= NW:
            return 0.0
        d = c["neck_d_front"] if front else c["neck_d_back"]
        return d * math.sqrt(max(0.0, 1 - (ax / NW) ** 2))

    def superellipse(u):
        return max(0.0, 1 - abs(u) ** P_SE) ** (1 / P_SE)

    def folds(x, h, front):
        s = 1 if front else -1
        under_arm = math.exp(-(((h - (AH - 0.07)) / 0.07) ** 2)) * smoothstep(0.12 * HW / 0.265, 0.24 * HW / 0.265, abs(x))
        diag = 0.004 * under_arm * math.sin(38 * h + 9 * abs(x) * s)
        hem = 0.0028 * math.exp(-((h / 0.09) ** 2)) * math.sin(23 * x + 1.3 * s)
        drape = 0.0018 * math.sin(11 * x + 7 * h + s) * (1 - smoothstep(0.45 * L / 0.72, 0.65 * L / 0.72, h))
        return (diag + hem + drape) * c["folds"]

    def groove(dist, depth=0.0007, width=0.0012):
        return -depth * math.exp(-((dist / width) ** 2))

    def hem_stitch(h):
        if not c["hem_stitch"]:
            return 0.0
        return groove(h - 0.020) + groove(h - 0.026)

    def seam_lines(x, h, front):
        d = 0.0
        if c["raglan"]:
            # Raglan-Naht: vom Halsausschnitt schräg bis unter die Achsel
            x0, h0 = NW * 1.15, top_height(NW * 1.15, front) - 0.01
            x1, h1 = HW * 0.92, AH
            if min(h0, h1) - 0.02 < h < max(h0, h1) + 0.01:
                t = (h - h0) / (h1 - h0)
                xs = lerp(x0, x1, min(1, max(0, t)))
                d += groove(abs(x) - xs, 0.0010, 0.0016)
        if c["side_seam_lines"] and front:
            # geschwungene Teilungsnaht vorne (Laufshirt)
            xs = HW * (0.70 + 0.10 * math.sin(math.pi * min(1, h / AH)))
            if h < AH:
                d += groove(abs(x) - xs, 0.0008, 0.0014)
        return d

    def to_blender(x, h, d):
        return Vector((x, -d, h))

    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")

    for front in (True, False):
        sign = 1 if front else -1
        rows = []
        lower = NV - BAND_ROWS
        for j in range(NV + 1):
            v_guess = j / NV
            row = []
            for i in range(NU + 1):
                u = -1 + 2 * i / NU
                x = u * body_width(v_guess)
                top = top_height(x, front)
                h = (j / lower) * (top - BAND) if j <= lower else top - BAND + BAND * (j - lower) / BAND_ROWS
                if not front and c["back_tail"] and j <= lower:
                    # gerundeter, längerer Rückensaum; an der Seitennaht 0, damit sie schließt
                    h -= c["back_tail"] * superellipse(u) ** 1.5 * (1 - j / lower) ** 2
                v = max(0.0, h) / top
                blend = smoothstep(0.84, 1.0, v)
                d_body = c["body_d"] * superellipse(u) * (1 - 0.12 * smoothstep(0.7, 1.0, v))
                d = d_body * math.sqrt(max(0.0, 1 - blend)) + neck_depth(x, front) * blend
                cr = c["crotch"]
                if cr and h < cr["leg_h"]:
                    k = smoothstep(0, cr["leg_h"], h)
                    d *= k ** 0.6  # Schritt schließt unten
                    gap = c["body_d"] * cr.get("open", 0.35) * math.sin(math.pi * min(1, h / cr["leg_h"])) ** 0.8
                    d = max(d, gap * (1 - superellipse(u)) + d * superellipse(u))
                if c["sleeveless"] and h > AHOLE:
                    # Seitenkanten oberhalb des Armausschnitts bleiben getrennt: offene Öffnung
                    t = armhole_t(h)
                    gap = c["body_d"] * c["armhole_open"] * math.sin(math.pi * t) ** 0.8
                    d = max(d, gap * (1 - superellipse(u)) + d * superellipse(u))
                seam_fade = superellipse(u) * (1 - blend)
                if abs(x) < NW * 1.05:
                    below = top - h
                    d += 0.0025 * math.exp(-(((below - 0.009) / 0.006) ** 2)) * (1 - (abs(x) / (NW * 1.05)) ** 4)
                d += folds(x, h, front) * seam_fade
                d += hem_stitch(h) * seam_fade
                d += seam_lines(x, h, front) * seam_fade
                row.append(bm.verts.new(to_blender(x, h, sign * d)))
            rows.append(row)

        for j in range(NV):
            for i in range(NU):
                q = [rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]]
                if not front:
                    q.reverse()
                f = bm.faces.new(q)
                cen = sum((vv.co for vv in q), Vector()) / 4
                x, h = cen.x, cen.z
                u_c = -1 + 2 * (i + 0.5) / NU
                mat = M_WHITE
                if c["carbon"] and h < AH + 0.01 and abs(u_c) > 0.84:
                    mat = M_CARBON
                if c["sleeveless"] and h > AHOLE and abs(u_c) > 1 - 2.5 / NU:
                    mat = M_RIB  # Einfassung am Armausschnitt
                if c["underband"] and h < c["underband"]:
                    mat = M_RIB
                if c["crotch"] and h < c["crotch"]["leg_h"] and abs(u_c) > 1 - 2.5 / NU:
                    mat = M_RIB  # Einfassung am Beinausschnitt
                pk = c["placket"]
                if pk and front and abs(x) < pk["width"] / 2 and h > top_height(0, True) - pk["length"]:
                    mat = M_RIB
                if j >= lower:
                    band_row = j - lower
                    if abs(x) < NW * 1.12:
                        if band_row >= BAND_ROWS - 2:
                            mat = M_RIB
                    elif c["carbon"]:
                        if not front or band_row == BAND_ROWS - 1:
                            mat = M_CARBON
                f.material_index = mat
                for loop in f.loops:
                    lx, lh = loop.vert.co.x, loop.vert.co.z
                    loop[uv_layer].uv = ((lx / (HW * 2.34) + 0.5) * 0.5 + (0.0 if front else 0.5), lh / L)

    SEG_A, SEG_L = c["seg_a"], c["seg_l"]
    (ru0, rd0), (ru1, rd1) = c["sleeve_root"], c["sleeve_cuff"]
    for side in (() if c["sleeveless"] else (-1, 1)):
        sh_h = top_height(SX, True)
        axis = Vector((side * math.cos(ang), 0.0, -math.sin(ang)))
        up = Vector((side * math.sin(ang), 0.0, math.cos(ang)))
        depth_dir = Vector((0.0, 1.0, 0.0))
        if c["sleeve_angle"] <= 55:
            c_sh = sh_h - ru0 * math.cos(ang)
            inset = 0.07 * HW / 0.265
            root = Vector((side * (SX - inset), 0.0, c_sh + inset * math.tan(ang)))
            exit_len = inset / math.cos(ang)
        else:
            # hängender Langarm: Ärmeloberkante tangiert den Schulterpunkt, Wurzel kurz im Rumpf
            exit_len = 0.035
            shoulder = Vector((side * SX, 0.0, sh_h))
            root = shoulder - up * ru0 - axis * exit_len
        total = exit_len + c["sleeve_len"]
        rings = []
        for k in range(SEG_L + 1):
            t = k / SEG_L
            cc = root + axis * (total * t)
            t_out = max(0.0, (total * t - exit_len) / c["sleeve_len"])
            r_in = smoothstep(0, exit_len, total * t)
            r_up = lerp(ru0, ru1, smoothstep(0, 1, t_out)) * lerp(0.5, 1.0, r_in)
            r_d = lerp(rd0, rd1, smoothstep(0, 1, t_out)) * lerp(0.5, 1.0, r_in)
            ring = []
            for a in range(SEG_A):
                phi = 2 * math.pi * a / SEG_A
                cu, cd = math.cos(phi), math.sin(phi)
                r_scale = 1 - 0.06 * max(0.0, -cu) + 0.006 * math.sin(5 * phi + 6 * t) * (1 - t) * c["folds"]
                l = total * t
                stitch = groove(l - (total - 0.020)) + groove(l - (total - 0.026))
                p = cc + up * (cu * r_up * r_scale) + depth_dir * (cd * r_d * r_scale)
                p += (p - cc).normalized() * stitch
                ring.append(bm.verts.new(p))
            rings.append(ring)
        for k in range(SEG_L):
            for a in range(SEG_A):
                b = (a + 1) % SEG_A
                q = [rings[k][a], rings[k][b], rings[k + 1][b], rings[k + 1][a]]
                if side < 0:
                    q.reverse()
                f = bm.faces.new(q)
                f.material_index = M_RIB if c["cuff_rib"] and total * (k + 0.5) / SEG_L > total - c["cuff_rib"] else M_WHITE
                for loop in f.loops:
                    lx, lh = loop.vert.co.x, loop.vert.co.z
                    loop[uv_layer].uv = (0.5 + lx / 2.0, lh / L)

    if c["collar"]:
        _add_collar(bm, uv_layer, c, top_height, neck_depth, to_blender, M_RIB)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0006)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if c["placket"] and c["placket"].get("buttons"):
        _add_buttons(bm, c, top_height, M_RIB)

    mesh = bpy.data.meshes.new(c["name"])
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(c["name"], mesh)
    scene.collection.objects.link(obj)
    for m in mats:
        mesh.materials.append(m)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    smooth = obj.modifiers.new("Glätten", "SMOOTH")
    smooth.factor = 0.5
    smooth.iterations = 3
    bpy.ops.object.modifier_apply(modifier="Glätten")
    sol = obj.modifiers.new("Stoffkante", "SOLIDIFY")
    sol.thickness = c["fabric"]
    sol.offset = -1
    sol.use_rim_only = True
    sol.use_even_offset = True
    bpy.ops.object.modifier_apply(modifier="Stoffkante")
    bpy.ops.object.shade_smooth()

    # Unbenutzte Materialien nicht exportieren
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
        render_views(scene, render_prefix, max(L, HW * 2 + 2 * c["sleeve_len"] * 0.6) * 1.35)


def _add_collar(bm, uv_layer, c, top_height, neck_depth, to_blender, mat):
    """Polokragen: Steg entlang des Halsausschnitts, darüber nach außen umgelegter Kragen.
    Vorne mittig offen (Knopfleiste)."""
    NW = c["neck_w"]
    stand, fall = c["collar"]["stand"], c["collar"]["fall"]
    gap = c["collar"].get("front_gap", 0.012)
    pts = []
    n = 28
    for i in range(n + 1):  # vorne von rechts nach links
        x = NW * (1 - 2 * i / n)
        if abs(x) < gap:
            continue
        pts.append((x, top_height(x, True), neck_depth(x, True)))
    for i in range(1, n):   # hinten von links nach rechts
        x = -NW * (1 - 2 * i / n)
        pts.append((x, top_height(x, False), -neck_depth(x, False)))
    # vorne mittig offen: Kette statt Ring
    start = next(i for i, p in enumerate(pts) if p[0] < 0)  # erster Punkt links der Mitte
    chain = pts[start:] + pts[:start]
    cy = sum(p[2] for p in pts) / len(pts)
    rows = []
    for (x, h, d) in chain:
        out = Vector((x, d - cy)).normalized() if (x, d - cy) != (0, 0) else Vector((0, 1))
        base = (x, h, d)
        top = (x, h + stand, d)
        fold = (x + out.x * 0.006, h + stand + 0.004, d + out.y * 0.006)
        tip = (x + out.x * fall * 0.70, h + stand - fall * 0.90, d + out.y * fall * 0.70)
        rows.append([bm.verts.new(to_blender(*p)) for p in (base, top, fold, tip)])
    for a, b in zip(rows, rows[1:]):
        for k in range(3):
            f = bm.faces.new([a[k], b[k], b[k + 1], a[k + 1]])
            f.material_index = mat
            for loop in f.loops:
                loop[uv_layer].uv = (0.99, 0.99)


def _add_buttons(bm, c, top_height, mat):
    """Knöpfe auf der Knopfleiste: kleine Scheiben, per Strahl auf die Vorderseite gesetzt."""
    from mathutils.bvhtree import BVHTree
    tree = BVHTree.FromBMesh(bm)
    pk = c["placket"]
    top = top_height(0, True)
    r = pk.get("button_r", 0.0055)
    for k in range(pk["buttons"]):
        h = top - 0.022 - k * (pk["length"] - 0.03) / max(1, pk["buttons"] - 1)
        hit = tree.ray_cast(Vector((0, -1.0, h)), Vector((0, 1, 0)))
        if hit[0] is None:
            continue
        p, nrm = hit[0], hit[1]
        if nrm.y > 0:
            nrm = -nrm
        ring_a, ring_b = [], []
        for a in range(12):
            phi = 2 * math.pi * a / 12
            off = Vector((math.cos(phi) * r, 0, math.sin(phi) * r))
            ring_a.append(bm.verts.new(p + off))
            ring_b.append(bm.verts.new(p + off + nrm * 0.0018))
        cap = bm.faces.new(ring_b[::-1])
        cap.material_index = mat
        for a in range(12):
            b = (a + 1) % 12
            f = bm.faces.new([ring_a[a], ring_a[b], ring_b[b], ring_b[a]])
            f.material_index = mat


def render_views(scene, prefix, ortho):
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = ortho
    world = bpy.data.worlds.new("w")
    world.color = (0.6, 0.6, 0.63)
    scene.world = world
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_cavity = True
    scene.display.shading.cavity_type = "BOTH"
    scene.render.resolution_x = 640
    scene.render.resolution_y = 700
    for name, yaw, pitch in (("front", 0, 0), ("angle", 35, 10), ("side", 90, 0), ("back", 180, 0), ("top", 0, 70)):
        a, p = math.radians(yaw), math.radians(pitch)
        cam.location = (2.2 * math.sin(a) * math.cos(p), -2.2 * math.cos(a) * math.cos(p), 2.2 * math.sin(p))
        cam.rotation_euler = (math.radians(90) - p, 0, a)
        scene.render.filepath = f"{prefix}-{name}.png"
        bpy.ops.render.render(write_still=True)
