"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import { BULK_MIN_QUANTITY } from "@/lib/order-limits";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "ok"; id: string; notified: boolean } | { kind: "error"; text: string };

const field: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 0.9rem",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#121214",
  color: "#fff",
  font: "inherit",
  fontSize: "1rem",
};
const label: React.CSSProperties = { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#ddd", marginBottom: "0.35rem" };

export default function GrossbestellungPage() {
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quantity: Number(data.quantity), locale: "de" }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.id) {
        setState({ kind: "ok", id: json.id, notified: !!json.adminNotified });
        return;
      }
      if (res.status === 429) {
        setState({ kind: "error", text: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in einer Stunde erneut." });
      } else if (res.status === 400 && Array.isArray(json.fields)) {
        const names: Record<string, string> = { name: "Name", email: "E-Mail", products: "Produkte", quantity: `Stückzahl (mindestens ${BULK_MIN_QUANTITY})` };
        setState({ kind: "error", text: `Bitte prüfe: ${json.fields.map((f: string) => names[f] || f).join(", ")}.` });
      } else {
        setState({ kind: "error", text: "Deine Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es später erneut." });
      }
    } catch {
      setState({ kind: "error", text: "Keine Verbindung. Bitte prüfe dein Internet und versuche es erneut." });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1000px 500px at 50% -10%, rgba(226,0,26,0.08), transparent 60%), linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <SiteHeader />
      <main id="main-content" style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1rem 5rem" }}>
        <p className="plt-label" style={{ color: "#D4AF37", margin: "0 0 0.5rem" }}>
          Großbestellung
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 0.75rem", letterSpacing: "-0.02em" }}>
          Mehr als 20 Stück? Wir machen dir ein Angebot.
        </h1>
        <p style={{ color: "#c8c8c8", lineHeight: 1.65, margin: "0 0 0.75rem" }}>
          Wir sind ein kleines Start-up und fertigen jedes Stück selbst per Hand. Damit dein Team-, Vereins- oder Firmenauftrag
          pünktlich und sauber wird, planen wir größere Mengen individuell: Du bekommst ein Angebot mit Preis, Produktionszeit und
          festem Liefertermin – in der Regel innerhalb von 2 Werktagen.
        </p>
        <ul style={{ color: "#b5b5b5", lineHeight: 1.7, margin: "0 0 2rem", paddingLeft: "1.2rem", fontSize: "0.92rem" }}>
          <li>Bis 20 Stück bestellst du direkt im Shop.</li>
          <li>Ab {BULK_MIN_QUANTITY} Stück: Anfrage hier – unverbindlich und kostenlos.</li>
          <li>Ein Vertrag entsteht erst, wenn du unser Angebot schriftlich annimmst (AGB § 9).</li>
        </ul>

        {state.kind === "ok" ? (
          <div role="status" data-testid="inquiry-ok" style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.35)" }}>
            <p style={{ fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.4rem" }}>Danke! Deine Anfrage ist gespeichert.</p>
            <p style={{ margin: 0, color: "#c8c8c8", lineHeight: 1.6 }}>
              Anfragenummer: <strong style={{ color: "#fff" }}>{state.id}</strong>. Wir melden uns per E-Mail mit deinem Angebot.
              {!state.notified && " (Unsere interne Benachrichtigung hat sich verzögert – deine Anfrage liegt trotzdem sicher bei uns.)"}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate={false} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label htmlFor="inq-name" style={label}>Name *</label>
              <input id="inq-name" name="name" required minLength={2} maxLength={120} autoComplete="name" style={field} />
            </div>
            <div>
              <label htmlFor="inq-email" style={label}>E-Mail *</label>
              <input id="inq-email" name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem" }}>
              <div>
                <label htmlFor="inq-phone" style={label}>Telefon (optional)</label>
                <input id="inq-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" style={field} />
              </div>
              <div>
                <label htmlFor="inq-company" style={label}>Firma / Verein (optional)</label>
                <input id="inq-company" name="company" maxLength={160} autoComplete="organization" style={field} />
              </div>
            </div>
            <div>
              <label htmlFor="inq-products" style={label}>Welche Produkte? *</label>
              <input id="inq-products" name="products" required minLength={2} maxLength={1000} placeholder="z. B. 30 T-Shirts und 30 Shorts, Größen gemischt" style={field} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem" }}>
              <div>
                <label htmlFor="inq-qty" style={label}>Stückzahl gesamt * (ab {BULK_MIN_QUANTITY})</label>
                <input id="inq-qty" name="quantity" type="number" inputMode="numeric" required min={BULK_MIN_QUANTITY} max={100000} defaultValue={BULK_MIN_QUANTITY} style={field} />
              </div>
              <div>
                <label htmlFor="inq-date" style={label}>Wunschtermin (optional)</label>
                <input id="inq-date" name="wantedBy" type="date" style={field} />
              </div>
            </div>
            <div>
              <label htmlFor="inq-msg" style={label}>Nachricht (optional)</label>
              <textarea id="inq-msg" name="message" rows={5} maxLength={4000} placeholder="Motive, Größenverteilung, Lieferadresse, Fragen …" style={{ ...field, resize: "vertical" }} />
            </div>
            {/* Honeypot gegen Bots – für Menschen unsichtbar */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
              <label htmlFor="inq-website">Website</label>
              <input id="inq-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <p style={{ color: "#a0a0a0", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>
              Wir verwenden deine Angaben nur, um dein Angebot zu erstellen. Details in der{" "}
              <Link href="/datenschutz" style={{ color: "#D4AF37" }}>Datenschutzerklärung</Link>.
            </p>
            {state.kind === "error" && (
              <p role="alert" style={{ color: "#f87171", margin: 0 }}>{state.text}</p>
            )}
            <button type="submit" className="plt-btn-primary" disabled={state.kind === "sending"} style={{ padding: "1rem", fontSize: "1rem" }}>
              {state.kind === "sending" ? "Wird gesendet …" : "Unverbindlich anfragen"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
