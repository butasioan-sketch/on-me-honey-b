/**
 * Product Families - Catalog Core
 * WAVE 4.1: Central source of truth for product types and their 3D models
 * WAVE 5.1: Full 133-product catalog
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
    id: "tee",
    name: "T-Shirt",
    glbPath: "/models/shirt-white-v2.glb",
    shop_live: true,
  },
  shorts: {
    id: "shorts",
    name: "Shorts",
    glbPath: "/models/shorts-white-v1.glb",
    shop_live: true,
  },
  // WAVE 6.3: Pillow family (NOT shop_live until Jonny price + gate)
  pillow: {
    id: "pillow",
    name: "Kissenbezug",
    glbPath: "/models/pillow-cover-40x40.glb",
    shop_live: false, // Phase 6 gate - awaiting Jonny approval
  },
};

/**
 * ProductRecord - maps SKU to family and metadata
 * Replaces hardcoded PRODUCTS array for catalog
 */
export interface ProductRecord {
  sku: string; // "001" to "133"
  shopId: string | null; // "1", "2", "3" or null if not purchasable
  familyId: keyof typeof PRODUCT_FAMILIES | string; // may reference non-existent family for catalog-only
  name: string;
  shop_live: boolean;
}

/**
 * Catalog products - WAVE 5.1: All 133 SKUs
 * Live products (001, 015) have shopId and shop_live=true
 * 051 pilot (Phase 6), others catalog-only until Phase 7
 * 102-133 are 11-in-1 (blocked, shop_live=false)
 */
