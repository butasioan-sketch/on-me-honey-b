// Druckverfahren: Sublimation (vorhanden) und DTF (Direct-to-Film, neu).
//
// Einzige Wahrheit dafür, welches Verfahren ein Produkt bekommt und wie das Druckblatt
// für dieses Verfahren aussehen muss. Das A4-Format (210 × 297 mm, 300 dpi) bleibt für
// beide Verfahren gleich (siehe PRINT_SPEC in lib/print-spec.ts).
//
// Sublimation: Epson SureColor SC-F100, Transferpapier A4, Motiv gespiegelt drucken,
//   nur Polyester bzw. beschichtete, helle Untergründe.
// DTF: A4-DTF-Drucker (Epson-XP600-Druckkopf, CMYK + Weiß) mit Aushärte-Ofen. Druck auf
//   PET-Folie, Pulver aufstreuen, im Ofen aushärten, mit der Transferpresse aufbringen.
//   Geht auf Baumwolle, Mischgewebe, Polyester und dunkle Textilien.
//   Das Druckblatt braucht einen TRANSPARENTEN Hintergrund: Jede weiße Fläche im Blatt
//   würde sonst mit Weißtinte gedruckt und als weißes Rechteck auf dem Textil landen.
//
// Pressentemperatur, Presszeit und Abziehart hängen von Folie und Pulver ab.
// Sie stehen bewusst NICHT hier, sondern kommen aus dem Datenblatt der Folie.

export type PrintMethod = "sublimation" | "dtf";

export interface PrintMethodSpec {
  id: PrintMethod;
  label: string;
  device: string;
  medium: string;
  /** Hintergrund des Druckblatts: Farbe oder null für transparent. */
  sheetBackground: string | null;
  /** Dateiformat des Druckblatts. DTF braucht Transparenz, also PNG. */
  sheetFormat: "jpeg" | "png";
  /** Anweisungen für die Produktion (Admin-Druckseite und Druckauftrag-PDF). */
  productionNotes: string[];
}

export const PRINT_METHODS: Record<PrintMethod, PrintMethodSpec> = {
  sublimation: {
    id: "sublimation",
    label: "Sublimation",
    device: "Epson SureColor SC-F100",
    medium: "Sublimations-Transferpapier A4",
    sheetBackground: "#ffffff",
    sheetFormat: "jpeg",
    productionNotes: [
      "Epson SC-F100: Papier A4, „Actual size“ / 100 % — kein Fit-to-Page",
      "Motiv gespiegelt drucken",
      "Nur Polyester bzw. beschichtete, helle Untergründe",
    ],
  },
  dtf: {
    id: "dtf",
    label: "DTF (Direct-to-Film)",
    device: "DTF-Drucker A4 (Epson XP600, CMYK + Weiß)",
    medium: "DTF-PET-Folie A4 + Schmelzpulver",
    sheetBackground: null,
    sheetFormat: "png",
    productionNotes: [
      "PNG mit transparentem Hintergrund in die RIP-Software laden, 100 % / kein Fit-to-Page",
      "Spiegeln und Weiß-Unterdruck in der RIP-Software einstellen (nicht in der Datei)",
      "Pulver aufstreuen, im Ofen aushärten, mit der Transferpresse aufbringen",
      "Temperatur, Presszeit und Abziehart laut Datenblatt der Folie",
    ],
  },
};

/** Familien, die nur sublimiert werden (Hartware, beschichtete Rohlinge). DTF nie. */
const SUBLIMATION_ONLY_FAMILIES = new Set([
  "coaster",
  "panel",
  "clock",
  "mug",
  "tumbler",
  "bottle",
  "plate",
  "pen",
  "hard-small",
  "puzzle",
  "phone",
  "mousepad",
  "notebook",
]);

/** Textilfamilien, bei denen DTF das bevorzugte Verfahren ist (meist Baumwolle/Mischgewebe). */
const DTF_PREFERRED_FAMILIES = new Set([
  "hoodie",
  "polo",
  "longsleeve",
  "body",
  "jacket",
  "pants",
  "tote",
  "drawstring",
  "sportbag",
  "apron",
  "cap",
  "visor",
]);

/**
 * Ausnahmen je SKU. Familie "tee" enthält Funktionsshirts (Polyester, Sublimation)
 * und klassische Shirts (Baumwolle, DTF).
 * VORSCHLAG — die Zuordnung je Rohling bestätigt Jonny nach Testdruck.
 */
const SKU_OVERRIDES: Record<string, PrintMethod> = {
  "002": "dtf", // Damen-T-Shirts
  "003": "dtf", // Herren-T-Shirts
  "004": "dtf", // Kinder-T-Shirts
  "023": "dtf", // Unterhemden
};

/** Bereits verkaufte bzw. testgedruckte Produkte: Verfahren steht fest, nie automatisch ändern. */
const LOCKED_SKUS: Record<string, PrintMethod> = {
  "001": "sublimation", // Unisex-T-Shirt JN827, Polyester
  "015": "sublimation", // Shorts JN387, Polyester
  "051": "sublimation", // Kissenbezug, Polyester-Velvet
};

export function isSublimationOnlyFamily(familyId: string): boolean {
  return SUBLIMATION_ONLY_FAMILIES.has(familyId);
}

/** Verfahren, die für eine Familie technisch in Frage kommen. */
export function allowedPrintMethods(familyId: string): PrintMethod[] {
  return isSublimationOnlyFamily(familyId)
    ? ["sublimation"]
    : ["sublimation", "dtf"];
}

/** Empfohlenes Verfahren für einen Katalogartikel (SKU + Familie). */
export function printMethodForSku(sku: string, familyId: string): PrintMethod {
  if (sku in LOCKED_SKUS) return LOCKED_SKUS[sku];
  if (isSublimationOnlyFamily(familyId)) return "sublimation";
  if (sku in SKU_OVERRIDES) return SKU_OVERRIDES[sku];
  if (DTF_PREFERRED_FAMILIES.has(familyId)) return "dtf";
  return "sublimation";
}

export function getPrintMethodSpec(method: PrintMethod): PrintMethodSpec {
  return PRINT_METHODS[method];
}

export function isPrintMethod(value: unknown): value is PrintMethod {
  return value === "sublimation" || value === "dtf";
}
