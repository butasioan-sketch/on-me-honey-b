/** Absender für alle Resend-Mails. `onboarding@resend.dev` darf nur an den Resend-Kontoinhaber
 *  senden – für Kundenmails muss RESEND_FROM eine bei Resend verifizierte Domain nutzen,
 *  z. B. "ON ME HONEY B <bestellung@deine-domain.de>". */
export function emailFrom(): string {
  return process.env.RESEND_FROM?.trim() || "ON ME HONEY B <onboarding@resend.dev>";
}
