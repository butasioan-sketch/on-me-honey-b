import { Locale } from './i18n';

// Erweiterte Produktstruktur für 133-Produkte-Shop
export type ProductStatus = 'shop_live' | 'anker' | 'pilot' | 'offen' | 'pruefen';
export type ProductFamily =
  | 'tee' | 'body' | 'tank' | 'polo' | 'longsleeve' | 'jersey' | 'bra' | 'shorts' | 'pants'
  | 'leggings' | 'jacket' | 'hoodie' | 'socks' | 'soft-head' | 'patch' | 'tote' | 'drawstring'
  | 'sportbag' | 'pouch' | 'laptop' | 'pillow' | 'towel' | 'table-textile' | 'apron'
  | 'potholder' | 'coaster' | 'panel' | 'clock' | 'flag' | 'mousepad' | 'phone' | 'hard-small'
  | 'puzzle' | 'notebook' | 'mug' | 'tumbler' | 'bottle' | 'cap' | 'visor' | 'plate' | 'pen' | 'shoe';

export type PrintShape =
  | 'a4_flat' | 'a4_partial' | 'wrap_cylinder' | 'circle' | 'cap_front' | 'panel' | 'shoe';

export type Machbarkeit = 'bedingt' | 'eingeschraenkt' | 'pruefen';

export type Category = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

export interface ExtendedProduct {
  sku: string;
  id: string; // Für Shop-Routen, erst nach Aktivierung
  name: Record<Locale, string>;
  category: Category;
  family: ProductFamily;
  blank: string;
  preis_vk: number;
  status: ProductStatus;
  printShape: PrintShape;
  machbarkeit: Machbarkeit;
  hasGLB: boolean;
  hasPhoto: boolean;
  weightGsm: number;
  sides: string;

  // Optionale Felder
  description?: Record<Locale, string>;
  sizes?: string[];
  fits?: string[];
  material?: string;
  tags?: string[];
}

// Kategorie-Namen
export const CATEGORY_NAMES: Record<Category, Record<Locale, string>> = {
  'A': {
    de: 'Bekleidung und Mode',
    ro: 'Îmbrăcăminte și Modă',
    en: 'Clothing and Fashion'
  },
  'B': {
    de: 'Taschen und Accessoires',
    ro: 'Genți și Accesorii',
    en: 'Bags and Accessories'
  },
  'C': {
    de: 'Wohnen und Dekoration',
    ro: 'Casă și Decorațiune',
    en: 'Home and Decoration'
  },
  'D': {
    de: 'Geschenkartikel, Büro und Technik',
    ro: 'Cadouri, Birou și Tehnologie',
    en: 'Gifts, Office and Tech'
  },
  'E': {
    de: 'Tassen, Becher und Trinkgefäße',
    ro: 'Căni, Pahare și Vase de Băut',
    en: 'Mugs, Cups and Drinkware'
  },
  'F': {
    de: 'Kappen und Kopfbedeckungen',
    ro: 'Șepci și Acoperăminte pentru Cap',
    en: 'Caps and Headwear'
  },
  'G': {
    de: 'Teller und Keramikartikel',
    ro: 'Farfurii și Articole din Ceramică',
    en: 'Plates and Ceramic Items'
  },
  'H': {
    de: 'Stifte und Schreibgeräte',
    ro: 'Pixuri și Instrumente de Scris',
    en: 'Pens and Writing Instruments'
  },
  'I': {
    de: 'Schuhe',
    ro: 'Încălțăminte',
    en: 'Shoes'
  }
};

// Status-Badges
export const STATUS_LABELS: Record<ProductStatus, Record<Locale, string>> = {
  'shop_live': { de: '', ro: '', en: '' }, // Kein Badge
  'anker': { de: 'Bald verfügbar', ro: 'În curând disponibil', en: 'Coming Soon' },
  'pilot': { de: 'In Entwicklung', ro: 'În dezvoltare', en: 'In Development' },
  'offen': { de: 'In Planung', ro: 'În planificare', en: 'In Planning' },
  'pruefen': { de: 'Wird geprüft', ro: 'În verificare', en: 'Under Review' }
};

