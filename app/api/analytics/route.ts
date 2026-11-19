import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, initDb, trackAnalyticsEvent } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const EVENT_TYPES = ["pageview", "add_to_cart", "checkout_started", "purchase", "design_upload", "view_item"];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(`an:${clientIp(request)}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ tracked: false }, { status: 429 });
  try {
    await initDb();
    const body = await request.json().catch(() => ({}));
    const type = EVENT_TYPES.includes(body.type) ? body.type : "pageview";
    await trackAnalyticsEvent({
      type,
      page: str(body.page, 200),
      productId: str(body.productId, 20),
      locale: ["de", "ro", "en"].includes(body.locale) ? body.locale : undefined,
      value: typeof body.value === "number" && Number.isFinite(body.value) ? body.value : undefined,
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
