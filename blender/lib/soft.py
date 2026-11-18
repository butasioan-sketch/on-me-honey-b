"""Reproduzierbar nur mit einem Thread bauen: blender -b -t 1 … (sonst schwanken Normalen-Bytes).

Generator für Weichware: Socken, Bänder, Tücher, Schals, Handtücher, Tischwäsche.
Bausteine: tube (Röhre mit Profil), ring (flaches Band), sheet (Stoffbahn mit
Faltenwurf), folded (gefalteter Stapel), triangle (gefaltetes Dreieckstuch), sock.

Export: Meter, Y oben, Vorderseite +Z, Ursprung Bounds-Mitte, kein Draco,
UV planar über die Vorderansicht (Druckfläche).
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tee import _material, lerp, render_views, smoothstep  # noqa: E402


class Builder:
    def __init__(self, name, colors):
        args = sys.argv[sys.argv.index("--") + 1:]
        self.output = Path(args[0]).resolve()
        self.blend_out = Path(args[1]).resolve() if len(args) > 1 and args[1] else None
        self.render_prefix = args[2] if len(args) > 2 else None
        self.output.parent.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.read_factory_settings(use_empty=True)
        self.scene = bpy.context.scene
        self.scene.unit_settings.system = "METRIC"
        self.name = name
        self.mats = [_material(n, rgb, rough=r) for n, rgb, r in colors]
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new("UVMap")

    # Koordinaten: (x, Höhe, Tiefe nach vorne) -> Blender (x, -Tiefe, Höhe)
    @staticmethod
    def V(x, h, d):
        return Vector((x, -d, h))

    def quad_grid(self, pts, mat_fn=None, closed_u=False):
        """pts[j][i] Blender-Vektoren; erzeugt Flächen, Material je Zelle über mat_fn(i, j)."""
        rows = [[self.bm.verts.new(p) for p in row] for row in pts]
        nu = len(rows[0])
        for j in range(len(rows) - 1):
            for i in range(nu if closed_u else nu - 1):
                i2 = (i + 1) % nu
                f = self.bm.faces.new([rows[j][i], rows[j][i2], rows[j + 1][i2], rows[j + 1][i]])
                f.material_index = mat_fn(i, j) if mat_fn else 0
        return rows

    def finish(self, thickness=0.0015, rim_only=True, ortho=None, smooth=True):
        bm = self.bm
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0003)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        # UV planar Vorderansicht
        xs = [v.co.x for v in bm.verts]
        zs = [v.co.z for v in bm.verts]
        x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
        sx, sz = max(x1 - x0, 1e-6), max(z1 - z0, 1e-6)
        for f in bm.faces:
            back = f.normal.y > 0.3
            for loop in f.loops:
                u = (loop.vert.co.x - x0) / sx
                loop[self.uv].uv = (u * 0.5 + (0.5 if back else 0.0), (loop.vert.co.z - z0) / sz)
        mesh = bpy.data.meshes.new(self.name)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(self.name, mesh)
        self.scene.collection.objects.link(obj)
        for m in self.mats:
            mesh.materials.append(m)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        if thickness:
            sol = obj.modifiers.new("Stoff", "SOLIDIFY")
            sol.thickness = thickness
            sol.offset = -1
            sol.use_rim_only = rim_only
            sol.use_even_offset = True
            bpy.ops.object.modifier_apply(modifier="Stoff")
        if smooth:
            bpy.ops.object.shade_smooth()
        used = {p.material_index for p in mesh.polygons}
        for idx in sorted(set(range(len(mesh.materials))) - used, reverse=True):
            mesh.materials.pop(index=idx)
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
        obj.location = (0, 0, 0)
        dims = obj.dimensions
        if self.blend_out:
            self.blend_out.parent.mkdir(parents=True, exist_ok=True)
            bpy.ops.wm.save_as_mainfile(filepath=str(self.blend_out))
        bpy.ops.export_scene.gltf(filepath=str(self.output), export_format="GLB",
                                  export_draco_mesh_compression_enable=False,
                                  export_apply=True, export_yup=True)
        print("EXPORT", self.output)
        if self.render_prefix:
            render_views(self.scene, self.render_prefix, ortho or max(dims) * 1.35)

    # ------------------------------------------------------------------ Bausteine
    def tube(self, profile, seg=36, center=(0, 0, 0), axis="y", mat_fn=None, wobble=0.0, closed_bottom=False):
        """profile: Liste (pos_entlang_achse, radius_x, radius_tiefe). Achse y = senkrecht."""
        cx, ch, cd = center
        pts = []
        for (t, rx, rz) in profile:
            row = []
            for a in range(seg):
                phi = 2 * math.pi * a / seg
                w = 1 + wobble * math.sin(5 * phi + 7 * t)
                if axis == "y":
                    row.append(self.V(cx + rx * w * math.cos(phi), ch + t, cd + rz * w * math.sin(phi)))
                else:  # Achse x
                    row.append(self.V(cx + t, ch + rx * w * math.cos(phi), cd + rz * w * math.sin(phi)))
            pts.append(row)
        rows = self.quad_grid(pts, mat_fn, closed_u=True)
        if closed_bottom:
            f = self.bm.faces.new(rows[0][::-1])
            f.material_index = mat_fn(0, 0) if mat_fn else 0
        return rows

    def sheet(self, w, h, nu=40, nv=40, origin=(0, 0, 0), drape=0.0, fold_lines=(), sag=0.0,
              mat_fn=None, transform=None, seed=1.0):
        """Rechteckige Stoffbahn in der x-h-Ebene (Tiefe = Faltenwurf)."""
        ox, oh, od = origin
        pts = []
        for j in range(nv + 1):
            row = []
            for i in range(nu + 1):
                u, v = i / nu, j / nv
                x, hh = (u - 0.5) * w, v * h
                d = drape * (0.6 * math.sin(7.3 * u * seed + 2.1 * v) * math.sin(3.1 * v + seed) + 0.4 * math.sin(13 * u + 9 * v * seed))
                d += sag * math.sin(math.pi * u) * math.sin(math.pi * v)
                for (pos, depth, width, vertical) in fold_lines:
                    dist = (u - pos) if vertical else (v - pos)
                    d += depth * math.exp(-((dist / width) ** 2))
                p = Vector((x, d, hh))
                if transform:
                    p = transform(p, u, v)
                row.append(self.V(ox + p.x, oh + p.z, od + p.y))
            pts.append(row)
        return self.quad_grid(pts, mat_fn)

    def folded(self, w, d_depth, layers, layer_h, origin=(0, 0, 0), mat=0, bulge=0.004, nu=24, nv=16):
        """Gefalteter Stapel (Draufsicht w × d_depth), Lagen mit runden Faltkanten vorne."""
        ox, oh, od = origin
        for k in range(layers):
            h0 = oh + k * layer_h
            pts = []
            for j in range(nv + 1):
                row = []
                for i in range(nu + 1):
                    u, v = i / nu, j / nv
                    x = ox + (u - 0.5) * w
                    dd = od + (v - 0.5) * d_depth
                    hh = h0 + layer_h + bulge * math.sin(math.pi * u) * math.sin(math.pi * v) + 0.0015 * math.sin(9 * u + 5 * v + k)
                    row.append(self.V(x, hh, dd))
                pts.append(row)
            self.quad_grid(pts, lambda i, j: mat)
            # runde Faltkante, abwechselnd vorne und hinten (wie echt gefaltete Wäsche)
            side = 1 if k % 2 == 0 else -1
            pts = []
            for a in range(9):
                ang = math.pi * a / 8
                row = []
                for i in range(nu + 1):
                    u = i / nu
                    x = ox + (u - 0.5) * w
                    r = layer_h / 2
                    row.append(self.V(x, h0 + r - r * math.cos(ang), od + side * (d_depth / 2 + r * math.sin(ang))))
                pts.append(row)
            self.quad_grid(pts, lambda i, j: mat)

    def sock(self, leg_len, foot_len, r_leg, r_ankle, r_foot, cuff, mat_body=0, mat_rib=1, mat_heel=0, seg=32):
        """Socke: Schaft senkrecht, Ferse als Bogen, Fuß nach vorne, runde Spitze."""
        pts = []
        heel_r = r_ankle * 1.25
        n_leg, n_heel, n_foot, n_toe = 20, 10, 18, 8
        frames = []
        for k in range(n_leg + 1):           # Schaft von oben nach unten
            t = k / n_leg
            h = heel_r + leg_len * (1 - t)
            frames.append((Vector((0, 0, h)), Vector((0, 0, -1)), lerp(r_leg, r_ankle, smoothstep(0.3, 1, t)), "leg" if h < heel_r + leg_len - cuff else "rib"))
        for k in range(1, n_heel + 1):       # Fersenbogen 90°
            ang = (math.pi / 2) * k / n_heel
            c = Vector((0, heel_r - heel_r * math.cos(ang) * 0, 0))
            p = Vector((0, heel_r * (1 - math.cos(ang)) * -1, heel_r - heel_r * math.sin(ang) + heel_r * 0.0))
            p = Vector((0, -heel_r * (1 - math.cos(ang)), heel_r * (1 - math.sin(ang))))
            tang = Vector((0, -math.sin(ang), -math.cos(ang))).normalized()
            frames.append((p, tang, lerp(r_ankle, r_foot, k / n_heel), "heel"))
        last = frames[-1][0]
        for k in range(1, n_foot + 1):       # Fuß nach vorne (-y Blender = vorne)
            t = k / n_foot
            frames.append((last + Vector((0, -foot_len * t, 0)), Vector((0, -1, 0)), r_foot, "foot"))
        tip = frames[-1][0]
        for k in range(1, n_toe + 1):        # runde Spitze
            ang = (math.pi / 2) * k / n_toe
            frames.append((tip + Vector((0, -r_foot * math.sin(ang), 0)), Vector((0, -1, 0)), r_foot * math.cos(ang) + 1e-4, "toe"))
        for (p, tang, r, zone) in frames:
            ref = Vector((1, 0, 0))
            side = tang.cross(ref).normalized()
            row = []
            for a in range(seg):
                phi = 2 * math.pi * a / seg
                flat = 0.72 if zone in ("foot", "toe") else 1.0   # Fuß flacher
                off = ref * math.cos(phi) * r + side * math.sin(phi) * r * flat
                row.append(p + off)
            pts.append(row)
        zones = [z for (_, _, _, z) in frames]

        def mat_fn(i, j):
            return mat_rib if zones[j] == "rib" else (mat_heel if zones[j] in ("heel", "toe") else mat_body)
        self.quad_grid(pts, mat_fn, closed_u=True)


# ---------------------------------------------------------------- Taschen-Bausteine
def se_ring(w, d, p=3.0, n=48, h=0.0, cx=0.0, cd=0.0):
    """Superellipsen-Querschnitt (halbe Breite w, halbe Tiefe d) in Höhe h, als (x, h, d)-Tupel."""
    pts = []
    for a in range(n):
        phi = 2 * math.pi * a / n
        co, si = math.cos(phi), math.sin(phi)
        r = (abs(co) ** p + abs(si) ** p) ** (-1 / p) if p != 2 else 1.0
        pts.append((cx + w * r * co, h, cd + d * r * si))
    return pts


def _loft(b, rings, mat_fn=None, cap_bottom=True, cap_top=False, cap_mat=None):
    """rings: Liste geschlossener Ringe aus (x, h, d); gleiche Punktzahl je Ring."""
    pts = [[b.V(*p) for p in ring] for ring in rings]
    rows = b.quad_grid(pts, mat_fn, closed_u=True)
    if cap_bottom:
        f = b.bm.faces.new(rows[0][::-1])
        f.material_index = cap_mat if cap_mat is not None else (mat_fn(0, 0) if mat_fn else 0)
    if cap_top:
        f = b.bm.faces.new(rows[-1])
        f.material_index = cap_mat if cap_mat is not None else 0
    return rows


def path_tube(b, path, r, seg=10, mat=0, flat=1.0):
    """Röhre entlang eines Pfads (Liste (x, h, d)), z. B. Griffe, Kordeln. flat < 1 = Gurtband."""
    vs = [Vector((x, h, d)) for (x, h, d) in path]
    rings = []
    for k, p in enumerate(vs):
        t = (vs[min(k + 1, len(vs) - 1)] - vs[max(k - 1, 0)]).normalized()
        ref = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))
        n1 = t.cross(ref).normalized()
        n2 = t.cross(n1).normalized()
        ring = []
        for a in range(seg):
            phi = 2 * math.pi * a / seg
            q = p + n1 * math.cos(phi) * r + n2 * math.sin(phi) * r * flat
            ring.append(b.V(q.x, q.y, q.z))
        rings.append(ring)
    rows = b.quad_grid(rings, lambda i, j: mat, closed_u=True)
    for end, rev in ((rows[0], True), (rows[-1], False)):
        f = b.bm.faces.new(end[::-1] if rev else end)
        f.material_index = mat


def arc(p0, p1, height, n=16, bulge_d=0.0):
    """Bogen von p0 nach p1 mit Scheitelhöhe height über der Verbindungslinie."""
    out = []
    for k in range(n + 1):
        t = k / n
        x = lerp(p0[0], p1[0], t)
        h = lerp(p0[1], p1[1], t) + height * math.sin(math.pi * t)
        d = lerp(p0[2], p1[2], t) + bulge_d * math.sin(math.pi * t)
        out.append((x, h, d))
    return out


def pouch(b, w, h, d, top_d=0.004, p=3.0, rows=16, n=48, mat=0, zip_mat=None, bulge=0.0, w_top=None, cap_top=True):
    """Weiche Tasche: Breite w, Höhe h, Tiefe d unten, oben auf top_d zusammenlaufend (Reißverschluss)."""
    rings = []
    w_top = w if w_top is None else w_top
    for j in range(rows + 1):
        t = j / rows
        ww = lerp(w, w_top, t) / 2
        dd = lerp(d / 2, top_d / 2, smoothstep(0.0, 1.0, t) ** 0.8) + bulge * math.sin(math.pi * t)
        rings.append(se_ring(ww, dd, p, n, t * h))
    zr = rows - 1

    def mf(i, j):
        return zip_mat if (zip_mat is not None and j >= zr) else mat
    return _loft(b, rings, mf, cap_bottom=True, cap_top=cap_top, cap_mat=zip_mat if zip_mat is not None else mat)


def slab(b, w, h, t, r=0.01, n_corner=6, mat=0, edge_mat=None, h0=0.0, d0=0.0, bulge=0.0):
    """Abgerundete Platte (w × h, Stärke t) stehend in der x-h-Ebene, Vorderseite +Tiefe."""
    outline = []
    for cx, ch, a0 in ((w / 2 - r, h - r, 0), (-w / 2 + r, h - r, 90), (-w / 2 + r, r, 180), (w / 2 - r, r, 270)):
        for k in range(n_corner + 1):
            ang = math.radians(a0 + 90 * k / n_corner)
            outline.append((cx + r * math.cos(ang), ch + r * math.sin(ang)))
    front = [b.bm.verts.new(b.V(x, h0 + hh, d0 + t / 2)) for x, hh in outline]
    back = [b.bm.verts.new(b.V(x, h0 + hh, d0 - t / 2)) for x, hh in outline]
    ff = b.bm.faces.new(front)
    ff.material_index = mat
    fb = b.bm.faces.new(back[::-1])
    fb.material_index = mat
    m = len(outline)
    for i in range(m):
        j = (i + 1) % m
        f = b.bm.faces.new([front[i], back[i], back[j], front[j]])
        f.material_index = edge_mat if edge_mat is not None else mat
    if bulge:
        for v in front:
            pass
