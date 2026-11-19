import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

// Admin-Lesezugriff auf Motive (auch bezahlte/eingefrorene). Geschützt durch proxy.ts (/admin/*)
// und zusätzlich hier geprüft. Öffentlich liefert /api/designs nur unbezahlte Motive.
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'no id' }, { status: 400 });
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return NextResponse.json({ error: 'no db' }, { status: 500 });
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    const rows = (await sql.query(
      'SELECT id, product_id, front_image, back_image, front_preview, back_preview, frozen_at FROM designs WHERE id=$1',
      [id],
    )) as Record<string, unknown>[];
    if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ design: rows[0] }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[admin design] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
