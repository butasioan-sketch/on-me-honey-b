"""Eigenes Modell SKU 001: Unisex-T-Shirt auf Basis James & Nicholson JN827
(white/carbon: Kontraststreifen auf den Schultern, Seiteneinsätze carbon).

blender -b --python blender/001/build_001.py -- public/models/sku/001-v1.glb [quelle.blend] [render-prefix]

Aufbau: Vorder- und Rückenteil als eigene Stoffbahnen (Superellipsen-Profil),
die an Seiten- und Schulternaht zusammenlaufen; Rundhals vorne tiefer als
hinten; eingesetzte Ärmel; Doppelsteppnaht an Saum und Ärmel; Faltenwurf.

Maße: Schätzwerte Größe M. Für JN827 liegt keine Maßtabelle vor. Die Werte
folgen der alten B&C-Tabelle (M: 53 cm halbe Brustweite, 72 cm Länge) und
müssen am physischen Rohling nachgemessen werden.
Referenz: public/product-refs/jn827-tee-1024x1536.png
Achsen im Export: Meter, Y oben, Vorderseite +Z, Ursprung Bounding-Box-Mitte.
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
output = Path(args[0]).resolve()
blend_out = Path(args[1]).resolve() if len(args) > 1 and args[1] else None
render_prefix = args[2] if len(args) > 2 else None
output.parent.mkdir(parents=True, exist_ok=True)

# --- Maße (Meter, Größe M, Schätzwerte) -----------------------------------
LENGTH = 0.72        # hoher Schulterpunkt bis Saum
HALF_W = 0.265       # halbe Brustweite (53 cm)
WAIST_W = 0.256
SHOULDER_X = 0.226   # halbe Schulterbreite
ARMPIT_H = 0.50      # Höhe Achsel über Saum
NECK_W = 0.086       # halbe Halsausschnittbreite
FRONT_DROP = 0.085   # vordere Halsausschnitttiefe
BACK_DROP = 0.022
NECK_D_FRONT = 0.070
NECK_D_BACK = 0.060
BODY_D = 0.150       # halbe Rumpftiefe inkl. Bewegungszugabe
SLEEVE_LEN = 0.185
SLEEVE_ANGLE = math.radians(38)
FABRIC = 0.0022

NU, NV = 44, 62      # Raster je Stoffbahn
BAND_ROWS = 4        # eigene Rasterzeilen für Schulterstreifen/Ripp: Kanten folgen einer Gitterlinie
P_SE = 2.7           # Superellipsen-Exponent (eckiger als Ellipse)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"


def material(name, rgb, rough=0.82, sheen=0.25):
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


WHITE = material("Polyester weiß", (0.92, 0.92, 0.92))
CARBON = material("Kontrasteinsatz carbon", (0.05, 0.052, 0.056), rough=0.72)
RIB = material("Rippbündchen weiß", (0.89, 0.89, 0.89), rough=0.92)
M_WHITE, M_CARBON, M_RIB = 0, 1, 2


def smoothstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def body_width(v):
    h = v * LENGTH
    if h <= ARMPIT_H:
        # leichte Taille, gerader Saum
        t = h / ARMPIT_H
        return lerp(HALF_W, WAIST_W, math.sin(math.pi * t) * 0.9) if t < 0.5 else lerp(WAIST_W, HALF_W, (t - 0.5) * 2) * 1.0
    t = (h - ARMPIT_H) / (LENGTH - ARMPIT_H)
    return lerp(HALF_W, SHOULDER_X, smoothstep(0, 1, t))


def top_height(x, front):
    ax = abs(x)
    if ax >= NECK_W:
        slope = 0.046 / (SHOULDER_X - NECK_W)
        return LENGTH - slope * (ax - NECK_W)
    drop = FRONT_DROP if front else BACK_DROP
    return LENGTH - drop * math.sqrt(max(0.0, 1 - (ax / NECK_W) ** 2))


def neck_depth(x, front):
    ax = abs(x)
    if ax >= NECK_W:
        return 0.0
    d = NECK_D_FRONT if front else NECK_D_BACK
    return d * math.sqrt(max(0.0, 1 - (ax / NECK_W) ** 2))


BAND = 0.040  # oberes Band, gleich hoch vorne/hinten, damit die Seitennaht schließt


def band_height(x, front):
    """4 Zeilen à 1 cm: Rücken 4 cm Carbon, vorne 1 cm Carbon, Hals 2 cm Ripp."""
    return BAND


def superellipse(u):
    return max(0.0, 1 - abs(u) ** P_SE) ** (1 / P_SE)


def folds(x, h, front):
    """Faltenwurf: weiche Querfalten unter den Armen, Längswellen am Saum."""
    s = 1 if front else -1
    under_arm = math.exp(-(((h - 0.43) / 0.07) ** 2)) * smoothstep(0.12, 0.24, abs(x))
    diag = 0.004 * under_arm * math.sin(38 * h + 9 * abs(x) * s)
    hem = 0.0028 * math.exp(-((h / 0.09) ** 2)) * math.sin(23 * x + 1.3 * s)
    drape = 0.0018 * math.sin(11 * x + 7 * h + s) * (1 - smoothstep(0.45, 0.65, h))
    return diag + hem + drape


def hem_stitch(h, base):
    """Doppelsteppnaht 2,0 / 2,6 cm über der Kante: leichte Rillen."""
    d = 0.0
    for line in (base + 0.020, base + 0.026):
        d -= 0.0007 * math.exp(-(((h - line) / 0.0012) ** 2))
    return d


def to_blender(x, h, d):
    # Modellkoordinaten (x, Höhe, Tiefe nach vorne) -> Blender (Z oben, -Y vorne)
    return Vector((x, -d, h))


bm = bmesh.new()
uv_layer = bm.loops.layers.uv.new("UVMap")
grids = {}

# --- Rumpf: zwei Stoffbahnen ----------------------------------------------
for front in (True, False):
    sign = 1 if front else -1
    rows = []
    lower = NV - BAND_ROWS
    for j in range(NV + 1):
        v_guess = j / NV
        row = []
        for i in range(NU + 1):
            u = -1 + 2 * i / NU
            w = body_width(v_guess)
            x = u * w
            top = top_height(x, front)
            band = band_height(x, front)
            if j <= lower:
                h = (j / lower) * (top - band)
            else:
                h = top - band + band * (j - lower) / BAND_ROWS
            v = h / top
            # Schulter rundet erst kurz vor der Naht über (senkrechte Tangente an der Naht)
            blend = smoothstep(0.84, 1.0, v)
            d_body = BODY_D * superellipse(u) * (1 - 0.12 * smoothstep(0.7, 1.0, v))
            d = d_body * math.sqrt(max(0.0, 1 - blend)) + neck_depth(x, front) * blend
            seam_fade = superellipse(u) * (1 - blend)  # Nähte bleiben geschlossen
            # Rippbündchen: 1,8 cm breite, leicht aufliegende Wulst am Halsausschnitt
            if abs(x) < NECK_W * 1.05:
                below = top_height(x, front) - h
                d += 0.0025 * math.exp(-(((below - 0.009) / 0.006) ** 2)) * (1 - (abs(x) / (NECK_W * 1.05)) ** 4)
            d += folds(x, h, front) * seam_fade
            d += hem_stitch(h, 0.0) * seam_fade
            row.append(bm.verts.new(to_blender(x, h, sign * d)))
        rows.append(row)
    grids[front] = rows

    for j in range(NV):
        for i in range(NU):
            q = [rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]]
            if not front:
                q.reverse()
            f = bm.faces.new(q)
            c = sum((vv.co for vv in q), Vector()) / 4
            x, h = c.x, c.z
            u_c = -1 + 2 * (i + 0.5) / NU
            v_c = (j + 0.5) / NV
            mat = M_WHITE
            # Seiteneinsatz carbon: Achsel bis Saum, entlang der Seitennaht
            if h < ARMPIT_H + 0.01 and abs(u_c) > 0.84:
                mat = M_CARBON
            # Oberes Band (eigene Rasterzeilen): Ripp am Hals, sonst Carbon-Schulterstreifen
            if j >= lower:
                band_row = j - lower  # 0 unten … BAND_ROWS-1 an der Naht
                if abs(x) < NECK_W * 1.12:
                    if band_row >= BAND_ROWS - 2:
                        mat = M_RIB
                elif front:
                    if band_row == BAND_ROWS - 1:
                        mat = M_CARBON
                else:
                    mat = M_CARBON
            f.material_index = mat
            for loop in f.loops:
                lx, lh = loop.vert.co.x, loop.vert.co.z
                loop[uv_layer].uv = ((lx / 0.62 + 0.5) * 0.5 + (0.0 if front else 0.5), lh / LENGTH)

# --- Ärmel: eingesetzte Röhren ---------------------------------------------
SEG_A, SEG_L = 36, 22
for side in (-1, 1):
    # Ärmeloberkante läuft durch den Schulterpunkt (SHOULDER_X, Schulterhöhe)
    sh_h = top_height(SHOULDER_X, True)
    c_sh = sh_h - 0.098 * math.cos(SLEEVE_ANGLE)
    root_x = SHOULDER_X - 0.07
    root = Vector((side * root_x, 0.0, c_sh + 0.07 * math.tan(SLEEVE_ANGLE)))
    axis = Vector((side * math.cos(SLEEVE_ANGLE), 0.0, -math.sin(SLEEVE_ANGLE)))
    up = Vector((side * math.sin(SLEEVE_ANGLE), 0.0, math.cos(SLEEVE_ANGLE)))
    depth_dir = Vector((0.0, 1.0, 0.0))
    exit_len = 0.07 / math.cos(SLEEVE_ANGLE)  # Strecke im Rumpf
    total = exit_len + SLEEVE_LEN
    rings = []
    for k in range(SEG_L + 1):
        t = k / SEG_L
        c = root + axis * (total * t)
        # weites Armloch, zur Ärmelöffnung hin schmaler
        t_out = max(0.0, (total * t - exit_len) / SLEEVE_LEN)  # 0 am Armloch, 1 an der Öffnung
        r_in = smoothstep(0, exit_len, total * t)               # im Rumpf schmal, damit nichts heraussticht
        r_up = lerp(0.098, 0.074, smoothstep(0, 1, t_out)) * lerp(0.5, 1.0, r_in)
        r_d = lerp(0.088, 0.062, smoothstep(0, 1, t_out)) * lerp(0.5, 1.0, r_in)
        ring = []
        for a in range(SEG_A):
            phi = 2 * math.pi * a / SEG_A
            cu, cd = math.cos(phi), math.sin(phi)
            # leicht abgeflachte Unterseite, Falten zur Achsel hin
            r_scale = 1 - 0.06 * max(0.0, -cu) + 0.006 * math.sin(5 * phi + 6 * t) * (1 - t)
            l = total * t
            stitch = 0.0
            for line in (total - 0.020, total - 0.026):
                stitch -= 0.0007 * math.exp(-(((l - line) / 0.0012) ** 2))
            p = c + up * (cu * r_up * r_scale) + depth_dir * (cd * r_d * r_scale)
            p += (p - c).normalized() * stitch
            ring.append(bm.verts.new(p))
        rings.append(ring)
    for k in range(SEG_L):
        for a in range(SEG_A):
            b = (a + 1) % SEG_A
            q = [rings[k][a], rings[k][b], rings[k + 1][b], rings[k + 1][a]]
            if side < 0:
                q.reverse()
            f = bm.faces.new(q)
            f.material_index = M_WHITE
            for loop in f.loops:
                lx, lh = loop.vert.co.x, loop.vert.co.z
                loop[uv_layer].uv = (0.5 + side * 0.0 + (lx / 2.0), lh / LENGTH)

# Nähte schließen: Vorder- und Rückenteil teilen Seiten- und Schulterkanten
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0006)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

mesh = bpy.data.meshes.new("Tee001")
bm.to_mesh(mesh)
bm.free()
obj = bpy.data.objects.new("Tee001", mesh)
scene.collection.objects.link(obj)
for m in (WHITE, CARBON, RIB):
    mesh.materials.append(m)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Dezente Glättung gegen Rasterkanten (Nähte bleiben verbunden)
smooth = obj.modifiers.new("Glätten", "SMOOTH")
smooth.factor = 0.5
smooth.iterations = 3
bpy.ops.object.modifier_apply(modifier="Glätten")

# Stoffkante an den Öffnungen (nur Rand, keine verdoppelte Innenhaut)
sol = obj.modifiers.new("Stoffkante", "SOLIDIFY")
sol.thickness = FABRIC
sol.offset = -1
sol.use_rim_only = True
sol.use_even_offset = True
bpy.ops.object.modifier_apply(modifier="Stoffkante")
bpy.ops.object.shade_smooth()
if hasattr(mesh, "use_auto_smooth"):
    mesh.use_auto_smooth = True
    mesh.auto_smooth_angle = math.radians(60)

bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
obj.location = (0, 0, 0)

if blend_out:
    blend_out.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_out))

bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    export_draco_mesh_compression_enable=False,
    export_apply=True,
    export_yup=True,
)
print("EXPORT", output)

if render_prefix:
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 1.0
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
        scene.render.filepath = f"{render_prefix}-{name}.png"
        bpy.ops.render.render(write_still=True)
