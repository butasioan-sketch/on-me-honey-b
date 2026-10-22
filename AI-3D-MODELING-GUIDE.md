# AI-UNTERSTÜTZTE 3D-MODELL-ERSTELLUNG
## ON ME HONEY B — T-Shirt & Shorts GLB-Generierung

**Datum:** 22. Oktober 2026  
**Ziel:** Hochwertige, weiße 3D-Modelle für beide Produkte mit AI-Tools erstellen

---

## 🎯 WAS WIR ERREICHEN WOLLEN

1. ✅ **T-Shirt GLB** — realistisches Unisex-T-Shirt (James & Nicholson JN827-Style)
2. ✅ **Shorts GLB** — realistische Sport-Shorts (James & Nicholson JN387-Style)
3. ✅ **Weiße Meshes** — für Decal-System (Kundenmotive werden aufgelegt)
4. ✅ **Optimiert** — <1MB pro Modell, Web-optimiert, schnelles Laden

---

## 🤖 OPTION 1: GROK + BLENDER (Code-Generierung)

### Was Grok kann:
- ✅ **Blender Python Scripts schreiben** für automatische Mesh-Generierung
- ✅ **Optimization Scripts** für GLB-Dateien
- ✅ **Workflow Automation** (Batch-Processing, Testing)
- ✅ **Integration Code** für AI-3D-APIs (Meshy, Rodin, etc.)

### Beispiel: Grok um Code bitten

**Prompt für Grok:**
```
Schreibe ein Blender Python Script, das:
1. Ein realistisches Unisex T-Shirt Mesh erstellt
2. Weißes Principled BSDF Material zuweist
3. Mesh auf 1.0 unit height normalisiert
4. Als GLB exportiert

Anforderungen:
- Subdivision Surface für Smoothness
- Cleanups (Remove Doubles, Recalculate Normals)
- Optimiert für WebGL/Three.js
```

**Grok wird zurückgeben:** Einen ähnlichen Code wie in `scripts/generate-product-glb.py`

### Verwendung:

```bash
# 1. Grok-generierten Code in Datei speichern
# 2. Mit Blender ausführen:
blender --background --python scripts/generate-product-glb.py -- \
  --product tshirt \
  --output public/models/shirt-white-v3.glb

# Oder mit Input-Mesh:
blender --background --python scripts/generate-product-glb.py -- \
  --input ~/Downloads/tshirt-model.glb \
  --output public/models/shirt-white-v3.glb
```

---

## 🎨 OPTION 2: AI 3D GENERATION TOOLS (Empfohlen!)

### A) **Meshy.ai** ⭐ BESTE OPTION

**Vorteile:**
- Text-zu-3D: "White unisex t-shirt, simple clean geometry, polyester fabric"
- Bild-zu-3D: Lade Produktfotos hoch
- API verfügbar (automatisierbar)
- Hochwertige Meshes

**Workflow:**

1. **Account erstellen:** https://www.meshy.ai
2. **Text-zu-3D verwenden:**
   ```
   Prompt: "White unisex t-shirt, crew neck, short sleeves, 
           simple clean geometry, suitable for sublimation printing,
           centered at origin, polyester fabric appearance"
   
   Settings:
   - Style: Realistic
   - Topology: Quad-based (besser für Subdivision)
   - Export: GLB
   ```

3. **Download GLB:**
   ```bash
   # Nach Download:
   cp ~/Downloads/meshy-tshirt.glb ~/Schreibtisch/on-me-honey-b/public/models/
   
   # Optimieren:
   cd ~/Schreibtisch/on-me-honey-b
   npm run optimize-glb -- ~/Downloads/meshy-tshirt.glb public/models/shirt-white-v3.glb
   ```

4. **Im Code einbinden:**
   ```typescript
   // app/components/Shirt3D.tsx
   const MODEL_PATHS: Record<string, string> = {
     '1': '/models/shirt-white-v3.glb',  // NEU von Meshy
     '2': '/models/shorts-white-v1.glb',
   };
   ```

### B) **Spline AI** (Browser-basiert)

**Vorteile:**
- Direkt im Browser
- Real-time Preview
- Einfach zu bedienen

**Workflow:**

1. **Öffne:** https://spline.design
2. **AI Generate verwenden:**
   ```
   "Create a white unisex t-shirt 3D model"
   ```
3. **Export als GLB**
4. **Optimieren mit unserem Script**

### C) **Rodin AI** (Hochqualität)

**Vorteile:**
- Sehr hochwertige Modelle
- Gute Detail-Erhaltung

**Workflow:**

1. **Öffne:** https://hyperhuman.deemos.com/rodin
2. **Upload Referenzbild** oder Text-Prompt
3. **Generiere 3D-Modell**
4. **Download + Optimieren**

