# 3 NEUE PRODUKTE — EXAKTE SPEZIFIKATIONEN FÜR 3D-GENERIERUNG

**Datum:** 22. Oktober 2026  
**Ziel:** Realistische GLB-Modelle für Homepage-Preview  
**Quelle:** PDF-Produktdatenblätter

---

## 🎽 PRODUKT 3: PROACT® PA4012 Sport-Shirt

### TECHNISCHE DATEN:
- **Hersteller:** PROACT®
- **Artikel-Nr.:** PA4012
- **Name:** Herren-Sportshirt Recyclingmaterial mit Rundhalsausschnitt
- **Material:** 100% Polyester (recycelt)
- **Gewicht:** 130 g/m²
- **Farbe (für GLB):** Weiß (zum Bedrucken)

### DESIGN-MERKMALE:
- **Schnitt:** Gerade, sportlich
- **Ärmel:** Raglanärmel (diagonale Naht von Achsel zum Kragen)
- **Kragen:** Rundhalsausschnitt mit kontrastfarbenem Nackenband
- **Saum:** Gerade, mit Ton-in-Ton Ziernähten
- **Passform:** Regular Fit, bewegungsfreundlich

### 3D-MODELL ANFORDERUNGEN:
```
Geometrie:
- Raglanärmel mit sichtbaren diagonalen Nähten
- Rundhalsausschnitt (tiefer als Standard T-Shirt)
- Leichter Stoff (130g) → etwas weicher Fall als 165g
- Körpernahe Passform, nicht oversized

Details:
- Kontrastfarbenes Nackenband innen sichtbar
- Saubere Nähte entlang Ärmel
- Leichte Textur (nicht glatt wie Baumwolle)
- Sportlicher, moderner Schnitt

Druckbereiche:
- Front: 210×297 mm (Brustbereich)
- Back: 210×297 mm (Rücken)
- Optional: Ärmel (80×80 mm je Seite)

Poly Count: ~100k-150k
File Size: < 8 MB
Format: GLB (white base material)
```

### REFERENZ-FARBEN (für PDF):
- Schwarz, Rot, Weiß, Aqua Blau
- Lime, Orange, Gelb, Pink
- Ice Mint, Grau, Navy, Grün

---

## 🏀 PRODUKT 4: PROACT® PA1050 Basketball-Shorts

### TECHNISCHE DATEN:
- **Hersteller:** PROACT®
- **Artikel-Nr.:** PA1050
- **Name:** Herren-Basketball-Shorts
- **Material:** 100% Birdseye-Polyester
- **Gewicht:** 180 g/m²
- **Farbe (für GLB):** Weiß (zum Bedrucken)

### DESIGN-MERKMALE:
- **Länge:** Knie-länge (Basketball-Style, nicht kurz)
- **Bund:** Elastischer Bund mit flachem Kordelzug
- **Seitenschlitze:** 2 offene Seitenschlitze für Bewegungsfreiheit
- **Saum:** Passendes farbiges Band am Saum
- **Passform:** Locker, sportlich, bewegungsfreundlich

### 3D-MODELL ANFORDERUNGEN:
```
Geometrie:
- Längere Basketball-Shorts (ca. 5cm über Knie)
- Elastischer Bund mit sichtbarem Kordelzug (flach)
- 2 Seitenschlitze (ca. 8-10cm lang)
- Lockere Passform, nicht eng anliegend
- Leichte Falten im Stoff (realistisch)

Details:
- Birdseye-Textur (mikrobelüftetes Gewebe)
- Saubere Seitennähte
- Farbiges Band am Saum (subtil)
- Elastischer Bund mit Tunnelzug

Druckbereiche:
- Front: 210×297 mm
- Back: 210×297 mm
- Seiten/Beine: Optional (100×200 mm je Seite)

Poly Count: ~80k-120k
File Size: < 6 MB
Format: GLB (white base material)
```

### REFERENZ-FARBEN (für PDF):
- Schwarz, Weiß, Navy, Dunkelgrün
- Rot, Royal Blau, Gelb

---

## 🛏️ PRODUKT 5: BRILDOR® Kissenbezug 40×40cm

### TECHNISCHE DATEN:
- **Hersteller:** BRILDOR®
- **Artikel:** Sublimierbare Mikrofaser-Kissenbezüge
- **Material:** 100% Polyestergewebe
- **Gewicht:** 180 g/m² (Bezug)
- **Größe:** 40 × 40 cm
- **Farbe (für GLB):** Weiß (zum Bedrucken)

### DESIGN-MERKMALE:
- **Form:** Quadratisch, 40×40 cm
- **Verschluss:** Seitlicher Reißverschluss (versteckt, 30cm)
- **Oberfläche:** Glatte Mikrofaser, samtweich
- **Füllung:** Separat erhältlich (40×40cm, 550g)
- **Bedruckbar:** Beidseitig, vollflächig (40×40 cm pro Seite)

