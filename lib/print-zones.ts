/**
 * ON ME HONEY B — Erweiterte Druckzonen-Konfiguration
 *
 * Definiert interaktive Druckzonen für jedes Produkt.
 * Kunden können auswählen, welche Bereiche bedruckt werden sollen.
 */

import { Locale } from './i18n';

export type PrintZoneId =
  // T-Shirt Zonen
  | 'tshirt-front'
  | 'tshirt-back'
  | 'tshirt-sleeve-left'
  | 'tshirt-sleeve-right'
  // Shorts Zonen
  | 'shorts-front'
  | 'shorts-back'
  | 'shorts-leg-left'
  | 'shorts-leg-right'
  | 'shorts-side-left'
  | 'shorts-side-right';

export interface PrintZone {
  id: PrintZoneId;
  productId: string;
  enabled: boolean; // Ist diese Zone für dieses Produkt verfügbar?
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  icon?: string; // SVG Icon für UI

  // 3D Position für Decal
  position3D: {
    // Mesh-relative Position (wird in getDecalPosition verwendet)
    centerX: number; // -1 bis 1 (links bis rechts)
    centerY: number; // -1 bis 1 (unten bis oben)
    centerZ: number; // -1 bis 1 (vorne bis hinten)
    rotation: [number, number, number]; // Euler rotation [x, y, z]
  };

  // 2D Foto-Position (für Atelier-Preview)
  position2D: {
    top: number;    // Prozent
    left: number;   // Prozent
    width: number;  // Prozent
    height: number; // Prozent
  };

  // Größen-Limits
  maxArea: {
    widthMm: number;
    heightMm: number;
  };

  // Preis (falls Zone zusätzliche Kosten hat)
  priceModifier?: number; // z.B. +5€ für Ärmel-Druck
}

// ============================================================================
// T-SHIRT ZONEN (Product ID: 1)
// ============================================================================

export const TSHIRT_ZONES: PrintZone[] = [
  {
    id: 'tshirt-front',
    productId: '1',
    enabled: true,
    name: {
      de: 'Vorderseite',
      ro: 'Față',
      en: 'Front',
    },
    description: {
      de: 'Hauptdruckbereich auf der Brust',
      ro: 'Zona principală de imprimare pe piept',
      en: 'Main print area on chest',
    },
    position3D: {
      centerX: 0,
      centerY: 0.15, // Leicht nach oben (Brust-Position)
      centerZ: 0.5,  // Vorne am Mesh
      rotation: [0, 0, 0],
    },
    position2D: {
      top: 26.3,   // Wie in PRINT_SPEC.overlay.front
      left: 34.7,
      width: 30.9,
      height: 29.2,
    },
    maxArea: {
      widthMm: 210,
      heightMm: 297,
    },
  },
  {
    id: 'tshirt-back',
    productId: '1',
    enabled: true,
    name: {
      de: 'Rückseite',
      ro: 'Spate',
      en: 'Back',
    },
    description: {
      de: 'Rückenbereich',
      ro: 'Zona din spate',
      en: 'Back area',
    },
    position3D: {
      centerX: 0,
      centerY: 0.1,
      centerZ: -0.5, // Hinten am Mesh
      rotation: [0, Math.PI, 0], // 180° gedreht
    },
    position2D: {
      top: 29.9,   // Wie in PRINT_SPEC.overlay.back
      left: 34.5,
      width: 28.9,
      height: 27.3,
    },
    maxArea: {
      widthMm: 210,
      heightMm: 297,
    },
  },
  // OPTIONAL: Ärmel (kann später aktiviert werden)
  {
    id: 'tshirt-sleeve-left',
    productId: '1',
    enabled: false, // Aktuell deaktiviert
    name: {
      de: 'Linker Ärmel',
      ro: 'Mânecă stângă',
      en: 'Left Sleeve',
    },
    description: {
      de: 'Kleiner Druckbereich am linken Ärmel',
      ro: 'Zonă mică de imprimare pe mâneca stângă',
      en: 'Small print area on left sleeve',
    },
    position3D: {
      centerX: -0.45, // Links
      centerY: 0.3,   // Schulter-Höhe
      centerZ: 0.2,
      rotation: [0, -Math.PI / 4, 0],
    },
    position2D: {
      top: 25,
      left: 15,
      width: 8,
      height: 8,
    },
    maxArea: {
      widthMm: 80,
      heightMm: 80,
    },
    priceModifier: 5.00, // +5€ für Ärmel-Druck
  },
  {
    id: 'tshirt-sleeve-right',
    productId: '1',
    enabled: false, // Aktuell deaktiviert
    name: {
      de: 'Rechter Ärmel',
      ro: 'Mânecă dreaptă',
      en: 'Right Sleeve',
    },
    description: {
      de: 'Kleiner Druckbereich am rechten Ärmel',
      ro: 'Zonă mică de imprimare pe mâneca dreaptă',
      en: 'Small print area on right sleeve',
    },
    position3D: {
      centerX: 0.45,  // Rechts
      centerY: 0.3,
      centerZ: 0.2,
      rotation: [0, Math.PI / 4, 0],
    },
    position2D: {
      top: 25,
      left: 77,
      width: 8,
      height: 8,
    },
    maxArea: {
      widthMm: 80,
      heightMm: 80,
    },
    priceModifier: 5.00,
  },
];

