/* eslint-disable */
import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "lib/products-all-133.ts");
let content = fs.readFileSync(filePath, "utf-8");

// Regex um hasGLB und hasPhoto Zeilen zu finden
const lines = content.split("\n");
const newLines = [];
let currentSKU = "";

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // SKU erkennen
  if (line.includes("sku: '")) {
    const match = line.match(/sku: '(\d+)'/);
    if (match) currentSKU = match[1];
  }

  // hasGLB korrigieren - nur 001 und 015 haben GLB
  if (line.includes("hasGLB:")) {
    const shouldHaveGLB = currentSKU === "001" || currentSKU === "015";
    newLines.push(
      line.replace(/hasGLB: (true|false)/, `hasGLB: ${shouldHaveGLB}`),
    );
    continue;
  }

  // hasPhoto korrigieren - nur 001 und 015 haben echte Fotos
  if (line.includes("hasPhoto:")) {
    const shouldHavePhoto = currentSKU === "001" || currentSKU === "015";
    newLines.push(
      line.replace(/hasPhoto: (true|false)/, `hasPhoto: ${shouldHavePhoto}`),
    );
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join("\n"));
console.log("✅ Fixed hasGLB and hasPhoto flags!");
console.log("   - hasGLB: true only for 001, 015");
console.log("   - hasPhoto: true only for 001, 015");
