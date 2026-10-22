/**
 * KATEGORIEN-SYSTEM
 * Zentrales System für alle Produktkategorien
 * SEO-optimiert, individuell gestaltet, Gesamtkonzept
 */

export interface Category {
  id: string;           // A, B, C, ... (intern)
  slug: string;         // bekleidung, taschen, ... (URL-friendly)
  name: string;         // Display-Name
  nameEN: string;       // English name
  icon: string;         // Emoji
  count: number;        // Anzahl Produkte
  description: string;  // Beschreibung
  color: string;        // Individuelle Farbe (Hex)
  gradient: string;     // Gradient für Buttons
  status: 'live' | 'coming-soon';
  priority: number;     // Sortierung (1 = höchste)
}

export const CATEGORIES: Category[] = [
  {
    id: 'A',
    slug: 'bekleidung',
    name: 'Bekleidung & Mode',
    nameEN: 'Apparel & Fashion',
    icon: '👕',
    count: 31,
    description: 'T-Shirts, Shorts, Hoodies & mehr – individuell bedruckt',
    color: '#D4AF37',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    status: 'live', // 2 Produkte live
    priority: 1
  },
  {
    id: 'B',
    slug: 'taschen',
    name: 'Taschen & Accessoires',
    nameEN: 'Bags & Accessories',
    icon: '👜',
    count: 19,
    description: 'Shopper, Rucksäcke, Taschen – personalisiert für dich',
    color: '#E2001A',
    gradient: 'linear-gradient(135deg, #E2001A 0%, #FF4D4D 100%)',
    status: 'coming-soon',
    priority: 2
  },
  {
    id: 'C',
    slug: 'wohnen',
    name: 'Wohnen & Dekoration',
    nameEN: 'Home & Decor',
    icon: '🏠',
    count: 27,
    description: 'Kissen, Handtücher, Dekoration – dein Design, dein Zuhause',
    color: '#4A90E2',
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #7CB3FF 100%)',
    status: 'coming-soon',
    priority: 3
  },
  {
    id: 'D',
    slug: 'geschenke',
    name: 'Geschenkartikel & Büro',
    nameEN: 'Gifts & Office',
    icon: '🎁',
    count: 24,
    description: 'Einzigartige Geschenke & Büroartikel mit persönlicher Note',
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #C39BD3 100%)',
    status: 'coming-soon',
    priority: 4
  },
  {
    id: 'E',
    slug: 'tassen',
    name: 'Tassen & Becher',
    nameEN: 'Mugs & Cups',
    icon: '☕',
    count: 15,
    description: 'Kaffeetassen, Becher, Trinkgefäße – individuell gestaltet',
    color: '#E67E22',
    gradient: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
    status: 'coming-soon',
    priority: 5
  },
  {
    id: 'F',
    slug: 'caps',
    name: 'Caps & Kopfbedeckungen',
    nameEN: 'Caps & Headwear',
    icon: '🧢',
    count: 6,
    description: 'Baseball Caps, Snapbacks & mehr – mit deinem Design',
    color: '#1ABC9C',
    gradient: 'linear-gradient(135deg, #1ABC9C 0%, #48C9B0 100%)',
    status: 'coming-soon',
    priority: 6
  },
  {
    id: 'G',
    slug: 'teller',
    name: 'Teller & Keramik',
    nameEN: 'Plates & Ceramics',
    icon: '🍽️',
    count: 4,
    description: 'Teller, Schalen, Keramikartikel – personalisiert',
    color: '#95A5A6',
    gradient: 'linear-gradient(135deg, #95A5A6 0%, #BDC3C7 100%)',
    status: 'coming-soon',
    priority: 7
  },
  {
    id: 'H',
    slug: 'stifte',
    name: 'Stifte & Schreibgeräte',
    nameEN: 'Pens & Writing',
    icon: '✒️',
    count: 3,
    description: 'Kugelschreiber, Stifte – mit individuellem Druck',
    color: '#34495E',
    gradient: 'linear-gradient(135deg, #34495E 0%, #5D6D7E 100%)',
    status: 'coming-soon',
    priority: 8
  },
  {
    id: 'I',
    slug: 'schuhe',
    name: 'Schuhe',
    nameEN: 'Shoes',
    icon: '👟',
    count: 4,
    description: 'Sneakers, Schuhe – komplett personalisierbar',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)',
    status: 'coming-soon',
    priority: 9
  },
];

/**
 * Get category by slug (SEO-friendly URL)
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

/**
 * Get category by ID (internal)
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get all live categories (haben verfügbare Produkte)
 */
export function getLiveCategories(): Category[] {
  return CATEGORIES.filter(cat => cat.status === 'live').sort((a, b) => a.priority - b.priority);
}

/**
 * Get all categories sorted by priority
 */
export function getAllCategories(): Category[] {
  return [...CATEGORIES].sort((a, b) => a.priority - b.priority);
}

/**
 * Get total product count
 */
export function getTotalProductCount(): number {
  return CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);
}
