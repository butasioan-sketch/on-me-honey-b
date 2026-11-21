import { SHIPPING_OPTIONS } from "./shipping";

/** Zentrale Liefer- und Produktionszeiten (Jonny 21.11.2026: kleines Start-up, Handfertigung).
 *  Annahme, bis Jonny bestätigt: Produktion 3–5 Werktage nach Zahlungseingang.
 *  An EINER Stelle pflegen – AGB, Versand, FAQ, Warenkorb, Mails und Stripe nutzen diese Werte. */
export const PRODUCTION_DAYS = { min: 3, max: 5 } as const;

function maxShippingDays(country: "DE" | "RO" = "DE"): number {
  return Math.max(...SHIPPING_OPTIONS.map((o) => Number(o.eta[country].match(/(\d+)\D*$/)?.[1] ?? 0)));
}

/** Spätester Liefertermin in Werktagen ab Zahlungseingang (Produktion max + Versand max). */
export const MAX_DELIVERY_DAYS_DE = PRODUCTION_DAYS.max + maxShippingDays("DE");

export const DELIVERY_TEXT = {
  de: {
    production: `${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} Werktage Handfertigung`,
    total: `Lieferung spätestens ${MAX_DELIVERY_DAYS_DE} Werktage nach Zahlungseingang`,
    short: `Handfertigung ${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} Werktage + Versand · spätestens ${MAX_DELIVERY_DAYS_DE} Werktage`,
  },
  ro: {
    production: `${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} zile lucrătoare de producție manuală`,
    total: `Livrare în cel mult ${MAX_DELIVERY_DAYS_DE} zile lucrătoare de la plată (Germania)`,
    short: `Producție manuală ${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} zile + livrare · max. ${MAX_DELIVERY_DAYS_DE} zile lucrătoare`,
  },
  en: {
    production: `${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} working days of handmade production`,
    total: `Delivered no later than ${MAX_DELIVERY_DAYS_DE} working days after payment (Germany)`,
    short: `Handmade in ${PRODUCTION_DAYS.min}–${PRODUCTION_DAYS.max} working days + shipping · max. ${MAX_DELIVERY_DAYS_DE} working days`,
  },
} as const;

/** Kontakt für Reklamationen: OPERATOR_EMAIL (wie Impressum), sonst Verweis aufs Impressum. */
export function contactEmail(): string | null {
  return process.env.OPERATOR_EMAIL?.trim() || null;
}
