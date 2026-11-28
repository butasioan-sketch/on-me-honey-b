import { getOrderById, getDesignById, type DesignRecord } from "@/lib/db";
/* eslint-disable */
import {
  PRINT_SPEC,
  formatSizeMm,
  getGarmentProfile,
  requireGarmentProductId,
} from "@/lib/print-spec";
import { orderDesignIds } from "@/lib/order-review";
import { getPrintMethodSpec } from "@/lib/print-method";

/** Dateiendung passend zum gespeicherten Druckblatt (DTF = PNG, Sublimation = JPEG). */
function sheetExt(dataUrl: string): string {
  return dataUrl.startsWith("data:image/png") ? "png" : "jpg";
}

export default async function PrintView({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order)
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        Bestellung nicht gefunden.
      </div>
    );

  const ids = orderDesignIds(order);
  const designs: DesignRecord[] = (
    await Promise.all(ids.map((id) => getDesignById(id)))
  ).filter((d): d is DesignRecord => d !== null);
  const hasDesign = designs.some((d) => d.frontImage || d.backImage);
  const missingDesign = !hasDesign;
  // Bestellung kann Tee + Shorts gemischt enthalten (unterschiedliche Blanks) —
  // alle vorkommenden Blanks zusammenfassen statt des global-falschen PRINT_SPEC.blank.
  const blanksUsed = Array.from(
    new Set(
      designs.map(
        (d) => getGarmentProfile(requireGarmentProductId(d.productId)).blank,
      ),
    ),
  );

  // Verfahren je Design (Sublimation oder DTF) — eine Bestellung kann beide enthalten.
  const methodOf = (d: DesignRecord) =>
    getPrintMethodSpec(
      getGarmentProfile(requireGarmentProductId(d.productId)).method,
    );
  const methodsUsed = Array.from(
    new Set(designs.map((d) => methodOf(d).id)),
  ).map(getPrintMethodSpec);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: 900,
        margin: "0 auto",
        color: "#111",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          borderBottom: "2px solid #111",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem" }}>
            ON ME HONEY B — Druckauftrag
          </h1>
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.95rem" }}>
            <strong>{order.id}</strong> · {order.shippingCountry}
            {order.shippingMethod ? " · " + order.shippingMethod : ""} · Status:{" "}
            {order.status}
            {designs.some((d) => d.frozenAt) && (
              <span
                style={{
                  marginLeft: "0.6rem",
                  background: "#111",
                  color: "#4ade80",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                ❄ frozen
              </span>
            )}
          </p>
        </div>
        <a
          href={`/api/orders/${order.id}/print-pdf`}
          style={{
            background: "#111",
            color: "#fff",
            padding: "0.6rem 1.25rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.875rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          📄 PDF Druckauftrag herunterladen
        </a>
      </div>

      {missingDesign && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          <strong>Kein Motiv hinterlegt.</strong> Diese Bestellung enthält kein
          Design — vor Produktion Kundenkontakt oder Storno prüfen.
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2rem",
          fontSize: "0.9rem",
        }}
      >
        <thead>
          <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>Artikel</th>
            <th>Größe</th>
            <th>Farbe</th>
            <th>Menge</th>
            <th>Design</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map(
            (
              it: {
                name: string;
                size: string;
                color?: string;
                quantity: number;
                designId?: string;
              },
              i: number,
            ) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "0.5rem" }}>{it.name}</td>
                <td>{it.size}</td>
                <td>{it.color || "—"}</td>
                <td>{it.quantity}</td>
                <td
                  style={{
                    fontSize: "0.75rem",
                    color: it.designId ? "#333" : "#b45309",
                  }}
                >
                  {it.designId || "fehlt"}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <div
        style={{
          background: "#f8f8f8",
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "2rem",
          fontSize: "0.85rem",
          lineHeight: 1.6,
        }}
      >
        <strong>Druckstandard</strong>
        <br />
        Format: {formatSizeMm()} Hochformat · {PRINT_SPEC.dpi} dpi ·{" "}
        {PRINT_SPEC.widthPx} × {PRINT_SPEC.heightPx} px
        <br />
        Blank: {blanksUsed.length ? blanksUsed.join(" · ") : PRINT_SPEC.blank} ·
        Methode:{" "}
        {methodsUsed.length
          ? methodsUsed.map((m) => m.label).join(" · ")
          : PRINT_SPEC.method}
        {methodsUsed.map((m) => (
          <span key={m.id}>
            <br />
            <strong>{m.label}</strong>: {m.device} · {m.medium}
            {m.productionNotes.map((n) => (
              <span key={n}>
                <br />– {n}
              </span>
            ))}
          </span>
        ))}
      </div>

      {designs.map((d) => (
        <div
          key={d.id}
          style={{ marginBottom: "2.5rem", pageBreakInside: "avoid" }}
        >
          <p
            style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem" }}
          >
            Design {d.id} · <strong>{methodOf(d).label}</strong>
            {d.frozenAt &&
              ` · eingefroren ${new Date(d.frozenAt).toLocaleString("de-DE")}`}
          </p>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {d.frontImage && (
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "0.6rem",
                  }}
                >
                  VORNE — {PRINT_SPEC.widthPx} × {PRINT_SPEC.heightPx} px
                </p>
                <a
                  href={d.frontImage}
                  download={`${order.id}-front.${sheetExt(d.frontImage)}`}
                  style={{
                    display: "inline-block",
                    background: "#D4AF37",
                    color: "#fff",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    marginBottom: "0.75rem",
                  }}
                >
                  ↓ VORNE drucken
                </a>
                <img
                  src={d.frontImage}
                  alt="front"
                  style={{
                    display: "block",
                    maxWidth: 320,
                    border: "1px solid #ccc",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#888",
                    marginTop: "0.4rem",
                  }}
                >
                  Platzierung:{" "}
                  {d.frontTransform
                    ? `scale ${d.frontTransform.scale.toFixed(2)} · x ${d.frontTransform.x.toFixed(1)} · y ${d.frontTransform.y.toFixed(1)}`
                    : "unbekannt (Legacy — vor Transform-Speicherung)"}
                </p>
              </div>
            )}
            {d.backImage && (
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "0.6rem",
                  }}
                >
                  HINTEN — {PRINT_SPEC.widthPx} × {PRINT_SPEC.heightPx} px
                </p>
                <a
                  href={d.backImage}
                  download={`${order.id}-back.${sheetExt(d.backImage)}`}
                  style={{
                    display: "inline-block",
                    background: "#D4AF37",
                    color: "#fff",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    marginBottom: "0.75rem",
                  }}
                >
                  ↓ HINTEN drucken
                </a>
                <img
                  src={d.backImage}
                  alt="back"
                  style={{
                    display: "block",
                    maxWidth: 320,
                    border: "1px solid #ccc",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#888",
                    marginTop: "0.4rem",
                  }}
                >
                  Platzierung:{" "}
                  {d.backTransform
                    ? `scale ${d.backTransform.scale.toFixed(2)} · x ${d.backTransform.x.toFixed(1)} · y ${d.backTransform.y.toFixed(1)}`
                    : "unbekannt (Legacy — vor Transform-Speicherung)"}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      <p
        style={{
          fontSize: "0.75rem",
          color: "#999",
          borderTop: "1px solid #ddd",
          paddingTop: "1rem",
        }}
      >
        {methodsUsed.length
          ? methodsUsed.map((m) => m.label).join(" · ")
          : PRINT_SPEC.method}{" "}
        · {blanksUsed.length ? blanksUsed.join(" · ") : PRINT_SPEC.blank} ·{" "}
        {PRINT_SPEC.widthMm} × {PRINT_SPEC.heightMm} mm Hochformat (
        {PRINT_SPEC.dpi} dpi = {PRINT_SPEC.widthPx} × {PRINT_SPEC.heightPx} px).
        Motive in Originalauflösung — Download oder Rechtsklick → Bild speichern
        → Sublimation: Epson SC-F100 · DTF: RIP-Software des DTF-Druckers.
      </p>
    </div>
  );
}