// ============================================================================
// SHORTS ZONEN (Product ID: 2)
// ============================================================================

export const SHORTS_ZONES: PrintZone[] = [
  {
    id: 'shorts-front',
    productId: '2',
    enabled: true,
    name: {
      de: 'Vorderseite',
      ro: 'Față',
      en: 'Front',
    },
    description: {
      de: 'Hauptdruckbereich vorne',
      ro: 'Zona principală de imprimare în față',
      en: 'Main front print area',
    },
    position3D: {
      centerX: 0,
      centerY: 0, // Zentriert an Shorts
      centerZ: 0.4,
      rotation: [0, 0, 0],
    },
    position2D: {
      top: 28.5,   // Wie in SHORTS_OVERLAY
      left: 29,
      width: 38,
      height: 39,
    },
    maxArea: {
      widthMm: 210,
      heightMm: 297,
    },
  },
  {
    id: 'shorts-back',
    productId: '2',
    enabled: true,
    name: {
      de: 'Rückseite',
      ro: 'Spate',
      en: 'Back',
    },
    description: {
      de: 'Rückseite der Shorts',
      ro: 'Partea din spate a pantalonilor',
      en: 'Back of shorts',
    },
    position3D: {
      centerX: 0,
      centerY: 0,
      centerZ: -0.4,
      rotation: [0, Math.PI, 0],
    },
    position2D: {
      top: 28.5,
      left: 29,
      width: 38,
      height: 39,
    },
    maxArea: {
      widthMm: 210,
      heightMm: 297,
    },
  },
  // OPTIONAL: Beine (für spätere Erweiterung)
  {
    id: 'shorts-leg-left',
    productId: '2',
    enabled: false,
    name: {
      de: 'Linkes Bein',
      ro: 'Piciorul stâng',
      en: 'Left Leg',
    },
    description: {
      de: 'Seitlicher Druckbereich am linken Bein',
      ro: 'Zonă laterală de imprimare pe piciorul stâng',
      en: 'Side print area on left leg',
    },
    position3D: {
      centerX: -0.25,
      centerY: -0.3,
      centerZ: 0.1,
      rotation: [0, -Math.PI / 6, 0],
    },
    position2D: {
      top: 45,
      left: 10,
      width: 15,
      height: 30,
    },
    maxArea: {
      widthMm: 100,
      heightMm: 200,
    },
    priceModifier: 3.00,
  },
  {
    id: 'shorts-leg-right',
    productId: '2',
    enabled: false,
    name: {
      de: 'Rechtes Bein',
      ro: 'Piciorul drept',
      en: 'Right Leg',
    },
    description: {
      de: 'Seitlicher Druckbereich am rechten Bein',
      ro: 'Zonă laterală de imprimare pe piciorul drept',
      en: 'Side print area on right leg',
    },
    position3D: {
      centerX: 0.25,
      centerY: -0.3,
      centerZ: 0.1,
      rotation: [0, Math.PI / 6, 0],
    },
    position2D: {
      top: 45,
      left: 75,
      width: 15,
      height: 30,
    },
    maxArea: {
      widthMm: 100,
      heightMm: 200,
    },
    priceModifier: 3.00,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gibt alle Druckzonen für ein Produkt zurück
 */
export function getPrintZonesForProduct(productId: string): PrintZone[] {
  const all = [...TSHIRT_ZONES, ...SHORTS_ZONES];
  return all.filter(z => z.productId === productId && z.enabled);
}

/**
 * Gibt eine spezifische Zone zurück
 */
export function getPrintZone(zoneId: PrintZoneId): PrintZone | undefined {
  const all = [...TSHIRT_ZONES, ...SHORTS_ZONES];
  return all.find(z => z.id === zoneId);
}

/**
 * Berechnet den Gesamtpreis inklusive Zone-Modifiers
 */
export function calculateZonePricing(
  basePrice: number,
  selectedZones: PrintZoneId[]
): number {
  let total = basePrice;

  selectedZones.forEach(zoneId => {
    const zone = getPrintZone(zoneId);
    if (zone?.priceModifier) {
      total += zone.priceModifier;
    }
  });

  return total;
}

/**
 * Validiert ob eine Zone für ein Produkt gültig ist
 */
export function isValidZoneForProduct(
  zoneId: PrintZoneId,
  productId: string
): boolean {
  const zones = getPrintZonesForProduct(productId);
  return zones.some(z => z.id === zoneId);
}

// ============================================================================
// ERWEITERTE DESIGN-DATEN FÜR DATENBANK
// ============================================================================

export interface ZoneDesign {
  zoneId: PrintZoneId;
  layers: Array<{
    src: string; // Data URL des Bildes
    transform: {
      scale: number;
      x: number;
      y: number;
    };
  }>;
}

export interface MultiZoneDesignData {
  productId: string;
  zones: ZoneDesign[];
  meta?: {
    totalZones: number;
    additionalCost: number;
    [key: string]: any;
  };
}

/**
 * Serialisiert Multi-Zone Design für Datenbank
 */
export function serializeMultiZoneDesign(data: MultiZoneDesignData): string {
  return JSON.stringify(data);
}

/**
 * Deserialisiert Multi-Zone Design aus Datenbank
 */
export function deserializeMultiZoneDesign(json: string): MultiZoneDesignData | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
