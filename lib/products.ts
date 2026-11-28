import { Locale } from "./i18n";

export interface ShirtColor {
  key: string;
  hex: string;
  label: Record<Locale, string>;
}

export const SHIRT_COLORS: ShirtColor[] = [
  {
    key: "weiss",
    hex: "#f5f5f5",
    label: { de: "Weiß", ro: "Alb", en: "White" },
  },
];

/** Baumwolle (DTF-Druck): Weiß und Schwarz. Sublimation (Polyester) geht nur auf Weiß. */
export const COTTON_COLORS: ShirtColor[] = [
  {
    key: "weiss",
    hex: "#f5f5f5",
    label: { de: "Weiß", ro: "Alb", en: "White" },
  },
  {
    key: "schwarz",
    hex: "#1c1c1e",
    label: { de: "Schwarz", ro: "Negru", en: "Black" },
  },
];

export interface Product {
  id: string;
  slug: string;
  price: number;
  color: string;
  textColor: string;
  sizes: string[];
  fits: string[];
  colors: ShirtColor[];
  material: string;
  weight: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: string[];
  active: boolean;
  createdAt: string;
}

// ESSENTIAL COLLECTION — genau 2 Produkte (alles weiß, 100% Polyester / AirFit Performance Fabric,
// gleicher Aufbau: Atelier, 360°, Freeze, PDF). Brand-Zeile:
//   Essential Collection · AirFit Pro [Shorts] · AirFit Performance Fabric · Unisex · Maßgefertigt
// P1 + P2 LIVE. Essential Set (1x Tee + 1x Shorts) = 74.99 (siehe lib/pricing.ts, Stand 18.10.2026).
// Shorts-Overlay/Placement (lib/print-spec.ts GARMENT_PROFILES['2']) ist eine ERSTVERSION,
// visuell aus den Referenzfotos geschätzt — noch nicht durch physischen Testdruck verifiziert.
// Siehe: ~/Schreibtisch/MeinVault/ClaudeData/BRAND-ESSENTIAL-COLLECTION-2PRODUKTE.md
// Produktion: Epson F100 SureColor Polyester-Sublimationsdruck, selbstfinanziert.
// Blanks: T-Shirt JN827 (165 g/m², EK 16,40€), Shorts JN387 (135 g/m², EK 10,60€).
// Preise: T-Shirt 44,99€, Shorts 39,99€, Bundle 74,99€.
export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "essential-polyester",
    price: 44.99,
    color: "#f5f5f5",
    textColor: "#000",
    sizes: ["S", "M", "L", "XL", "XXL"],
    fits: ["Unisex"],
    colors: SHIRT_COLORS,
    material:
      "AirFit Performance Fabric — 100% Polyester (165 g/m², sublimationsgeeignet)",
    weight: "165g/m²",
    name: {
      de: "AirFit Pro",
      ro: "AirFit Pro",
      en: "AirFit Pro",
    },
    description: {
      de: "AirFit Performance Fabric · 165 g/m² · Vollflächiger Sublimationsdruck 210 × 297 mm · Unisex",
      ro: "AirFit Performance Fabric · 165 g/m² · Sublimare integrală 210 × 297 mm · Unisex",
      en: "AirFit Performance Fabric · 165 gsm · Full-area sublimation 210 × 297 mm · Unisex",
    },
    tags: [
      "essential",
      "polyester",
      "sublimation",
      "hell",
      "basic",
      "tee",
      "jn827",
    ],
    active: true,
    createdAt: "2026-01-01",
  },
  // P2 — Unisex Laufshorts. Blank: James & Nicholson JN387 (100% PE, 135 g/m², S–XXL, Kordelbund, ohne Innenslip).
  {
    id: "2",
    slug: "airfit-pro-shorts",
    price: 39.99,
    color: "#f5f5f5",
    textColor: "#000",
    sizes: ["S", "M", "L", "XL", "XXL"],
    fits: ["Unisex"],
    colors: SHIRT_COLORS,
    material:
      "AirFit Performance Fabric — 100% Polyester (135 g/m², sublimationsgeeignet)",
    weight: "135g/m²",
    name: {
      de: "AirFit Pro Shorts",
      ro: "AirFit Pro Shorts",
      en: "AirFit Pro Shorts",
    },
    description: {
      de: "AirFit Performance Fabric · 135 g/m² · Vollflächiger Sublimationsdruck · Unisex Laufshorts",
      ro: "AirFit Performance Fabric · 135 g/m² · Sublimare integrală · Pantaloni scurți unisex",
      en: "AirFit Performance Fabric · 135 gsm · Full-area sublimation · Unisex running shorts",
    },
    tags: ["essential", "polyester", "shorts", "jn387", "sublimation"],
    active: true,
    createdAt: "2026-07-19",
  },
  // P4 — Baumwoll-T-Shirt, DTF-Druck, Weiß + Schwarz. VORBEREITET, NICHT AKTIV.
  // Rohling laut Lieferantenvergleich 09.04.2026 (Vault): Stanley/Stella Creator 2.0 STTU169,
  // 100 % Bio-Baumwolle, 180 g/m², Bestand je 10 Stück Weiß + Schwarz in S–XXL.
  // Modell am Etikett bestätigen. Preis setzt Jonny, wenn die Lieferanten feststehen.
  // Freischalten: Preis + active: true + PRODUCT_FLAT['4'] + Testdruck-Nachweis (release-gate.ts).
  {
    id: "4",
    slug: "classic-cotton-tee",
    price: 0,
    color: "#f5f5f5",
    textColor: "#000",
    sizes: ["S", "M", "L", "XL", "XXL"],
    fits: ["Unisex"],
    colors: COTTON_COLORS,
    material: "100 % Bio-Baumwolle (180 g/m², DTF-Druck)",
    weight: "180g/m²",
    name: {
      de: "Classic Cotton Tee",
      ro: "Classic Cotton Tee",
      en: "Classic Cotton Tee",
    },
    description: {
      de: "100 % Bio-Baumwolle · 180 g/m² · DTF-Druck bis 210 × 297 mm · Weiß oder Schwarz · Unisex",
      ro: "100 % bumbac organic · 180 g/m² · imprimare DTF până la 210 × 297 mm · alb sau negru · unisex",
      en: "100% organic cotton · 180 gsm · DTF print up to 210 × 297 mm · white or black · unisex",
    },
    tags: ["baumwolle", "dtf", "tee", "schwarz", "weiss", "sttu169"],
    active: false,
    createdAt: "2026-11-28",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id && p.active);
}

export function getAllProducts(): Product[] {
  return PRODUCTS.filter((p) => p.active);
}

export function getProductName(product: Product, locale: Locale): string {
  return product.name[locale] || product.name.de;
}

export function getProductDescription(
  product: Product,
  locale: Locale,
): string {
  return product.description[locale] || product.description.de;
}
