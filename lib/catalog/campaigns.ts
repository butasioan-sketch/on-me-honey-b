/**
 * Saison-Kampagnen und Geschenk-Auswahl als Daten.
 *
 * Kein Zweitshop: Kampagnen zeigen nur Artikel, die im Katalog
 * `shop_live` sind. Nicht freigegebene SKUs dürfen hier stehen und
 * erscheinen automatisch, sobald ihr Status auf `shop_live` wechselt.
 */
import { PRODUCTS_133, type Product133 } from "@/lib/products-all-133";
import type { Locale } from "@/lib/i18n";

export type CampaignSlug = "valentinstag" | "ostern" | "weihnachten";

export interface CampaignCopy {
  name: string;
  headline: string;
  intro: string;
  /** Text außerhalb des Saisonfensters. */
  announcement: string;
}

export interface Campaign extends CampaignCopy {
  slug: CampaignSlug;
  icon: string;
  /** Übersetzungen; Deutsch steht in den Feldern oben. */
  i18n: Record<Exclude<Locale, "de">, CampaignCopy>;
  /** Kandidaten-SKUs; angezeigt wird nur der `shop_live`-Teil. */
  skus: string[];
  /** Saisonfenster als Berliner Kalendertage (YYYY-MM-DD), beide inklusive. */
  window: (year: number) => { start: string; end: string };
}

/** Ostersonntag (gregorianisch, Algorithmus nach Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const DAY = 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
/** Kalendertag eines UTC-Mitternachtsdatums als YYYY-MM-DD. */
const dayOf = (date: Date) => date.toISOString().slice(0, 10);

/** Heutiger Kalendertag in Europe/Berlin als YYYY-MM-DD. */
export function berlinToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Kaufbare Artikel aus der Essential Collection plus Kissen (sobald live). */
const BASE_GIFT_SKUS = ["001", "015", "051"];

