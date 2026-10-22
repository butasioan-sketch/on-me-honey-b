# EXPANSION: 3 NEUE PRODUKTE — PROJEKTPLAN
**Datum:** 22. Oktober 2026  
**Status:** In Planung  
**Ziel:** Shop von 2 auf 5 Produkte erweitern

---

## 📦 NEUE PRODUKTE

### Product 3: PROACT® PA4012 Sport-Shirt
- **Material:** 100% Polyester (Recycling)
- **Gewicht:** 130 g/m²
- **Features:** Raglanärmel, kontrastfarbenes Nackenband
- **Druckbereiche:** Front, Back, (optional: Ärmel)
- **Quelle:** `/home/jonny/Schreibtisch/tshirt.pdf`

### Product 4: PROACT® PA1050 Basketball-Shorts
- **Material:** 100% Polyester (Birdseye)
- **Gewicht:** 180 g/m²
- **Features:** Elastischer Bund, 2 Seitenschlitze
- **Druckbereiche:** Front, Back, Beine (seitlich)
- **Quelle:** `/home/jonny/Schreibtisch/product_21684.pdf`

### Product 5: BRILDOR® Kissenbezug 40×40cm
- **Material:** 100% Polyester-Mikrofaser
- **Gewicht:** 180 g/m² (Bezug), 550 g/m² (Füllung)
- **Größe:** 40×40 cm
- **Druckbereiche:** Vorderseite (40×40 cm), Rückseite (40×40 cm)
- **Features:** Reißverschluss, beidseitig sublimierbar
- **Quelle:** `/home/jonny/Schreibtisch/Sublimierbare Mikrofaser-Kissenbezüge _ BRILDOR ®.pdf`

---

## 🏗️ IMPLEMENTIERUNGS-SCHRITTE

### Phase 1: 3D-Modelle (KRITISCH)
- [ ] 3D GLB für Sport-Shirt (PA4012) erstellen/sourcing
- [ ] 3D GLB für Basketball-Shorts (PA1050) erstellen/sourcing
- [ ] 3D GLB für Kissenbezug (40×40cm) erstellen/sourcing
- [ ] Alle Modelle optimieren (< 10 MB, white material)
- [ ] Modelle nach `public/models/` hochladen
- [ ] Preload-System erweitern

**Optionen für 3D-Generierung:**
1. **Meshy.ai** (Text-to-3D, empfohlen für hohe Qualität)
2. **Spline AI** (schnell, aber weniger detailliert)
3. **Blender Python Script** (`scripts/generate-product-glb.py`)
4. **Manuelle Modellierung** in Blender

### Phase 2: Produkt-Konfiguration
- [ ] `lib/products.ts` — 3 neue Produkte hinzufügen (ID 3, 4, 5)
- [ ] `lib/print-spec.ts` — GARMENT_PROFILES für jedes Produkt
- [ ] `lib/print-zones.ts` — Druckzonen pro Produkt definieren
- [ ] Kamera-Einstellungen pro Produkt (getCamera)
- [ ] MODEL_PATHS erweitern (Product 3, 4, 5)

### Phase 3: Assets & Fotos
- [ ] Produktfotos für PA4012 (Front/Back/Detail)
- [ ] Produktfotos für PA1050 (Front/Back/Detail)
- [ ] Produktfotos für Kissenbezug (Front/Back)
- [ ] Alle Fotos nach `public/` hochladen
- [ ] Overlay-Positionen kalibrieren

### Phase 4: Code-Anpassungen
- [ ] `Shirt3D.tsx` — 3 neue Modelle integrieren
- [ ] `Shirt3DEnhanced.tsx` — 3 neue Modelle integrieren
- [ ] `DesignStudio.tsx` — Multi-Produkt Support testen
- [ ] Pricing für neue Produkte (`lib/pricing.ts`)
- [ ] Database: Produkt-IDs 3, 4, 5 unterstützen

### Phase 5: Testing
- [ ] Jedes Produkt einzeln testen (2D Atelier)
- [ ] 3D-Viewer für alle 5 Produkte testen
- [ ] Test-Seite `/product/test-zones` erweitern
- [ ] Multi-Zone Selection für alle Produkte
- [ ] Screenshots für Quality Report

