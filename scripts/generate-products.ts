import * as fs from 'fs';
import * as path from 'path';

// CSV zu TypeScript Converter für alle 133 Produkte
const csvPath = '/home/jonny/Downloads/ON-ME-HoneyB-133/register/produkte_133_komplett.csv';
const outputPath = path.join(process.cwd(), 'lib/products-all-133.ts');

interface CSVProduct {
  sku: string;
  name: string;
  category: string;
  family: string;
  blank: string;
  preis_vk: string;
  status: string;
  printShape: string;
  machbarkeit: string;
  hasGLB: string;
  hasPhoto: string;
  weightGsm: string;
  sides: string;
}

function parseCSV(csvContent: string): CSVProduct[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const product: any = {};
    headers.forEach((header, i) => {
      product[header] = values[i]?.replace(/^"|"$/g, '');
    });
    return product as CSVProduct;
  });
}

function generateProductName(name: string) {
  // Einfache DE/RO/EN Namen generieren
  const nameMap: Record<string, {de: string, ro: string, en: string}> = {
    'Unisex-T-Shirts': {de: 'Unisex-T-Shirts', ro: 'Tricouri Unisex', en: 'Unisex T-Shirts'},
    'Shorts': {de: 'Shorts', ro: 'Pantaloni Scurți', en: 'Shorts'},
    // Fallback: gleicher Name in allen Sprachen
  };

  return nameMap[name] || {de: name, ro: name, en: name};
}

function generateTypeScript(products: CSVProduct[]): string {
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
    const id = p.status === 'shop_live' ? p.sku : '';

    ts += `  {
    sku: '${p.sku}',
    id: '${id}',
    name: { de: '${names.de}', ro: '${names.ro}', en: '${names.en}' },
    category: '${p.category}' as Category,
    family: '${p.family}',
    blank: '${p.blank}',
    price: ${p.preis_vk},
    status: '${p.status}' as ProductStatus,
    printShape: '${p.printShape}',
    machbarkeit: '${p.machbarkeit}',
    hasGLB: ${p.hasGLB === 'true'},
    hasPhoto: ${p.hasPhoto === 'true'},
    weightGsm: ${p.weightGsm},
    sides: '${p.sides}'
  }${index < products.length - 1 ? ',' : ''}\n`;
  });

  ts += `];\n\n`;

  // Helper functions
  ts += `export function getProductBySKU(sku: string): Product133 | undefined {
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
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const products = parseCSV(csvContent);
  const tsContent = generateTypeScript(products);

  fs.writeFileSync(outputPath, tsContent);
  console.log(`✅ Generated ${products.length} products to ${outputPath}`);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
