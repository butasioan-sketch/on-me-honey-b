# 🎨 3D-MODELLE GENERIEREN — STEP-BY-STEP ANLEITUNG

**Datum:** 22. Oktober 2026  
**Status:** ✅ Bereit für Modell-Generierung  
**Ziel:** 3 realistische GLB-Modelle für Homepage-Preview

---

## 📋 WAS IST BEREITS FERTIG:

✅ **Homepage-Preview-Komponente** erstellt (`NewProductsPreview.tsx`)  
✅ **Produkt-Spezifikationen** dokumentiert (`NEW-PRODUCTS-SPECIFICATIONS.md`)  
✅ **Integration** in Homepage abgeschlossen  
✅ **Build** erfolgreich getestet  
✅ **Bereit** für 3D-Modelle

---

## 🎯 NÄCHSTER SCHRITT: 3D-MODELLE GENERIEREN

Du hast **3 Optionen** für die Modell-Generierung:

### ⭐ OPTION 1: MESHY.AI (EMPFOHLEN)
**Beste Qualität, AI-generiert, schnell**

#### ANLEITUNG:

1. **Gehe zu:** https://www.meshy.ai
2. **Registriere dich** (kostenlos)
3. **Wähle:** "Text to 3D"
4. **Generiere Modell 1: Sport-Shirt**

**Prompt für Meshy.ai:**
```
A realistic white sports t-shirt with raglan sleeves, made of lightweight recycled polyester fabric (130 g/m²). The shirt has diagonal seams from armpit to collar, a contrast-colored neck band visible inside, and a regular athletic fit. The fabric should have a subtle technical sports texture, not smooth cotton. Clean, modern cut with straight hem and tone-on-tone stitching. Optimized for sublimation printing on chest and back areas. White base color, high detail, photorealistic.
```

**Settings:**
- Style: Realistic
- Quality: High
- Format: GLB
- Texture: White material

**Download als:** `sport-shirt-pa4012.glb`  
**Speichern in:** `/home/jonny/Schreibtisch/on-me-honey-b/public/models/`

5. **Generiere Modell 2: Basketball-Shorts**

**Prompt für Meshy.ai:**
```
A realistic white basketball shorts made of breathable birdseye polyester fabric (180 g/m²). Knee-length style with elastic waistband featuring a flat drawstring. Two open side slits (8-10cm) for movement freedom, colored band detail at hem. Loose, athletic fit with natural fabric folds. The birdseye texture should be visible (micro-ventilated mesh pattern). Designed for full sublimation printing on front, back, and sides. White base color, high detail, photorealistic.
```

**Download als:** `basketball-shorts-pa1050.glb`  
**Speichern in:** `/home/jonny/Schreibtisch/on-me-honey-b/public/models/`

6. **Generiere Modell 3: Kissenbezug**

**Prompt für Meshy.ai:**
```
A realistic white microfiber pillow cover, 40×40cm square, with a soft, slightly puffy filled appearance (not flat). Made of smooth polyester microfiber fabric (180 g/m²) with subtle natural wrinkles at the corners. Side zipper closure (30cm, barely visible). The pillow should look naturally filled with gentle curves and soft organic shape. Cloth simulation with subdivision surface for smooth roundness. Fully printable surface on both front and back sides. White base color, soft lighting, photorealistic.
```

**Download als:** `pillow-cover-40x40.glb`  
**Speichern in:** `/home/jonny/Schreibtisch/on-me-honey-b/public/models/`

---

### 🔧 OPTION 2: BLENDER PYTHON SCRIPT

Falls Meshy.ai nicht verfügbar oder zu teuer:

```bash
cd ~/Schreibtisch/on-me-honey-b

# Sport-Shirt generieren
blender --background --python scripts/generate-product-glb.py -- \
  --product sport-shirt \
  --output public/models/sport-shirt-pa4012.glb

# Basketball-Shorts generieren
blender --background --python scripts/generate-product-glb.py -- \
  --product basketball-shorts \
  --output public/models/basketball-shorts-pa1050.glb

# Kissenbezug generieren
blender --background --python scripts/generate-product-glb.py -- \
  --product pillow-cover \
  --output public/models/pillow-cover-40x40.glb
```

**HINWEIS:** Diese Modelle sind einfacher als Meshy.ai, aber funktional.

---

### 🎨 OPTION 3: MANUELLE BLENDER-MODELLIERUNG

Falls du höchste Qualität willst:

1. Öffne Blender
2. Importiere Referenzbilder aus den PDFs
3. Modelliere manuell (Cloth Simulation für Realismus)
4. UV-Unwrap für perfekte Druckbereiche
5. Exportiere als GLB

**Zeitaufwand:** ~2-3 Stunden pro Modell

---

## 📁 DATEISTRUKTUR NACH GENERIERUNG:

```
public/models/
├── shirt-white-v2.glb              ✅ Vorhanden (Product 1)
├── shorts-white-v1.glb             ✅ Vorhanden (Product 2)
├── sport-shirt-pa4012.glb          🆕 NEU (Product 3)
├── basketball-shorts-pa1050.glb    🆕 NEU (Product 4)
└── pillow-cover-40x40.glb          🆕 NEU (Product 5)
```

---

## 🔄 MODELLE AKTIVIEREN (nach Generierung):

### Schritt 1: Modelle in Komponente aktivieren

**Datei:** `app/components/NewProductsPreview.tsx`

