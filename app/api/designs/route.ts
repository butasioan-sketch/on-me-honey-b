import { NextRequest, NextResponse } from "next/server";
import { PRINT_SPEC, GARMENT_PROFILES } from "@/lib/print-spec";
import { isPrintReadyDataUrl } from "@/lib/print-export";
import { initDb } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { randomUUID } from "node:crypto";

async function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  const { neon } = await import("@neondatabase/serverless");
  return neon(url);
}

// Schema-Migration (neue Spalten wie front_preview/back_preview) darf nicht davon
// abhaengen, dass zufaellig zuerst eine andere Route (z.B. /api/orders) aufgerufen wurde.
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

interface RawTransform {
  scale?: unknown;
  x?: unknown;
  y?: unknown;
}

/** Validiert + clamped ein Transform-Objekt aus dem Client. Gibt null zurück wenn nicht vorhanden/unbrauchbar. */
function sanitizeTransform(
  raw: unknown,
): { scale: number; x: number; y: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as RawTransform;
  const scale = Number(t.scale);
  const x = Number(t.x);
  const y = Number(t.y);
  if (!Number.isFinite(scale) || !Number.isFinite(x) || !Number.isFinite(y))
    return null;
  const limit = PRINT_SPEC.maxOffsetPercent;
  return {
    scale: Math.max(PRINT_SPEC.scaleMin, Math.min(PRINT_SPEC.scaleMax, scale)),
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}

const DATAURL_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
const MAX_DATAURL = 3_600_000; // Zeichen je Bild (A4 300 dpi JPEG liegt bei ca. 2,6 MB)
const MAX_JSON = 20_000; // Zeichen für meta/zonesData
const okImage = (s: unknown): s is string =>
  typeof s === "string" &&
  s.length <= MAX_DATAURL &&
  isPrintReadyDataUrl(s) &&
  DATAURL_RE.test(s);

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(`design:${clientIp(request)}`, 20, 600_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Zu viele Anfragen" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }
  try {
    await ensureInit();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    }
    const sql = await getSql();
    if (!sql) return NextResponse.json({ error: "no db" }, { status: 500 });

    const front = body.front || null;
    const back = body.back || null;
    if (!front && !back) {
      return NextResponse.json(
        { error: "Weder front noch back übergeben" },
        { status: 400 },
      );
    }
    if (front && !okImage(front)) {
      return NextResponse.json(
        { error: "front ist kein druckfertiges Bild" },
        { status: 400 },
      );
    }
    if (back && !okImage(back)) {
      return NextResponse.json(
        { error: "back ist kein druckfertiges Bild" },
        { status: 400 },
      );
    }

    // DTF braucht ein transparentes Druckblatt (PNG). Ein JPEG hätte einen weißen Hintergrund,
    // der als Weißtinte mitgedruckt würde. Das Verfahren bestimmt der Server, nicht der Client.
    const profile =
      typeof body.productId === "string"
        ? GARMENT_PROFILES[body.productId]
        : undefined;
    const printMethod = profile?.method ?? PRINT_SPEC.method;
    if (printMethod === "dtf") {
      for (const [name, img] of [
        ["front", front],
        ["back", back],
      ] as const) {
        if (img && !img.startsWith("data:image/png")) {
          return NextResponse.json(
            {
              error: `${name}: DTF braucht ein PNG mit transparentem Hintergrund`,
            },
            { status: 400 },
          );
        }
      }
    }

    const frontTransform = sanitizeTransform(body.frontTransform);
    const backTransform = sanitizeTransform(body.backTransform);
    const rawMeta =
      body.meta &&
      typeof body.meta === "object" &&
      JSON.stringify(body.meta).length <= MAX_JSON
        ? body.meta
        : null;
    const meta = rawMeta ? { ...rawMeta, method: printMethod } : null;
    // Kundenblick-Preview ist ein Reklamations-Beweis, kein Kernfeature — bei Problemen
    // (fehlt/kaputt) einfach weglassen statt den ganzen Design-Save abzulehnen.
    const frontPreview = okImage(body.frontPreview) ? body.frontPreview : null;
    const backPreview = okImage(body.backPreview) ? body.backPreview : null;
    // Multi-Zone Support: zonesData enthält alle Druckzonen mit ihren Designs
    const zonesJson =
      body.zonesData && typeof body.zonesData === "object"
        ? JSON.stringify(body.zonesData)
        : null;
    const zonesData =
      zonesJson && zonesJson.length <= MAX_JSON ? zonesJson : null;

    const id = `DSGN-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    await sql.query(
      `INSERT INTO designs (id, front_image, back_image, product_id, front_transform, back_transform, meta, front_preview, back_preview, zones_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        front,
        back,
        body.productId || null,
        frontTransform ? JSON.stringify(frontTransform) : null,
        backTransform ? JSON.stringify(backTransform) : null,
        meta ? JSON.stringify(meta) : null,
        frontPreview,
        backPreview,
        zonesData,
      ],
    );
    return NextResponse.json({ id, success: true });
  } catch (err: unknown) {
    console.error(
      "[designs POST] Fehler:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInit();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "no id" }, { status: 400 });
    const sql = await getSql();
    if (!sql) return NextResponse.json({ error: "no db" }, { status: 500 });
    // Öffentlich nur Motive, die noch nicht bezahlt/eingefroren sind (Warenkorb-Vorschau),
    // und nur die Bildspalten. Bezahlte Designs liest der Admin über /admin/api/design.
    const rows = (await sql.query(
      `SELECT id, product_id, front_image, back_image, front_preview, back_preview
         FROM designs WHERE id=$1 AND frozen_at IS NULL`,
      [id],
    )) as Record<string, unknown>[];
    if (!rows.length)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ design: rows[0] });
  } catch (err: unknown) {
    console.error(
      "[designs GET] Fehler:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