### Phase 6: Deployment
- [ ] Production Build erfolgreich
- [ ] Alle 5 Produkte in einem Build
- [ ] Git Commit mit allen Änderungen
- [ ] Deploy zu Vercel
- [ ] Live-Tests für alle Produkte

---

## 🎨 BESONDERE ANFORDERUNGEN

### Kissenbezug (Product 5):
- **Vollflächiger Druck:** 40×40 cm (gesamte Oberfläche)
- **Beidseitig:** Vorderseite UND Rückseite komplett bedruckbar
- **Kein Saum:** Reißverschluss ist versteckt
- **3D-Challenge:** Kissen ist "soft", nicht starr wie Kleidung
- **3D-Modell:** Muss realistisch "weich" aussehen (nicht eckig)

### Basketball-Shorts (Product 4):
- **Seitenschlitze:** Müssen im 3D-Modell sichtbar sein
- **Längere Form:** Nicht wie Sweat-Shorts, eher Basketball-Style
- **Bund:** Elastisch mit flachem Kordelzug
- **Druckzonen:** Front, Back, optional Beine (seitlich)

### Sport-Shirt (Product 3):
- **Raglanärmel:** Diagonale Naht von Achsel zu Kragen
- **Kontrast-Nackenband:** Muss im Modell sichtbar sein
- **Leichter als JN827:** 130 g/m² vs 165 g/m²

---

## 💰 PREISGESTALTUNG (VORSCHLAG)

Basierend auf existierenden Preisen:

**Aktuell:**
- T-Shirt (JN827): 44,99€
- Shorts (JN387): 39,99€

**Vorschlag NEU:**
- Sport-Shirt (PA4012): **42,99€** (leichter als JN827)
- Basketball-Shorts (PA1050): **44,99€** (schwerer, mehr Features)
- Kissenbezug (40×40cm): **29,99€** (kleineres Produkt, aber vollflächig)

**Bundle-Optionen:**
- 2 Kissenbezüge: **49,99€** (statt 59,98€)
- Sport-Set (Shirt + Basketball-Shorts): **79,99€**

---

## 📊 ZEITPLAN

**Geschätzte Dauer:** 2-3 Tage

- **Tag 1:** 3D-Modelle sourcing/erstellen (6-8 Stunden)
- **Tag 2:** Code-Integration + Testing (4-6 Stunden)
- **Tag 3:** Final Testing + Deployment (2-3 Stunden)

**Parallele Arbeit möglich:**
- Während 3D-Modelle generiert werden → Code vorbereiten
- Während Code läuft → Assets organisieren

---

## ⚠️ RISIKEN & HERAUSFORDERUNGEN

1. **3D-Modell Qualität:** 
   - Kissenbezug muss "soft" aussehen
   - Raglanärmel müssen korrekt sitzen
   - Basketball-Shorts Länge korrekt

2. **Druckbereich-Kalibrierung:**
   - Kissenbezug: 100% Oberfläche = spezielle Kalibrierung
   - Basketball-Shorts: Seitenschlitze berücksichtigen

3. **Performance:**
   - 5 Modelle gleichzeitig laden = mehr MB
   - Preloading-Strategie optimieren

4. **Testing-Aufwand:**
   - 5 Produkte × 2 Seiten × 3 Views = 30 Test-Cases

---

## ✅ ERFOLGS-KRITERIEN

- [ ] Alle 5 Produkte haben hochwertige, realistische 3D-Modelle
- [ ] 360° Rotation funktioniert smooth für jedes Produkt
- [ ] Multi-Zone Selection für alle Produkte
- [ ] Print-Bereiche korrekt kalibriert
- [ ] Alle Produkte in Production deployed
- [ ] Test-Seite zeigt alle 5 Produkte

---

## 🚀 NÄCHSTER SCHRITT

**JETZT:** 3D-Modelle generieren/sourcing starten

**Methode:**
1. Meshy.ai für alle 3 Produkte (parallel)
2. Falls Meshy zu langsam: Blender Python Script als Fallback
3. Optimierung: < 10 MB pro Modell, white material, GLB-Format

**Soll ich mit der 3D-Modell-Generierung starten?**