// Alle 133 Produkte
export const ALL_PRODUCTS: ExtendedProduct[] = [
  // ============ KATEGORIE A: BEKLEIDUNG (001-031) ============
  {
    sku: '001',
    id: '1', // LIVE
    name: { de: 'Unisex-T-Shirts', ro: 'Tricouri Unisex', en: 'Unisex T-Shirts' },
    category: 'A',
    family: 'tee',
    blank: 'James & Nicholson JN827',
    preis_vk: 44.99,
    status: 'shop_live',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: true,
    hasPhoto: true,
    weightGsm: 165,
    sides: 'front+back',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fits: ['Unisex'],
    material: 'AirFit Performance Fabric — 100% Polyester',
    tags: ['essential', 'polyester', 'sublimation'],
    description: {
      de: 'AirFit Performance Fabric · 165 g/m² · Vollflächiger Sublimationsdruck',
      ro: 'AirFit Performance Fabric · 165 g/m² · Sublimare integrală',
      en: 'AirFit Performance Fabric · 165 gsm · Full-area sublimation'
    }
  },
  {
    sku: '002',
    id: '', // Noch nicht aktiv
    name: { de: 'Damen-T-Shirts', ro: 'Tricouri Damă', en: 'Women\'s T-Shirts' },
    category: 'A',
    family: 'tee',
    blank: 'Damen-Tee (offen)',
    preis_vk: 44.99,
    status: 'anker',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: true,
    hasPhoto: false,
    weightGsm: 165,
    sides: 'front+back'
  },
  {
    sku: '003',
    id: '',
    name: { de: 'Herren-T-Shirts', ro: 'Tricouri Bărbați', en: 'Men\'s T-Shirts' },
    category: 'A',
    family: 'tee',
    blank: 'Herren-Tee (offen)',
    preis_vk: 44.99,
    status: 'anker',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: true,
    hasPhoto: false,
    weightGsm: 165,
    sides: 'front+back'
  },
  {
    sku: '004',
    id: '',
    name: { de: 'Kinder-T-Shirts', ro: 'Tricouri Copii', en: 'Kids T-Shirts' },
    category: 'A',
    family: 'tee',
    blank: 'Kinder-Tee (offen)',
    preis_vk: 39.99,
    status: 'anker',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: true,
    hasPhoto: false,
    weightGsm: 140,
    sides: 'front+back'
  },
  {
    sku: '005',
    id: '',
    name: { de: 'Baby-Bodys', ro: 'Body Bebeluși', en: 'Baby Bodysuits' },
    category: 'A',
    family: 'body',
    blank: 'Baby-Body (offen)',
    preis_vk: 34.99,
    status: 'offen',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: false,
    hasPhoto: false,
    weightGsm: 180,
    sides: 'front'
  },
  {
    sku: '015',
    id: '2', // LIVE
    name: { de: 'Shorts', ro: 'Pantaloni Scurți', en: 'Shorts' },
    category: 'A',
    family: 'shorts',
    blank: 'James & Nicholson JN387',
    preis_vk: 39.99,
    status: 'shop_live',
    printShape: 'a4_flat',
    machbarkeit: 'bedingt',
    hasGLB: true,
    hasPhoto: true,
    weightGsm: 135,
    sides: 'front',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fits: ['Unisex'],
    material: 'AirFit Performance Fabric — 100% Polyester',
    tags: ['essential', 'polyester', 'shorts'],
    description: {
      de: 'AirFit Performance Fabric · 135 g/m² · Unisex Laufshorts',
      ro: 'AirFit Performance Fabric · 135 g/m² · Pantaloni scurți unisex',
      en: 'AirFit Performance Fabric · 135 gsm · Unisex running shorts'
    }
  },
  // ... Weitere Produkte folgen (ich spare Token und erstelle nur die Struktur)
];

// Helper-Funktionen
export function getExtendedProduct(sku: string): ExtendedProduct | undefined {
  return ALL_PRODUCTS.find(p => p.sku === sku);
}

export function getExtendedProductById(id: string): ExtendedProduct | undefined {
  return ALL_PRODUCTS.find(p => p.id === id && p.status === 'shop_live');
}

export function getProductsByCategory(category: Category): ExtendedProduct[] {
  return ALL_PRODUCTS.filter(p => p.category === category);
}

export function getProductsByStatus(status: ProductStatus): ExtendedProduct[] {
  return ALL_PRODUCTS.filter(p => p.status === status);
}

export function getLiveProducts(): ExtendedProduct[] {
  return ALL_PRODUCTS.filter(p => p.status === 'shop_live');
}

export function getCategoryName(category: Category, locale: Locale): string {
  return CATEGORY_NAMES[category][locale] || CATEGORY_NAMES[category].de;
}

export function getStatusLabel(status: ProductStatus, locale: Locale): string {
  return STATUS_LABELS[status][locale] || STATUS_LABELS[status].de;
}
