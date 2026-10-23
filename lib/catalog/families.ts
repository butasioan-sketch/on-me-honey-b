/**
 * Product Families - Catalog Core
 * WAVE 4.1: Central source of truth for product types and their 3D models
 */

export interface ProductFamily {
  id: string;
  name: string;
  glbPath: string | null; // null = no 3D, use photo
  shop_live: boolean; // true = purchasable with Atelier
}

/**
 * Product families with 3D models
 * Only shop_live families get GLB preloaded
 */
export const PRODUCT_FAMILIES: Record<string, ProductFamily> = {
  tee: {
    id: 'tee',
    name: 'T-Shirt',
    glbPath: '/models/shirt-white-v2.glb',
    shop_live: true,
  },
  shorts: {
    id: 'shorts',
    name: 'Shorts',
    glbPath: '/models/shorts-white-v1.glb',
    shop_live: true,
  },
  // Pillow: Phase 6 after Jonny price + gate
  // pillow: {
  //   id: 'pillow',
  //   name: 'Kissenbezug',
  //   glbPath: '/models/pillow-cover-40x40.glb',
  //   shop_live: false,
  // },
};

/**
 * ProductRecord - maps SKU to family and metadata
 * Replaces hardcoded PRODUCTS array for catalog
 */
export interface ProductRecord {
  sku: string; // "001" to "133"
  shopId: string | null; // "1", "2", "3" or null if not purchasable
  familyId: keyof typeof PRODUCT_FAMILIES;
  name: string;
  shop_live: boolean;
}

/**
 * Catalog products
 * Live products (001, 015) have shopId and shop_live=true
 * Others are catalog-only until Phase 7 gates open
 */
export const CATALOG: Record<string, ProductRecord> = {
  '001': {
    sku: '001',
    shopId: '1',
    familyId: 'tee',
    name: 'AirFit Pro T-Shirt',
    shop_live: true,
  },
  '015': {
    sku: '015',
    shopId: '2',
    familyId: 'shorts',
    name: 'AirFit Pro Shorts',
    shop_live: true,
  },
  '051': {
    sku: '051',
    shopId: null, // Phase 6 - after Jonny price
    familyId: 'tee', // placeholder - will be pillow in Phase 6
    name: 'Kissenbezug 40×40cm',
    shop_live: false,
  },
};

/**
 * Get family by shopId (for runtime lookup)
 */
export function getFamilyByShopId(shopId: string): ProductFamily | null {
  const record = Object.values(CATALOG).find(r => r.shopId === shopId);
  if (!record) return null;
  return PRODUCT_FAMILIES[record.familyId] || null;
}

/**
 * Get family by SKU
 */
export function getFamilyBySku(sku: string): ProductFamily | null {
  const record = CATALOG[sku];
  if (!record) return null;
  return PRODUCT_FAMILIES[record.familyId] || null;
}

/**
 * Get all shop_live families (for GLB preload)
 */
export function getLiveFamilies(): ProductFamily[] {
  return Object.values(PRODUCT_FAMILIES).filter(f => f.shop_live);
}

/**
 * Get product record by SKU
 */
export function getProductBySku(sku: string): ProductRecord | null {
  return CATALOG[sku] || null;
}

/**
 * Get product record by shopId
 */
export function getProductByShopId(shopId: string): ProductRecord | null {
  return Object.values(CATALOG).find(r => r.shopId === shopId) || null;
}

/**
 * Get product by ID (either shopId or SKU)
 * Used by /product/[id] route to accept both formats
 */
export function getProductById(id: string): ProductRecord | null {
  // Try as SKU first
  if (CATALOG[id]) return CATALOG[id];
  // Try as shopId
  return getProductByShopId(id);
}

/**
 * Check if ID is valid (exists in catalog)
 */
export function isValidProductId(id: string): boolean {
  return getProductById(id) !== null;
}
