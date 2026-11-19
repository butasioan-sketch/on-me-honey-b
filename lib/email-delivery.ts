// Interne /api/email-Antworten auswerten, ohne Kundendaten zu loggen.
// /api/email antwortet auch bei Providerfehlern mit HTTP 200 und `sent:false`;
// ein geschütztes Preview leitet ohne Versand auf eine Login-Seite um.

export type EmailDeliveryResult =
  | { accepted: true }
  | {
      accepted: false;
      reason: "redirect" | "http_error" | "invalid_body" | "demo" | "not_sent";
      status: number;
    };

type EmailResponseLike = Pick<Response, "ok" | "status" | "redirected" | "json">;

export async function readEmailDelivery(
  response: EmailResponseLike,
): Promise<EmailDeliveryResult> {
  const status = response.status;
  if (response.redirected || (status >= 300 && status < 400)) {
    return { accepted: false, reason: "redirect", status };
  }
  if (!response.ok) return { accepted: false, reason: "http_error", status };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { accepted: false, reason: "invalid_body", status };
  }
  if (!body || typeof body !== "object") {
    return { accepted: false, reason: "invalid_body", status };
  }
  const data = body as { sent?: unknown; demo?: unknown };
  if (data.sent === true) return { accepted: true };
  return {
    accepted: false,
    reason: data.demo === true ? "demo" : "not_sent",
    status,
  };
}