### 3D-MODELL ANFORDERUNGEN:
```
Geometrie:
- Kissenform: leicht gewölbt/aufgebläht (nicht flach!)
- Quadratisch 40×40 cm
- Weiche, organische Form (Cloth Simulation)
- Realistischer "gefüllter" Look
- Seitlicher Reißverschluss (ca. 0.5cm erhöht)

Details:
- Mikrofaser-Textur (sehr fein, fast seidig)
- Leichte Falten an den Ecken (realistisch)
- Subtile Naht entlang der Kanten
- Reißverschluss seitlich, fast unsichtbar
- Weiche Beleuchtung (Stoff reflektiert nicht)

Druckbereiche:
- Vorderseite: 40×40 cm (KOMPLETT)
- Rückseite: 40×40 cm (KOMPLETT)
- Keine Saum-Ausschlüsse!

Besonderheit:
- Vollflächiger Druck → 100% der Oberfläche bedruckbar
- Keine No-Print-Zonen
- Reißverschluss ist NICHT im Druckbereich

Poly Count: ~60k-100k (weiche Mesh)
File Size: < 5 MB
Format: GLB (white base material)

WICHTIG für Cloth Simulation:
- Subdivision Surface für weiche Rundungen
- Leichte Asymmetrie (natürlich, nicht perfekt symmetrisch)
- Pin Constraints an den Ecken (gefüllter Look)
```

### BESONDERHEITEN KISSENBEZUG:
- **Sublimationsanleitung:** Spiegelmodus drucken, 180° vor, mittlerer bis hoher Druck für 60 Sekunden
- **Maximale Waschtemperatur:** 40°C
- **Empfohlenes Finish:** Separat erworbene Füllung (40×40 cm, Ref. 000098)

---

## 🎨 3D-GENERIERUNGS-STRATEGIE

### METHODE 1: Meshy.ai (Text-to-3D) — EMPFOHLEN
**Prompts für AI-Generierung:**

**Sport-Shirt (PA4012):**
```
A realistic white sports t-shirt with raglan sleeves, made of lightweight recycled polyester fabric (130 g/m²). The shirt has diagonal seams from armpit to collar, a contrast-colored neck band visible inside, and a regular athletic fit. The fabric should have a subtle technical sports texture, not smooth cotton. Clean, modern cut with straight hem and tone-on-tone stitching. Optimized for sublimation printing on chest and back areas.
```

**Basketball-Shorts (PA1050):**
```
A realistic white basketball shorts made of breathable birdseye polyester fabric (180 g/m²). Knee-length style with elastic waistband featuring a flat drawstring. Two open side slits (8-10cm) for movement freedom, colored band detail at hem. Loose, athletic fit with natural fabric folds. The birdseye texture should be visible (micro-ventilated mesh pattern). Designed for full sublimation printing on front, back, and sides.
```

**Kissenbezug (40×40cm):**
```
A realistic white microfiber pillow cover, 40×40cm square, with a soft, slightly puffy filled appearance (not flat). Made of smooth polyester microfiber fabric (180 g/m²) with subtle natural wrinkles at the corners. Side zipper closure (30cm, barely visible). The pillow should look naturally filled with gentle curves and soft organic shape. Cloth simulation with subdivision surface for smooth roundness. Fully printable surface on both front and back sides.
```

### METHODE 2: Blender Python Script (Fallback)
Falls Meshy.ai nicht verfügbar:
- Script: `scripts/generate-product-glb.py`
- Basis-Geometrien erstellen
- Subdivision + Cloth Modifier
- White Material anwenden
- GLB Export

### METHODE 3: Manual Blender (Höchste Qualität)
Falls Zeit erlaubt:
- Professionelle Modellierung
- Realistic Cloth Simulation
- UV-Unwrapping für perfekte Prints
- Optimierte Topology

---

## 📍 HOMEPAGE-INTEGRATION

### VORSCHAU-SEKTION:
```typescript
// Neue Komponente: app/components/NewProductsPreview.tsx

interface NewProduct {
  id: string;
  name: string;
  nameDE: string;
  model: string; // GLB path
  weight: string;
  material: string;
  description: string;
}

const newProducts: NewProduct[] = [
  {
    id: '3',
    name: 'Sport-Shirt PA4012',
    nameDE: 'PROACT® Sportshirt',
    model: '/models/sport-shirt-pa4012.glb',
    weight: '130 g/m²',
    material: '100% Recycling-Polyester',
    description: 'Leichtes Sportshirt mit Raglanärmeln'
  },
  {
    id: '4',
    name: 'Basketball-Shorts PA1050',
    nameDE: 'PROACT® Basketball-Shorts',
    model: '/models/basketball-shorts-pa1050.glb',
    weight: '180 g/m²',
    material: '100% Birdseye-Polyester',
    description: 'Atmungsaktive Shorts mit Seitenschlitzen'
  },
  {
    id: '5',
    name: 'Kissenbezug 40×40cm',
    nameDE: 'BRILDOR® Mikrofaser-Kissen',
    model: '/models/pillow-cover-40x40.glb',
    weight: '180 g/m²',
    material: '100% Mikrofaser-Polyester',
    description: 'Vollflächig bedruckbar, beidseitig'
  }
];
```

### DISPLAY-STYLE:
- 3D-Viewer wie bei test-zones
- 360° Rotation aktiviert
- "Bald verfügbar" Badge
- Keine Kauf-Buttons (nur Preview)

---

## ✅ NÄCHSTE SCHRITTE

1. **3D-Modelle generieren** (Meshy.ai oder Blender)
2. **Modelle optimieren** (< 8 MB, white material)
3. **Homepage-Komponente** erstellen (NewProductsPreview.tsx)
4. **Integration** in Homepage
5. **Test** der 3D-Viewer
6. **Deploy**

---

**BEREIT FÜR 3D-GENERIERUNG!** 🚀
