import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { emailFrom } from "@/lib/email-from";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://on-me-honey-b.vercel.app";
  const start = Date.now();
  const [home, database] = await Promise.allSettled([
    fetch(siteUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    }),
    initDb(),
  ]);
  const homeStatus = home.status === "fulfilled" ? home.value.status : null;
  const dbOk = database.status === "fulfilled" && database.value;
  const ok = homeStatus === 200 && dbOk;
  const report = {
    ok,
    home: homeStatus,
    database: dbOk,
    ms: Date.now() - start,
  };

  if (!ok) await sendAlert(siteUrl, report);

  return NextResponse.json(report, {
    status: ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

async function sendAlert(siteUrl: string, details: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.error(
      "[health-cron] DOWN (kein Alert-Versand, ENV fehlt):",
      details,
    );
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: adminEmail,
      subject: `⚠ ON ME HONEY B DOWN — ${new Date().toISOString()}`,
      html: `<p style="font-family:monospace">Site or API unresponsive.<br/><br/>${JSON.stringify(details, null, 2).replace(/\n/g, "<br/>")}<br/><br/><a href="${siteUrl}">${siteUrl}</a></p>`,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "[health-cron] Resend hat den Alarm abgelehnt:",
          response.status,
        );
      }
    })
    .catch((error: unknown) => {
      console.error(
        "[health-cron] Alarmversand fehlgeschlagen:",
        error instanceof Error ? error.name : "Unbekannter Fehler",
      );
    });
}
