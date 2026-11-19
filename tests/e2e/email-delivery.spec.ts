import { test, expect } from "@playwright/test";
import { readEmailDelivery } from "../../lib/email-delivery";

// Synthetische /api/email-Antworten — kein Netzwerk, keine echte E-Mail.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test.describe("E-Mail-Zustellstatus aus /api/email", () => {
  test("sent:true bestätigt die Annahme @smoke", async () => {
    expect(await readEmailDelivery(json({ sent: true }))).toEqual({
      accepted: true,
    });
  });

  test("Providerfehler mit HTTP 200 und sent:false ist kein Erfolg @smoke", async () => {
    expect(
      await readEmailDelivery(json({ sent: false, error: "Resend Fehler" })),
    ).toEqual({ accepted: false, reason: "not_sent", status: 200 });
  });

  test("Demo ohne API-Key ist kein Erfolg @smoke", async () => {
    expect(
      await readEmailDelivery(json({ sent: false, demo: true, subject: "x" })),
    ).toEqual({ accepted: false, reason: "demo", status: 200 });
  });

  test("Redirect des geschützten Previews ist kein Erfolg @smoke", async () => {
    // redirect: "manual" liefert den 3xx direkt
    expect(
      await readEmailDelivery(
        new Response(null, { status: 307, headers: { Location: "/login" } }),
      ),
    ).toEqual({ accepted: false, reason: "redirect", status: 307 });

    // gefolgter Redirect: Login-Seite mit HTTP 200
    const followed = {
      ok: true,
      status: 200,
      redirected: true,
      json: async () => ({ sent: true }),
    };
    expect(await readEmailDelivery(followed)).toEqual({
      accepted: false,
      reason: "redirect",
      status: 200,
    });
  });

  test("HTML statt JSON und HTTP-Fehler sind kein Erfolg @smoke", async () => {
    expect(
      await readEmailDelivery(new Response("<html>Login</html>", { status: 200 })),
    ).toEqual({ accepted: false, reason: "invalid_body", status: 200 });
    expect(await readEmailDelivery(json({ error: "x" }, 500))).toEqual({
      accepted: false,
      reason: "http_error",
      status: 500,
    });
  });
});
