import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createBulkInquiry, markBulkInquiryNotified } from "@/lib/db";
import { emailFrom } from "@/lib/email-from";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { BULK_MIN_QUANTITY } from "@/lib/order-limits";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Anfrage für Großbestellungen (> 20 Stück). Erfolg wird nur gemeldet, wenn die Datenbank
 *  den Eintrag bestätigt hat. Die Benachrichtigung an den Inhaber ist zusätzlich und wird
 *  ehrlich zurückgemeldet (adminNotified). */
export async function POST(request: NextRequest) {
  const rl = checkRateLimit(`inq:${clientIp(request)}`, 5, 3_600_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  // Honeypot: Bots füllen das versteckte Feld
  if (str(body.website, 200)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40) || null;
  const company = str(body.company, 160) || null;
  const products = str(body.products, 1000);
  const message = str(body.message, 4000) || null;
  const quantity = Number(body.quantity);
  const wantedByRaw = str(body.wantedBy, 10);
  const wantedBy = /^\d{4}-\d{2}-\d{2}$/.test(wantedByRaw) ? wantedByRaw : null;
  const locale = ["de", "ro", "en"].includes(body.locale) ? (body.locale as string) : "de";

  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (products.length < 2) errors.push("products");
  if (!Number.isInteger(quantity) || quantity < BULK_MIN_QUANTITY || quantity > 100000) errors.push("quantity");
  if (errors.length) return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });

  const id = `ANF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(3).toString("hex")}`;
  try {
    await createBulkInquiry({ id, name, email, phone, company, products, quantity, wantedBy, message, locale });
  } catch (e) {
    console.error("[inquiries] Speichern fehlgeschlagen", e);
    return NextResponse.json({ error: "store_failed" }, { status: 503 });
  }

  let adminNotified = false;
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (adminEmail && apiKey) {
    const rows: [string, string][] = [
      ["Anfrage", id], ["Name", name], ["E-Mail", email], ["Telefon", phone || "–"], ["Firma", company || "–"],
      ["Produkte", products], ["Stückzahl", String(quantity)], ["Wunschtermin", wantedBy || "–"], ["Nachricht", message || "–"],
    ];
    const html = `<div style="font-family:system-ui,sans-serif"><h2>Neue Großbestellungs-Anfrage</h2><table>${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
      .join("")}</table></div>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: emailFrom(), to: adminEmail, reply_to: email, subject: `Anfrage ${quantity} Stück – ${id}`, html }),
      });
      adminNotified = res.ok;
      if (!res.ok) console.error("[inquiries] Resend", res.status, await res.text().catch(() => ""));
    } catch (e) {
      console.error("[inquiries] Mail fehlgeschlagen", e);
    }
    if (adminNotified) await markBulkInquiryNotified(id).catch(() => {});
  }
  return NextResponse.json({ id, adminNotified });
}