**Finde Zeile ~175-185:**
```tsx
{/* 
TODO: Hier Shirt3DEnhanced einbauen wenn GLB vorhanden:
<Shirt3DEnhanced
  productId={selectedProduct.id}
  shirtColor="#ffffff"
  enableTouch={true}
/>
*/}
```

**Ersetze mit:**
```tsx
<Shirt3DEnhanced
  productId={selectedProduct.id}
  shirtColor="#ffffff"
  enableTouch={true}
/>
```

### Schritt 2: Model-Pfade konfigurieren

**Datei:** `app/components/Shirt3DEnhanced.tsx`

**Erweitere MODEL_PATHS (Zeile ~42-45):**
```tsx
const MODEL_PATHS: Record<string, string> = {
  '1': '/models/shirt-white-v2.glb',
  '2': '/models/shorts-white-v1.glb',
  '3': '/models/sport-shirt-pa4012.glb',        // NEU
  '4': '/models/basketball-shorts-pa1050.glb',  // NEU
  '5': '/models/pillow-cover-40x40.glb',        // NEU
};
```

### Schritt 3: Preload hinzufügen

**Am Ende der Datei (nach Zeile ~365):**
```tsx
// Preload all models
Object.values(MODEL_PATHS).forEach(path => {
  if (path) useGLTF.preload(path);
});
```

---

## 🚀 DEPLOYMENT

### Nach Modell-Generierung:

```bash
cd ~/Schreibtisch/on-me-honey-b

# 1. Modelle prüfen
ls -lh public/models/*.glb

# 2. Build testen
npm run build

# 3. Committen
git add .
git commit -m "feat: Add 3 new products with 3D models

- PROACT PA4012 Sport-Shirt with raglan sleeves
- PROACT PA1050 Basketball-Shorts with side slits
- BRILDOR Pillow Cover 40×40cm fully printable

3D Models:
- Generated realistic GLB models for all 3 products
- Homepage preview section with interactive 3D viewer
- Product details and specifications
- 'Coming Soon' badges

Models:
- sport-shirt-pa4012.glb (Product 3)
- basketball-shorts-pa1050.glb (Product 4)
- pillow-cover-40x40.glb (Product 5)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. Pushen & Deployen
git push origin main

# Vercel deployed automatisch!
```

---

## ✅ ERFOLGS-KRITERIEN

Nach erfolgreicher Generierung und Deployment:

- [ ] Alle 3 GLB-Modelle in `public/models/`
- [ ] Modelle < 10 MB pro Stück
- [ ] White base material auf allen Modellen
- [ ] Homepage zeigt "Neue Produkte" Sektion
- [ ] 3D-Viewer lädt und dreht sich
- [ ] Alle 3 Produkte klickbar und wählbar
- [ ] "Bald verfügbar" Badge sichtbar
- [ ] Keine Build-Errors
- [ ] Live auf Vercel

---

## 📊 ZEITPLAN

**Jetzt → Modell-Generierung:**
- Meshy.ai: ~30-60 Minuten (3 Modelle)
- Blender Script: ~10 Minuten
- Manual Blender: ~6-9 Stunden

**Modell-Aktivierung:** ~15 Minuten  
**Testing:** ~20 Minuten  
**Deployment:** ~5 Minuten  

**TOTAL:** ~1-2 Stunden (mit Meshy.ai)

---

## 🎯 AKTUELLE SITUATION

### ✅ FERTIG:
- Homepage-Preview Komponente
- Produkt-Spezifikationen
- Integration in Homepage
- Build erfolgreich
- Bereit für Deployment

### 🔄 OFFEN:
- 3D-Modelle generieren (Meshy.ai / Blender)
- Modelle nach `public/models/` kopieren
- 3D-Viewer in Komponente aktivieren
- Final Testing
- Deployment

---

## 💡 EMPFEHLUNG

**BESTE STRATEGIE:**

1. **JETZT:** Meshy.ai nutzen für alle 3 Modelle (~60 Min)
2. **DANN:** Modelle in `public/models/` speichern
3. **DANN:** 3D-Viewer aktivieren (siehe oben)
4. **DANN:** Build testen
5. **DANN:** Deployen

**Alternativ (wenn du es selbst machst):**
- Blender Python Script für schnelle Prototypen
- Später: Professionelle Modelle in Blender manuell

---

## 🔗 RESSOURCEN

**Meshy.ai:**
- Website: https://www.meshy.ai
- Docs: https://docs.meshy.ai

**Blender:**
- Download: https://www.blender.org
- Script: `/scripts/generate-product-glb.py`

**Alternative AI Tools:**
- Spline AI: https://spline.design/ai
- Rodin AI: https://hyperhuman.deemos.com/rodin
- Luma AI: https://lumalabs.ai/genie

---

## ❓ FAQ

**Q: Wie groß dürfen die GLB-Dateien sein?**  
A: Maximum 10 MB pro Modell. Optimal: 3-6 MB.

**Q: Welche Farbe müssen die Modelle haben?**  
A: Weiß (#FFFFFF) als Base-Material, ohne Texturen.

**Q: Muss ich alle 3 Modelle auf einmal machen?**  
A: Nein! Du kannst auch eins nach dem anderen machen.

**Q: Was wenn Meshy.ai zu teuer ist?**  
A: Nutze den Blender Python Script (kostenlos, automatisch).

**Q: Kann ich die Modelle später austauschen?**  
A: Ja! Einfach die GLB-Datei ersetzen und neu deployen.

---

**BEREIT ZUM STARTEN!** 🚀

**Nächster Schritt:** Gehe zu Meshy.ai und generiere das erste Modell! 🎨
