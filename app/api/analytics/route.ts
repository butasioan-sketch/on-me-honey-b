import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, initDb, trackAnalyticsEvent } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    await trackAnalyticsEvent({
      type: body.type || 'pageview',
      page: body.page,
      productId: body.productId,
      locale: body.locale,
      value: body.value,
    });
    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false });
  }
}

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return false;

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [, password] = decoded.split(':');

  const adminPassword = process.env.ADMIN_PASSWORD;

  return password === adminPassword;
}

export async function GET(request: NextRequest) {
  // SECURITY: Analytics data is admin-only
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ total: 0, last24h: 0, byType: {}, byLocale: {}, byProduct: {}, recent: [] });
  }
}