export const CATALOG: Record<string, ProductRecord> = {
  "100": {
    sku: "100",
    shopId: null,
    familyId: "hard-small",
    name: "Schmuckanhänger",
    shop_live: false,
  },
  "101": {
    sku: "101",
    shopId: null,
    familyId: "hard-small",
    name: "Kleine Fotokacheln Keramik",
    shop_live: false,
  },
  "102": {
    sku: "102",
    shopId: null,
    familyId: "mug",
    name: "Keramiktassen 6 oz",
    shop_live: false,
  },
  "103": {
    sku: "103",
    shopId: null,
    familyId: "mug",
    name: "Keramiktassen 9 oz",
    shop_live: false,
  },
  "104": {
    sku: "104",
    shopId: null,
    familyId: "mug",
    name: "Keramiktassen 11 oz",
    shop_live: false,
  },
  "105": {
    sku: "105",
    shopId: null,
    familyId: "mug",
    name: "Keramiktassen 12 oz",
    shop_live: false,
  },
  "106": {
    sku: "106",
    shopId: null,
    familyId: "mug",
    name: "Zweifarbige Tassen",
    shop_live: false,
  },
  "107": {
    sku: "107",
    shopId: null,
    familyId: "mug",
    name: "Magic Mugs",
    shop_live: false,
  },
  "108": {
    sku: "108",
    shopId: null,
    familyId: "tumbler",
    name: "Emaillebecher",
    shop_live: false,
  },
  "109": {
    sku: "109",
    shopId: null,
    familyId: "tumbler",
    name: "Metallbecher",
    shop_live: false,
  },
  "110": {
    sku: "110",
    shopId: null,
    familyId: "tumbler",
    name: "Edelstahl-Trinkbecher",
    shop_live: false,
  },
  "111": {
    sku: "111",
    shopId: null,
    familyId: "tumbler",
    name: "Thermobecher",
    shop_live: false,
  },
  "112": {
    sku: "112",
    shopId: null,
    familyId: "bottle",
    name: "Trinkflaschen",
    shop_live: false,
  },
  "113": {
    sku: "113",
    shopId: null,
    familyId: "bottle",
    name: "Aluminium-Trinkflaschen",
    shop_live: false,
  },
  "114": {
    sku: "114",
    shopId: null,
    familyId: "mug",
    name: "Campingbecher",
    shop_live: false,
  },
  "115": {
    sku: "115",
    shopId: null,
    familyId: "mug",
    name: "Kinderbecher",
    shop_live: false,
  },
  "116": {
    sku: "116",
    shopId: null,
    familyId: "mug",
    name: "Stiftehalter in Becherform",
    shop_live: false,
  },
  "117": {
    sku: "117",
    shopId: null,
    familyId: "cap",
    name: "Basecaps",
    shop_live: false,
  },
  "118": {
    sku: "118",
    shopId: null,
    familyId: "cap",
    name: "Trucker-Caps",
    shop_live: false,
  },
  "119": {
    sku: "119",
    shopId: null,
    familyId: "cap",
    name: "5-Panel-Caps",
    shop_live: false,
  },
  "120": {
    sku: "120",
    shopId: null,
    familyId: "cap",
    name: "Sportcaps",
    shop_live: false,
  },
  "121": {
    sku: "121",
    shopId: null,
    familyId: "cap",
    name: "Kindercaps",
    shop_live: false,
  },
  "122": {
    sku: "122",
    shopId: null,
    familyId: "visor",
    name: "Visors",
    shop_live: false,
  },
  "123": {
    sku: "123",
    shopId: null,
    familyId: "plate",
    name: "Runde Sublimationsteller",
    shop_live: false,
  },
  "124": {
    sku: "124",
    shopId: null,
    familyId: "plate",
    name: "Kleine Dekorationsteller",
    shop_live: false,
  },
  "125": {
    sku: "125",
    shopId: null,
    familyId: "plate",
    name: "Große Dekorationsteller",
    shop_live: false,
  },
  "126": {
    sku: "126",
    shopId: null,
    familyId: "plate",
    name: "Unterteller",
    shop_live: false,
  },
  "127": {
    sku: "127",
    shopId: null,
    familyId: "pen",
    name: "Kugelschreiber",
    shop_live: false,
  },
  "128": {
    sku: "128",
    shopId: null,
    familyId: "pen",
    name: "Werbestifte",
    shop_live: false,
  },
  "129": {
    sku: "129",
    shopId: null,
    familyId: "pen",
    name: "Schreibgeräte hitzefest",
    shop_live: false,
  },
  "130": {
    sku: "130",
    shopId: null,
    familyId: "shoe",
    name: "Polyester-Sneaker",
    shop_live: false,
  },
  "131": {
    sku: "131",
    shopId: null,
    familyId: "shoe",
    name: "Leichte Stoffschuhe",
    shop_live: false,
  },
  "132": {
    sku: "132",
    shopId: null,
    familyId: "shoe",
    name: "Schuhoberteile",
    shop_live: false,
  },
  "133": {
    sku: "133",
    shopId: null,
    familyId: "shoe",
    name: "Schuhzungen",
    shop_live: false,
  },
  "001": {
    sku: "001",
    shopId: "1",
    familyId: "tee",
    name: "Unisex-T-Shirts",
    shop_live: true,
  },
  "002": {
    sku: "002",
    shopId: null,
    familyId: "tee",
    name: "Damen-T-Shirts",
    shop_live: false,
  },
  "003": {
    sku: "003",
    shopId: null,
    familyId: "tee",
    name: "Herren-T-Shirts",
    shop_live: false,
  },
  "004": {
    sku: "004",
    shopId: null,
    familyId: "tee",
    name: "Kinder-T-Shirts",
    shop_live: false,
  },
  "005": {
    sku: "005",
    shopId: null,
    familyId: "body",
    name: "Baby-Bodys",
    shop_live: false,
  },
  "006": {
    sku: "006",
    shopId: null,
    familyId: "tank",
    name: "Tanktops",
    shop_live: false,
  },
  "007": {
    sku: "007",
    shopId: null,
    familyId: "polo",
    name: "Poloshirts",
    shop_live: false,
  },
  "008": {
    sku: "008",
    shopId: null,
    familyId: "longsleeve",
    name: "Langarmshirts",
    shop_live: false,
  },
  "009": {
    sku: "009",
    shopId: null,
    familyId: "jersey",
    name: "Sporttrikots",
    shop_live: false,
  },
  "010": {
    sku: "010",
    shopId: null,
    familyId: "jersey",
    name: "Basketballtrikots",
    shop_live: false,
  },
  "011": {
    sku: "011",
    shopId: null,
    familyId: "jersey",
    name: "Fußballtrikots",
    shop_live: false,
  },
  "012": {
    sku: "012",
    shopId: null,
    familyId: "tee",
    name: "Laufshirts",
    shop_live: false,
  },
  "013": {
    sku: "013",
    shopId: null,
    familyId: "tank",
    name: "Fitness-Tops",
    shop_live: false,
  },
  "014": {
    sku: "014",
    shopId: null,
    familyId: "bra",
    name: "Sport-BHs",
    shop_live: false,
  },
  "015": {
    sku: "015",
    shopId: "2",
    familyId: "shorts",
    name: "Shorts",
    shop_live: true,
  },
  "016": {
    sku: "016",
    shopId: null,
    familyId: "pants",
    name: "Sporthosen",
    shop_live: false,
  },
  "017": {
    sku: "017",
    shopId: null,
    familyId: "pants",
    name: "Jogginghosen",
    shop_live: false,
  },
  "018": {
    sku: "018",
    shopId: null,
    familyId: "leggings",
    name: "Leggings",
    shop_live: false,
  },
  "019": {
    sku: "019",
    shopId: null,
    familyId: "leggings",
    name: "Radlerhosen",
    shop_live: false,
  },
  "020": {
    sku: "020",
    shopId: null,
    familyId: "jacket",
    name: "Trainingsjacken",
    shop_live: false,
  },
  "021": {
    sku: "021",
    shopId: null,
    familyId: "hoodie",
    name: "Hoodies",
    shop_live: false,
  },
  "022": {
    sku: "022",
    shopId: null,
    familyId: "hoodie",
    name: "Sweatshirts",
    shop_live: false,
  },
  "023": {
    sku: "023",
    shopId: null,
    familyId: "tee",
    name: "Unterhemden",
    shop_live: false,
  },
  "024": {
    sku: "024",
    shopId: null,
    familyId: "socks",
    name: "Polyester-Socken",
    shop_live: false,
  },
  "025": {
    sku: "025",
    shopId: null,
    familyId: "soft-head",
    name: "Stirnbänder",
    shop_live: false,
  },
  "026": {
    sku: "026",
    shopId: null,
    familyId: "soft-head",
    name: "Schweißbänder",
    shop_live: false,
  },
  "027": {
    sku: "027",
    shopId: null,
    familyId: "soft-head",
    name: "Bandanas",
    shop_live: false,
  },
  "028": {
    sku: "028",
    shopId: null,
    familyId: "soft-head",
    name: "Schlauchtücher",
    shop_live: false,
  },
  "029": {
    sku: "029",
    shopId: null,
    familyId: "soft-head",
    name: "Halstücher",
    shop_live: false,
  },
  "030": {
    sku: "030",
    shopId: null,
    familyId: "soft-head",
    name: "Polyester-Schals",
    shop_live: false,
  },
  "031": {
    sku: "031",
    shopId: null,
    familyId: "patch",
    name: "Stoff-Aufnäher / Patches",
    shop_live: false,
  },
  "032": {
    sku: "032",
    shopId: null,
    familyId: "tote",
    name: "Stofftragetaschen",
    shop_live: false,
  },
  "033": {
    sku: "033",
    shopId: null,
    familyId: "tote",
    name: "Einkaufstaschen / Shopper",
    shop_live: false,
  },
  "034": {
    sku: "034",
    shopId: null,
    familyId: "drawstring",
    name: "Turnbeutel",
    shop_live: false,
  },
  "035": {
    sku: "035",
    shopId: null,
    familyId: "drawstring",
    name: "Sportbeutel",
    shop_live: false,
  },
  "036": {
    sku: "036",
    shopId: null,
    familyId: "sportbag",
    name: "Kleine Sporttaschen",
    shop_live: false,
  },
  "037": {
    sku: "037",
    shopId: null,
    familyId: "pouch",
    name: "Kosmetiktaschen",
    shop_live: false,
  },
  "038": {
    sku: "038",
    shopId: null,
    familyId: "pouch",
    name: "Kulturbeutel",
    shop_live: false,
  },
  "039": {
    sku: "039",
    shopId: null,
    familyId: "pouch",
    name: "Federmäppchen",
    shop_live: false,
  },
  "040": {
    sku: "040",
    shopId: null,
    familyId: "pouch",
    name: "Stiftemäppchen",
    shop_live: false,
  },
  "041": {
    sku: "041",
    shopId: null,
    familyId: "pouch",
    name: "Kleine Geldbörsen",
    shop_live: false,
  },
  "042": {
    sku: "042",
    shopId: null,
    familyId: "pouch",
    name: "Brillenetuis",
    shop_live: false,
  },
  "043": {
    sku: "043",
    shopId: null,
    familyId: "laptop",
    name: "Laptop-Hüllen",
    shop_live: false,
  },
  "044": {
    sku: "044",
    shopId: null,
    familyId: "pouch",
    name: "Tablet-Hüllen",
    shop_live: false,
  },
  "045": {
    sku: "045",
    shopId: null,
    familyId: "pouch",
    name: "Dokumententaschen",
    shop_live: false,
  },
  "046": {
    sku: "046",
    shopId: null,
    familyId: "pouch",
    name: "Reisepasshüllen",
    shop_live: false,
  },
  "047": {
    sku: "047",
    shopId: null,
    familyId: "pouch",
    name: "Kofferanhänger",
    shop_live: false,
  },
  "048": {
    sku: "048",
    shopId: null,
    familyId: "patch",
    name: "Schlüsselbänder / Lanyards",
    shop_live: false,
  },
  "049": {
    sku: "049",
    shopId: null,
    familyId: "hard-small",
    name: "Schlüsselanhänger Polyester",
    shop_live: false,
  },
  "050": {
    sku: "050",
    shopId: null,
    familyId: "pouch",
    name: "Kartenetuis",
    shop_live: false,
  },
  "051": {
    sku: "051",
    shopId: null, // WAVE 6.4: shopId='3' only after Jonny price + jonnyOk gate
    familyId: "pillow", // WAVE 6.3: now uses pillow family
    name: "Dekokissenbezüge",
    shop_live: false, // WAVE 6.4: stays false until gate opens
  },
  "052": {
    sku: "052",
    shopId: null,
    familyId: "pillow",
    name: "Kopfkissenbezüge",
    shop_live: false,
  },
  "053": {
    sku: "053",
    shopId: null,
    familyId: "pillow",
    name: "Zierkissenbezüge",
    shop_live: false,
  },
  "054": {
    sku: "054",
    shopId: null,
    familyId: "towel",
    name: "Polyester-Küchentücher",
    shop_live: false,
  },
  "055": {
    sku: "055",
    shopId: null,
    familyId: "towel",
    name: "Geschirrtücher",
    shop_live: false,
  },
  "056": {
    sku: "056",
    shopId: null,
    familyId: "towel",
    name: "Sporthandtücher Mikrofaser",
    shop_live: false,
  },
  "057": {
    sku: "057",
    shopId: null,
    familyId: "towel",
    name: "Gästehandtücher",
    shop_live: false,
  },
  "058": {
    sku: "058",
    shopId: null,
    familyId: "table-textile",
    name: "Tischsets",
    shop_live: false,
  },
  "059": {
    sku: "059",
    shopId: null,
    familyId: "table-textile",
    name: "Tischläufer",
    shop_live: false,
  },
  "060": {
    sku: "060",
    shopId: null,
    familyId: "table-textile",
    name: "Stoffservietten",
    shop_live: false,
  },
  "061": {
    sku: "061",
    shopId: null,
    familyId: "table-textile",
    name: "Kleine Tischdecken",
    shop_live: false,
  },
  "062": {
    sku: "062",
    shopId: null,
    familyId: "apron",
    name: "Küchen- und Grillschürzen",
    shop_live: false,
  },
  "063": {
    sku: "063",
    shopId: null,
    familyId: "potholder",
    name: "Topflappen",
    shop_live: false,
  },
  "064": {
    sku: "064",
    shopId: null,
    familyId: "coaster",
    name: "Untersetzer MDF",
    shop_live: false,
  },
  "065": {
    sku: "065",
    shopId: null,
    familyId: "coaster",
    name: "Untersetzer Kork",
    shop_live: false,
  },
  "066": {
    sku: "066",
    shopId: null,
    familyId: "coaster",
    name: "Untersetzer Aluminium",
    shop_live: false,
  },
  "067": {
    sku: "067",
    shopId: null,
    familyId: "panel",
    name: "Kleine Wandbilder Aluminium",
    shop_live: false,
  },
  "068": {
    sku: "068",
    shopId: null,
    familyId: "panel",
    name: "Fotoschilder",
    shop_live: false,
  },
  "069": {
    sku: "069",
    shopId: null,
    familyId: "panel",
    name: "Sublimations-Fotopaneele",
    shop_live: false,
  },
  "070": {
    sku: "070",
    shopId: null,
    familyId: "panel",
    name: "Dekorative MDF-Schilder",
    shop_live: false,
  },
  "071": {
    sku: "071",
    shopId: null,
    familyId: "panel",
    name: "Türschilder",
    shop_live: false,
  },
  "072": {
    sku: "072",
    shopId: null,
    familyId: "panel",
    name: "Namensschilder",
    shop_live: false,
  },
  "073": {
    sku: "073",
    shopId: null,
    familyId: "panel",
    name: "Tischschilder",
    shop_live: false,
  },
  "074": {
    sku: "074",
    shopId: null,
    familyId: "clock",
    name: "Wanduhrenrohlinge",
    shop_live: false,
  },
  "075": {
    sku: "075",
    shopId: null,
    familyId: "flag",
    name: "Kleine Dekofahnen",
    shop_live: false,
  },
  "076": {
    sku: "076",
    shopId: null,
    familyId: "flag",
    name: "Wimpel",
    shop_live: false,
  },
  "077": {
    sku: "077",
    shopId: null,
    familyId: "flag",
    name: "Kleine Stoffbanner",
    shop_live: false,
  },
  "078": {
    sku: "078",
    shopId: null,
    familyId: "mousepad",
    name: "Mauspads",
    shop_live: false,
  },
  "079": {
    sku: "079",
    shopId: null,
    familyId: "mousepad",
    name: "Gaming-Mauspads",
    shop_live: false,
  },
  "080": {
    sku: "080",
    shopId: null,
    familyId: "mousepad",
    name: "Schreibtischunterlagen",
    shop_live: false,
  },
  "081": {
    sku: "081",
    shopId: null,
    familyId: "phone",
    name: "Handyhüllen",
    shop_live: false,
  },
  "082": {
    sku: "082",
    shopId: null,
    familyId: "hard-small",
    name: "Schlüsselanhänger Metall",
    shop_live: false,
  },
  "083": {
    sku: "083",
    shopId: null,
    familyId: "hard-small",
    name: "Schlüsselanhänger MDF",
    shop_live: false,
  },
  "084": {
    sku: "084",
    shopId: null,
    familyId: "hard-small",
    name: "Kühlschrankmagnete",
    shop_live: false,
  },
  "085": {
    sku: "085",
    shopId: null,
    familyId: "hard-small",
    name: "Flaschenöffner",
    shop_live: false,
  },
  "086": {
    sku: "086",
    shopId: null,
    familyId: "hard-small",
    name: "Lesezeichen Aluminium",
    shop_live: false,
  },
  "087": {
    sku: "087",
    shopId: null,
    familyId: "puzzle",
    name: "Foto-Puzzles bis A4",
    shop_live: false,
  },
  "088": {
    sku: "088",
    shopId: null,
    familyId: "coaster",
    name: "Untersetzer-Sets",
    shop_live: false,
  },
  "089": {
    sku: "089",
    shopId: null,
    familyId: "hard-small",
    name: "Visitenkarten Metall",
    shop_live: false,
  },
  "090": {
    sku: "090",
    shopId: null,
    familyId: "hard-small",
    name: "Kleine Ausweisschilder",
    shop_live: false,
  },
  "091": {
    sku: "091",
    shopId: null,
    familyId: "hard-small",
    name: "Namensplaketten",
    shop_live: false,
  },
  "092": {
    sku: "092",
    shopId: null,
    familyId: "notebook",
    name: "Notizbücher",
    shop_live: false,
  },
  "093": {
    sku: "093",
    shopId: null,
    familyId: "panel",
    name: "Dekorative Fototafeln",
    shop_live: false,
  },
  "094": {
    sku: "094",
    shopId: null,
    familyId: "hard-small",
    name: "Weihnachtsanhänger",
    shop_live: false,
  },
  "095": {
    sku: "095",
    shopId: null,
    familyId: "hard-small",
    name: "Weihnachtsbaum-Ornamente",
    shop_live: false,
  },
  "096": {
    sku: "096",
    shopId: null,
    familyId: "hard-small",
    name: "Geschenkanhänger",
    shop_live: false,
  },
  "097": {
    sku: "097",
    shopId: null,
    familyId: "hard-small",
    name: "Hundemarken",
    shop_live: false,
  },
  "098": {
    sku: "098",
    shopId: null,
    familyId: "hard-small",
    name: "Haustier-Namensschilder",
    shop_live: false,
  },
  "099": {
    sku: "099",
    shopId: null,
    familyId: "hard-small",
    name: "Kleine Bilderrahmen",
    shop_live: false,
  },
};

/**
 * Get family by shopId (for runtime lookup)
 */
export function getFamilyByShopId(shopId: string): ProductFamily | null {
  const record = Object.values(CATALOG).find((r) => r.shopId === shopId);
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
  return Object.values(PRODUCT_FAMILIES).filter((f) => f.shop_live);
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
  return Object.values(CATALOG).find((r) => r.shopId === shopId) || null;
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

/** Katalog-Kategorie aus der SKU. Bereiche sind lückenlos: A001–031 … I130–133. */
export function categoryForSku(
  sku: string,
): "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | null {
  const n = Number(sku);
  if (!Number.isInteger(n)) return null;
  if (n >= 1 && n <= 31) return "A";
  if (n >= 32 && n <= 50) return "B";
  if (n >= 51 && n <= 77) return "C";
  if (n >= 78 && n <= 101) return "D";
  if (n >= 102 && n <= 116) return "E";
  if (n >= 117 && n <= 122) return "F";
  if (n >= 123 && n <= 126) return "G";
  if (n >= 127 && n <= 129) return "H";
  if (n >= 130 && n <= 133) return "I";
  return null;
}
