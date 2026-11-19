/** Einheitliche Preisanzeige je Shop-Sprache (DE: „44,99 €“, RO: „44,99 €“, EN: „€44.99“). */
const NUMBER_LOCALE: Record<string, string> = { de: "de-DE", ro: "ro-RO", en: "en-IE" };
const cache = new Map<string, Intl.NumberFormat>();

export function formatEuro(value: number, locale: string = "de"): string {
  const tag = NUMBER_LOCALE[locale] ?? "de-DE";
  let fmt = cache.get(tag);
  if (!fmt) {
    fmt = new Intl.NumberFormat(tag, { style: "currency", currency: "EUR" });
    cache.set(tag, fmt);
  }
  return fmt.format(value);
}