---

## 🔧 OPTION 3: MARKETPLACE (KAUFEN)

### Fab.com (ehem. TurboSquid)

**Bereits erwähnt in GLB-WORKFLOW.md:**

```
Men Soccer Athletic Shorts
https://www.fab.com/listings/f222155f-5896-43cc-9973-18122b61bb65
Preis: ~$10-30
Qualität: Professionell, photorealistisch
```

**Workflow:**
1. Kaufen & Download
2. Optimieren:
   ```bash
   npm run make-shop-glb -- ~/Downloads/fab-shorts.glb public/models/shorts-white-v2.glb
   ```
3. Kamera kalibrieren (siehe GLB-WORKFLOW.md)

---

## 📋 KOMPLETTER WORKFLOW: MESHY.AI → SHOP

### Schritt-für-Schritt Anleitung

#### 1. **AI-Generierung (Meshy.ai)**

**Für T-Shirt:**
```
Prompt: "Professional 3D model of a white unisex crew neck t-shirt, 
         short sleeves, simple clean geometry, suitable for texture mapping, 
         centered at world origin, smooth polyester fabric appearance, 
         no wrinkles, studio lighting ready"

Style: Realistic
Topology: Quad mesh
Format: GLB
```

**Für Shorts:**
```
Prompt: "Professional 3D model of white unisex athletic shorts, 
         elastic waistband, drawstring, side seams, suitable for 
         sublimation printing, centered at origin, polyester fabric, 
         clean geometry"

Style: Realistic  
Topology: Quad mesh
Format: GLB
```

#### 2. **Download & Vorbereitung**

```bash
cd ~/Schreibtisch/on-me-honey-b

# Backup alte Version
cp public/models/shirt-white-v2.glb public/models/library/inactive/shirt-white-v2-backup-$(date +%Y%m%d).glb

# Neue Datei von Meshy
mv ~/Downloads/meshy-tshirt-*.glb ~/tmp-tshirt-meshy.glb
```

#### 3. **Mit Blender optimieren**

```bash
# Option A: Mit unserem make-shop-glb Script
npm run make-shop-glb -- ~/tmp-tshirt-meshy.glb public/models/shirt-white-v3.glb

# Option B: Nur optimieren (wenn schon weiß)
npm run optimize-glb -- ~/tmp-tshirt-meshy.glb public/models/shirt-white-v3.glb
```

#### 4. **Inspektion**

```bash
# Prüfe das neue Modell
gltf-transform inspect public/models/shirt-white-v3.glb

# Output sollte zeigen:
# - Vertices: 1000-5000 (optimal für Web)
# - Triangles: 2000-10000
# - Materials: 1 (weiß)
# - File size: <1MB
```

#### 5. **Code aktualisieren**

```typescript
// app/components/Shirt3D.tsx
const MODEL_PATHS: Record<string, string> = {
  '1': '/models/shirt-white-v3.glb',  // ← NEUE VERSION
  '2': '/models/shorts-white-v1.glb',
};

// Preload
useGLTF.preload('/models/shirt-white-v3.glb');  // ← NEUE VERSION
```

#### 6. **Kamera kalibrieren**

```bash
# Dev-Server starten
npm run dev

# Browser öffnen
open http://localhost:3000/product/1

# In Browser Console schauen:
# "[Shirt3D] product 1 ... bbox: ..."
```

**Kamera anpassen in `Shirt3D.tsx`:**
```typescript
function getCamera(productId: string) {
  if (productId === '1') {  // T-Shirt
    return {
      cameraPos: [0, 0.05, 1.7] as [number, number, number],
      orbitTarget: [0, 0, 0] as [number, number, number],
      minDistance: 0.5,
      maxDistance: 4.0,
      fov: 40,
    };
  }
  // ... (anpassen basierend auf Console Output)
}
```

#### 7. **Testen**

```bash
# Playwright Test
npx playwright test tests/e2e/visual-quality.spec.ts --project=chromium --grep "3D"

# Manuell testen:
# 1. Produkt öffnen: http://localhost:3000/product/1
# 2. Design hochladen
# 3. Zum 360°-Tab wechseln
# 4. Prüfen:
#    - Mesh ist weiß
#    - Mesh ist zentriert
#    - Rotation funktioniert
#    - Design (Decal) ist sichtbar
```

#### 8. **Deploy**

```bash
# Commit
git add public/models/shirt-white-v3.glb app/components/Shirt3D.tsx
git commit -m "feat: Update T-Shirt 3D model to v3 (Meshy.ai generated)

- Higher quality mesh from Meshy.ai
- Better topology for smooth rendering  
- Optimized for WebGL performance
- File size: XXX KB

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push (nur wenn Jonny approved!)
# git push origin main
```

