/* eslint-disable */
// Upload-Prüfung gegen das Druckblatt. Beide Verfahren (Sublimation, DTF) drucken auf
// DIN A4 (210 × 297 mm) mit 300 dpi → 2480 × 3508 px (PRINT_SPEC in lib/print-spec.ts).
// Früher stand hier ein Procolored K13 Lite (A3+, 329 × 483 mm) — das Gerät gibt es
// im Betrieb nicht; die Fläche passte nicht zum A4-Druckblatt.

import { PRINT_SPEC } from "./print-spec";
import { getPrintMethodSpec, type PrintMethod } from "./print-method";

export interface ImageMetadata {
  width: number; // Pixel
  height: number; // Pixel
  dpi?: number;
  type?: string;
  sizeInMB?: number;
  /** true, wenn das Bild einen Alphakanal hat (PNG/WebP mit Transparenz). */
  hasAlpha?: boolean;
}

export interface PrinterValidationWarning {
  level: "warning" | "error";
  message: string;
  suggestion?: string;
}

export const PRINTER_SPEC = {
  maxPrintAreaMM: { width: PRINT_SPEC.widthMm, height: PRINT_SPEC.heightMm }, // A4
  maxPrintAreaPixels: {
    width: PRINT_SPEC.widthPx,
    height: PRINT_SPEC.heightPx,
  }, // @ 300 dpi
  minRecommendedDPI: PRINT_SPEC.dpi,
  optimalDPI: PRINT_SPEC.dpi,
  supportedFormats: ["image/png", "image/jpeg", "image/svg+xml"],
} as const;

/**
 * Validiert Bild-Metadaten gegen das A4-Druckblatt des jeweiligen Verfahrens.
 */
export function validateForPrinter(
  image: ImageMetadata,
  method: PrintMethod = "sublimation",
): PrinterValidationWarning[] {
  const warnings: PrinterValidationWarning[] = [];
  const spec = getPrintMethodSpec(method);

  if (image.dpi && image.dpi < PRINTER_SPEC.minRecommendedDPI) {
    warnings.push({
      level: "warning",
      message: `DPI zu niedrig (${image.dpi} DPI)`,
      suggestion: `Für professionellen Druck empfehlen wir mindestens ${PRINTER_SPEC.minRecommendedDPI} DPI. Niedrigere Auflösung kann zu unscharfen Drucken führen.`,
    });
  }

  if (
    image.width < PRINT_SPEC.minUploadPx &&
    image.height < PRINT_SPEC.minUploadPx
  ) {
    warnings.push({
      level: "warning",
      message: `Bild klein (${image.width}×${image.height} px)`,
      suggestion: `Für A4 sind ${PRINT_SPEC.widthPx}×${PRINT_SPEC.heightPx} px ideal (300 dpi).`,
    });
  }

  const { width: maxW, height: maxH } = PRINTER_SPEC.maxPrintAreaPixels;
  if (image.width > maxW * 2 || image.height > maxH * 2) {
    warnings.push({
      level: "warning",
      message: `Bild sehr groß (${image.width}×${image.height} px)`,
      suggestion: `Mehr als ${maxW}×${maxH} px (A4 @ 300 dpi) bringt keine Schärfe. Größere Bilder werden skaliert.`,
    });
  }

  if (
    image.type &&
    !PRINTER_SPEC.supportedFormats.includes(image.type as any)
  ) {
    warnings.push({
      level: "error",
      message: `Format nicht unterstützt (${image.type})`,
      suggestion: `Bitte nutzen Sie PNG, JPG oder SVG.`,
    });
  }

  // DTF: Ein JPEG hat immer einen Hintergrund. Weiße oder farbige Flächen ums Motiv
  // werden mitgedruckt (Weißtinte) — freigestelltes PNG ist besser.
  if (
    method === "dtf" &&
    (image.type === "image/jpeg" || image.hasAlpha === false)
  ) {
    warnings.push({
      level: "warning",
      message: `${spec.label}: Bild ohne transparenten Hintergrund`,
      suggestion: `Der Hintergrund wird mitgedruckt. Für ein freigestelltes Motiv bitte ein PNG mit transparentem Hintergrund hochladen.`,
    });
  }

  if (image.sizeInMB && image.sizeInMB > 50) {
    warnings.push({
      level: "warning",
      message: `Datei sehr groß (${image.sizeInMB.toFixed(1)} MB)`,
      suggestion: `Große Dateien können Upload-Zeit verlängern. Optimal: unter 10 MB.`,
    });
  }

  return warnings;
}

/**
 * Berechnet mm-Größe aus Pixel + DPI
 */
export function pixelsToMM(pixels: number, dpi: number = 300): number {
  return Math.round((pixels / dpi) * 25.4 * 10) / 10; // 1 decimal place
}

/**
 * Berechnet Pixel aus mm + DPI
 */
export function mmToPixels(mm: number, dpi: number = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Prüft ob Bild druckfertig ist (keine Errors, nur Warnungen erlaubt)
 */
export function isPrintReady(warnings: PrinterValidationWarning[]): boolean {
  return !warnings.some((w) => w.level === "error");
}
