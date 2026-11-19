import * as fs from "node:fs";

const csvPath = new URL("../lib/catalog/produkte_133_komplett.csv", import.meta.url);
const outputPath = new URL("../lib/products-all-133.ts", import.meta.url);

// SKU → Shop-ID Mapping
const SKU_TO_SHOP_ID = {
  "001": "1", // T-Shirt
  "015": "2", // Shorts
};

function parseCSV(csvContent) {
  const [header, ...lines] = csvContent.trim().split(/\r?\n/);
  const headers = header.split(",");
  const required = "sku,name,category,family,blank,preis_vk,status,printShape,machbarkeit,hasGLB,hasPhoto,weightGsm,sides";
  if (header !== required) throw new Error("Unexpected catalog CSV columns");

  const seen = new Set();
  const products = lines.map((line) => {
    // shortcut: one line per SKU and no embedded commas, use a CSV parser when fields require either.
    const values = line.split(",").map((value) => value.replace(/^"|"$/g, ""));
    if (values.length !== headers.length) throw new Error("Invalid catalog CSV row");
    const product = Object.fromEntries(headers.map((key, i) => [key, values[i]]));
    if (
      !/^\d{3}$/.test(product.sku) ||
      Number(product.sku) < 1 ||
      Number(product.sku) > 133 ||
      seen.has(product.sku)
    ) {
      throw new Error(`Invalid or duplicate SKU: ${product.sku}`);
    }
    seen.add(product.sku);
    if (!/^\d*(?:\.\d+)?$/.test(product.preis_vk) || !/^\d+$/.test(product.weightGsm)) {
      throw new Error(`Invalid price or weight for SKU ${product.sku}`);
    }
    if (
      !/^[A-I]$/.test(product.category) ||
      !/^(shop_live|anker|pilot|offen|pruefen)$/.test(product.status) ||
      ![product.hasGLB, product.hasPhoto].every((value) => /^(true|false)$/.test(value))
    ) {
      throw new Error(`Invalid category, status or asset flag for SKU ${product.sku}`);
    }
    return product;
  });
  if (products.length !== 133) throw new Error("Expected 133 catalog products");
  return products;
}

function escapeString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function generateProductName(name) {
  const nameMap = {
    "Unisex-T-Shirts": {
      de: "Unisex-T-Shirts",
      ro: "Tricouri Unisex",
      en: "Unisex T-Shirts",
    },
    Shorts: { de: "Shorts", ro: "Pantaloni Scurți", en: "Shorts" },
  };

  return nameMap[name] || { de: name, ro: name, en: name };
}

function generateTypeScript(products) {
  let ts = `// AUTO-GENERATED - Alle 133 Produkte
// Generiert aus: produkte_133_komplett.csv
// NICHT MANUELL BEARBEITEN - Änderungen über CSV + npm run generate:products

import { Locale } from './i18n';

export type ProductStatus = 'shop_live' | 'anker' | 'pilot' | 'offen' | 'pruefen';
export type Category = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

export interface Product133 {
  sku: string;
  id: string;
  name: Record<Locale, string>;
  category: Category;
  family: string;
  blank: string;
  price: number;
  status: ProductStatus;
  printShape: string;
  machbarkeit: string;
  hasGLB: boolean;
  hasPhoto: boolean;
  weightGsm: number;
  sides: string;
}

export const PRODUCTS_133: Product133[] = [\n`;

  products.forEach((p, index) => {
    const names = generateProductName(p.name);
    // Verwende Mapping für korrekte Shop-IDs
    const id = SKU_TO_SHOP_ID[p.sku] || "";

    ts += `  {
    sku: '${p.sku}',
    id: '${id}',
    name: { de: '${escapeString(names.de)}', ro: '${escapeString(names.ro)}', en: '${escapeString(names.en)}' },
    category: '${escapeString(p.category)}' as Category,
    family: '${escapeString(p.family)}',
    blank: '${escapeString(p.blank)}',
    price: ${Number(p.preis_vk)},
    status: '${escapeString(p.status)}' as ProductStatus,
    printShape: '${escapeString(p.printShape)}',
    machbarkeit: '${escapeString(p.machbarkeit)}',
    hasGLB: ${p.hasGLB === "true"},
    hasPhoto: ${p.hasPhoto === "true"},
    weightGsm: ${p.weightGsm},
    sides: '${escapeString(p.sides)}'
  }${index < products.length - 1 ? "," : ""}\n`;
  });

  ts += `];\n\nexport function getProductBySKU(sku: string): Product133 | undefined {
  return PRODUCTS_133.find(p => p.sku === sku);
}

export function getProductsByCategory(category: Category): Product133[] {
  return PRODUCTS_133.filter(p => p.category === category);
}

export function getLiveProducts(): Product133[] {
  return PRODUCTS_133.filter(p => p.status === 'shop_live');
}

export function getAllProducts(): Product133[] {
  return PRODUCTS_133;
}
`;

  return ts;
}

// Main
try {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const products = parseCSV(csvContent);
  const tsContent = generateTypeScript(products);

  if (process.argv.includes("--check")) {
    if (fs.readFileSync(outputPath, "utf-8") !== tsContent) {
      throw new Error("Catalog is stale. Run npm run generate:products.");
    }
  } else {
    fs.writeFileSync(outputPath, tsContent);
  }
  console.log(`Validated ${products.length} catalog products`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