---

## 🎨 DESIGN-ANFORDERUNGEN FÜR AI-PROMPTS

### Wichtige Details für AI-Generierung:

**T-Shirt (James & Nicholson JN827-Style):**
- ✅ Rundhals-Ausschnitt (Crew Neck)
- ✅ Kurze Ärmel
- ✅ Gerade Passform (Regular Fit)
- ✅ Saum am unteren Ende
- ✅ **KEINE** sichtbaren Nähte (vereinfacht)
- ✅ **WEISS** (keine Textur)

**Shorts (James & Nicholson JN387-Style):**
- ✅ Elastischer Bund mit Kordelzug
- ✅ Seitentaschen (optional, können weggelassen werden)
- ✅ Gerade Beinöffnungen
- ✅ Mittellange Beinlänge (ca. bis über Knie)
- ✅ **WEISS** (keine Textur)
- ✅ **KEINE** innere Fütterung

---

## 📊 VERGLEICH DER OPTIONEN

| Methode | Qualität | Zeit | Kosten | Automation |
|---------|----------|------|--------|------------|
| **Meshy.ai** | ⭐⭐⭐⭐⭐ | 5-10 Min | $0-20/Monat | ✅ API |
| **Spline AI** | ⭐⭐⭐⭐ | 10 Min | Kostenlos | ❌ |
| **Rodin AI** | ⭐⭐⭐⭐⭐ | 10-15 Min | $20-50/Monat | ✅ API |
| **Fab.com Kauf** | ⭐⭐⭐⭐⭐ | 1 Min | $10-30 einmalig | ❌ |
| **Blender Manual** | ⭐⭐⭐⭐⭐ | 2-4 Std | Kostenlos | ⚠️ Komplex |
| **Grok + Blender** | ⭐⭐⭐ | 30 Min | Kostenlos | ✅ Code |

**EMPFEHLUNG:** Meshy.ai für schnelle, hochwertige Ergebnisse

---

## 🚀 SCHNELLSTART MIT MESHY.AI

```bash
# 1. Account erstellen
open https://www.meshy.ai

# 2. Text-zu-3D starten
# Prompt: "White unisex t-shirt, crew neck, short sleeves"

# 3. Download GLB

# 4. Optimieren & Einbinden
cd ~/Schreibtisch/on-me-honey-b
npm run make-shop-glb -- ~/Downloads/meshy-*.glb public/models/shirt-white-v3.glb

# 5. Code updaten (siehe oben)

# 6. Testen
npm run dev
open http://localhost:3000/product/1

# 7. Wenn gut → Commit + Deploy
```

---

## ❓ FAQ

### F: Kann Grok direkt 3D-Modelle erstellen?
**A:** Nein, aber Grok kann:
- Python/Blender Scripts schreiben
- Integration mit 3D-APIs programmieren
- Workflow automatisieren
- Code für prozedurale Generierung erstellen

### F: Was ist die beste Option?
**A:** **Meshy.ai** für Production-Quality + Geschwindigkeit

### F: Muss ich Blender installieren?
**A:** Ja, für `make-shop-glb` Script. Alternativ: nur AI-Tool nutzen + gltf-transform CLI

### F: Wie teste ich ob 3D-Modell funktioniert?
**A:** 
1. Dev-Server: `npm run dev`
2. Browser: http://localhost:3000/product/1
3. Tab "360°" öffnen
4. Mesh sollte weiß, zentriert und drehbar sein

### F: Welche Dateigröße ist ok?
**A:** 
- ✅ Optimal: <500KB
- ⚠️ Akzeptabel: 500KB - 1MB
- ❌ Zu groß: >1MB (optimieren!)

---

## 📞 SUPPORT & RESSOURCEN

**Tools:**
- Meshy.ai: https://www.meshy.ai
- Spline AI: https://spline.design
- Rodin AI: https://hyperhuman.deemos.com/rodin
- Fab.com: https://www.fab.com
- gltf-transform: https://gltf-transform.dev

**Dokumentation:**
- GLB-WORKFLOW.md — Dein existing Workflow
- Blender Python API: https://docs.blender.org/api/current/
- Three.js GLB Loader: https://threejs.org/docs/#examples/en/loaders/GLTFLoader

**Code:**
- `scripts/generate-product-glb.py` — Blender Automation Script
- `scripts/make-shop-glb.sh` — Existing Pipeline
- `scripts/optimize-glb.sh` — GLB Optimization

---

**Erstellt von:** Claude Sonnet 4.5  
**Für:** ON ME HONEY B Shop  
**Datum:** 22. Oktober 2026
