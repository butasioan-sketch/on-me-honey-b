import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, initDb, trackAnalyticsEvent } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    await trackAnalyticsEvent({
      type: body.type || "pageview",
      page: body.page,
      productId: body.productId,
      locale: body.locale,
      value: body.value,
    });
    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false }, { status: 500 });
  }
}

function checkAdminAuth(request: NextRequest): boolean {
  return isAdminRequest(request);
}

export async function GET(request: NextRequest) {
  // SECURITY: Analytics data is admin-only
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Analytics nicht verfügbar" },
      { status: 500 },
    );
  }
}
