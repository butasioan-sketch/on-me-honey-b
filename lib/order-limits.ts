/** Bis zu 20 Stück pro Bestellung über den Shop. Ab 21 Stück nur per Anfrage (Handfertigung,
 *  individuelles Angebot und Termin). Gilt in Warenkorb, Produktseite und create-checkout. */
export const MAX_SHOP_QUANTITY = 20;
export const BULK_MIN_QUANTITY = MAX_SHOP_QUANTITY + 1;

export function totalQuantity(items: { quantity?: number }[]): number {
  return items.reduce((n, i) => n + (Number.isFinite(i.quantity) ? Math.max(0, Number(i.quantity)) : 0), 0);
}