export const CAMPAIGNS: Record<CampaignSlug, Campaign> = {
  valentinstag: {
    slug: "valentinstag",
    name: "Valentinstag",
    icon: "❤️",
    headline: "Ein Motiv, das nur ihr zwei versteht.",
    intro:
      "Gestalte ein Einzelstück mit eurem Foto, Datum oder Insider. Maßgefertigt nach deiner Bestellung.",
    announcement:
      "Die Valentinstag-Auswahl startet Mitte Januar. Bis dahin kannst du jedes Stück schon jetzt im Atelier gestalten.",
    i18n: {
      ro: {
        name: "Ziua Îndrăgostiților",
        headline: "Un motiv pe care doar voi doi îl înțelegeți.",
        intro:
          "Creează o piesă unică cu fotografia, data sau gluma voastră. Confecționată la comandă.",
        announcement:
          "Selecția de Ziua Îndrăgostiților începe la jumătatea lui ianuarie. Până atunci poți crea orice piesă în Atelier.",
      },
      en: {
        name: "Valentine's Day",
        headline: "A design only the two of you understand.",
        intro:
          "Create a one-off piece with your photo, date or inside joke. Made to order.",
        announcement:
          "The Valentine's selection starts in mid-January. Until then you can design any piece in the Studio.",
      },
    },
    skus: BASE_GIFT_SKUS,
    window: (year) => ({ start: ymd(year, 1, 15), end: ymd(year, 2, 14) }),
  },
  ostern: {
    slug: "ostern",
    name: "Ostern",
    icon: "🐣",
    headline: "Ostergeschenke mit eigenem Motiv.",
    intro:
      "Ein persönliches Stück statt Schokolade von der Stange. Dein Motiv, maßgefertigt nach Bestellung.",
    announcement:
      "Die Oster-Auswahl startet vier Wochen vor Ostern. Bis dahin kannst du jedes Stück schon jetzt im Atelier gestalten.",
    i18n: {
      ro: {
        name: "Paște",
        headline: "Cadouri de Paște cu motivul tău.",
        intro:
          "O piesă personală în loc de ciocolată de pe raft. Motivul tău, confecționat la comandă.",
        announcement:
          "Selecția de Paște începe cu patru săptămâni înainte de Paște. Până atunci poți crea orice piesă în Atelier.",
      },
      en: {
        name: "Easter",
        headline: "Easter gifts with your own design.",
        intro:
          "A personal piece instead of off-the-shelf chocolate. Your design, made to order.",
        announcement:
          "The Easter selection starts four weeks before Easter. Until then you can design any piece in the Studio.",
      },
    },
    skus: BASE_GIFT_SKUS,
    window: (year) => {
      const easter = easterSunday(year);
      return {
        start: dayOf(new Date(easter.getTime() - 28 * DAY)),
        end: dayOf(new Date(easter.getTime() + DAY)), // bis Ostermontag
      };
    },
  },
  weihnachten: {
    slug: "weihnachten",
    name: "Weihnachten",
    icon: "🎄",
    headline: "Weihnachtsgeschenke, die es nur einmal gibt.",
    intro:
      "Familienfoto, Vereinslogo oder eigener Spruch: Wir fertigen dein Geschenk nach deiner Bestellung.",
    announcement:
      "Die Weihnachts-Auswahl startet Mitte November. Bis dahin kannst du jedes Stück schon jetzt im Atelier gestalten.",
    i18n: {
      ro: {
        name: "Crăciun",
        headline: "Cadouri de Crăciun care există o singură dată.",
        intro:
          "Fotografie de familie, logo de club sau mesaj propriu: realizăm cadoul tău după comandă.",
        announcement:
          "Selecția de Crăciun începe la jumătatea lui noiembrie. Până atunci poți crea orice piesă în Atelier.",
      },
      en: {
        name: "Christmas",
        headline: "Christmas gifts that exist only once.",
        intro:
          "Family photo, club logo or your own line: we make your gift after you order.",
        announcement:
          "The Christmas selection starts in mid-November. Until then you can design any piece in the Studio.",
      },
    },
    skus: BASE_GIFT_SKUS,
    window: (year) => ({ start: ymd(year, 11, 15), end: ymd(year, 12, 24) }),
  },
};

/** SKUs, die grundsätzlich als Geschenk taugen. */
export const GIFT_ELIGIBLE_SKUS: readonly string[] = BASE_GIFT_SKUS;

/** Texte aller Sprachen, serialisierbar für Client-Komponenten. */
export function campaignCopies(
  campaign: Campaign,
): Record<Locale, CampaignCopy> {
  const { name, headline, intro, announcement } = campaign;
  return { de: { name, headline, intro, announcement }, ...campaign.i18n };
}

export function getCampaign(slug: string): Campaign | null {
  return (CAMPAIGNS as Record<string, Campaign>)[slug] ?? null;
}

/** Aktiv, wenn der Berliner Kalendertag im Saisonfenster liegt. */
export function isCampaignActive(
  campaign: Campaign,
  now: Date = new Date(),
): boolean {
  const today = berlinToday(now);
  const { start, end } = campaign.window(Number(today.slice(0, 4)));
  return today >= start && today <= end;
}

function liveProducts(skus: readonly string[]): Product133[] {
  return skus
    .map((sku) => PRODUCTS_133.find((p) => p.sku === sku))
    .filter(
      (p): p is Product133 =>
        !!p && p.status === "shop_live" && p.price > 0 && !!p.id,
    );
}

/** Kaufbare Artikel einer Kampagne (Kandidaten ∩ shop_live). */
export function getCampaignProducts(campaign: Campaign): Product133[] {
  return liveProducts(campaign.skus);
}

/** Kaufbare Geschenke (giftEligible ∩ shop_live). */
export function getGiftProducts(): Product133[] {
  return liveProducts(GIFT_ELIGIBLE_SKUS);
}
