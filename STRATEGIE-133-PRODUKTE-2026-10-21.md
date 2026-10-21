# ON ME HONEY B — Strategie 133 Produkte

**Stand:** 21. Oktober 2026  
**Autor:** Claude Sonnet 4.5  
**Für:** Jonny (butasioan@googlemail.com)  
**Projekt:** on-me-honey-b.vercel.app  
**Ziel:** Skalierung von 2 auf 133 Sublimationsprodukte

---

## 🎯 Executive Summary

**Kernfrage:** Schaffen wir für jedes der 133 Produkte ein 3D-Modell, Kundenpositionierung und druckfertige Dokumentation?

**Antwort:** ✅ **JA als System** — ❌ **NEIN als 133 Unikat-GLBs**

### Strategie in 3 Sätzen

1. **3D-Modelle:** ~14 Familien-GLBs statt 133 Einzelmeshes — ein Tee-Mesh bedient 6 SKUs
2. **2D-Schicht:** Jedes Produkt bekommt eigenes Foto + Emblem-Composite in der Druckzone
3. **Admin-Doku:** Bestehende PDF-Pipeline erweitern mit SKU-spezifischen Print-Profilen

### Erfolgsformel

```
FAMILIE (GLB) + SKU (Foto/Overlay/Blank) + PRINT-PROFIL = SHOP-READY
```

Ein weißes Hoodie-Mesh + 2 SKU-Profile (021 Hoodie, 022 Sweatshirt) = 2 Shop-Produkte.

---

## 📊 Aktueller Stand (Live-Shop)

### Was bereits funktioniert ✅

| Komponente | Status | Beweis |
|---|---|---|
| **2 Produkte live** | ✅ SHOP_LIVE | 001 Tee 44,99€ • 015 Shorts 39,99€ • Set 74,99€ |
| **3D-Atelier** | ✅ Funktional | 2 weiße GLBs, Decal-Mapping, Fallback |
| **Design-Freeze** | ✅ Wasserdicht | Transform bei Zahlung, kein Checkout ohne designId |
| **Admin-PDF** | ✅ 3-Ebenen | Druckblatt + Platzierung + Kundenblick |
| **Preiskalkulation** | ✅ Zero-Drift | Server-seitig, Bundle-Rabatt automatisch |
| **E-Commerce-Kette** | ✅ Komplett | Stripe → Webhook → Order → PDF → Email |
| **i18n** | ✅ 3 Sprachen | DE/RO/EN vollständig |

### Was noch fehlt 🔴

| Blocker | Impact | Priorität |
|---|---|---|
| **Overlay P1 nicht kalibriert** | Neue Familien erben ±2% Unschärfe | P0 |
| **Shorts mmReferenceHeight null** | PDF zeigt nur Prozent, keine mm | P1 |
| **11-in-1 Aufsätze unbewiesen** | 32 SKUs (Tasse/Cap/Teller/Schuh) bleiben `prüfen` | P2 |
| **EK/VK für 131 Produkte offen** | Keine Shop-Preise ohne Blank-Kosten | P1 |
| **Partner-Angebote fehlen** | Unklarheit über Fulfillment vs. Eigenbau | P1 |

---

## 🗂️ Die 133 Produkte (Kategorien A–I)

### Gesamtübersicht

| Kategorie | Name | SKUs | Produkte | Machbarkeit |
|---|---|---|---|---|
| **A** | Bekleidung und Mode | 001–031 | 31 | 25 bedingt, 6 eingeschränkt |
| **B** | Taschen und Accessoires | 032–050 | 19 | 17 bedingt, 2 eingeschränkt |
| **C** | Wohnen und Dekoration | 051–077 | 27 | 27 bedingt |
| **D** | Geschenkartikel, Büro und Technik | 078–101 | 24 | 22 bedingt, 2 eingeschränkt |
| **E** | Tassen, Becher und Trinkgefäße | 102–116 | 15 | 15 **prüfen** (11-in-1) |
| **F** | Kappen und Kopfbedeckungen | 117–122 | 6 | 6 **prüfen** (11-in-1) |
| **G** | Teller und Keramikartikel | 123–126 | 4 | 4 **prüfen** (11-in-1) |
| **H** | Stifte und Schreibgeräte | 127–129 | 3 | 3 **prüfen** (11-in-1) |
| **I** | Schuhe | 130–133 | 4 | 4 **prüfen** (11-in-1) |
| | **GESAMT** | **001–133** | **133** | **92 bedingt · 9 eingeschränkt · 32 prüfen** |

**Hinweis:** Flex/Vinyl-Gruppen J/K (169er-Liste) bleiben draußen. Nur Sublimation.

### Status-Definitionen

- **bedingt** — Mit SC-F100 + VEVOR machbar, A4-Druckzone
- **eingeschränkt** — Nur Teilmotiv (Hoodie, große Tasche, Hose), kein Allover
- **prüfen** — 11-in-1-Aufsatz physisch unbestätigt (Tasse, Cap, Teller, Stift, Schuh)

---

## 🏗️ Architektur: 3 Schichten pro Produkt

### Schicht A — Visuelles Fertigprodukt (2D)

**Ziel:** Jedes SKU sieht wie ein fertiges Teil aus, Emblem sitzt in der echten Druckzone.

**Pro SKU:**
- Rohlingfoto (einzigartig, aus Fertigkatalog)
- Echtes Honigdachs-Emblem per Composite
- Studio-Look pro Familie (Shirt hängt, Kissen liegt, Tasse steht, Cap von vorn)
- Kinder/Baby (004, 005, 115, 121): nur Produkt, **kein Kind im Bild**

**Output:**
- Katalog-Seite
- Shop-Produktkarte
- Admin-PDF Ebene 3 (Kundenblick)

**Status:** ✅ 133 Composites im Fertigkatalog vorhanden

---

### Schicht B — 3D-Atelier (Familien-GLB)

**Ziel:** Ein weißes Mesh pro Formfamilie, nicht pro SKU.

**Prinzip:**

```
1 GLB = mehrere SKUs mit unterschiedlichen Fotos/Overlays
```

**Beispiel:**
```
tee-family-white-v2.glb bedient:
├── 001 Unisex-T-Shirts
├── 002 Damen-T-Shirts
├── 003 Herren-T-Shirts
├── 004 Kinder-T-Shirts
├── 012 Laufshirts
└── 023 Unterhemden
```

**Pipeline (bestehend):**

```bash
cd ~/Schreibtisch/on-me-honey-b
npm run make-shop-glb -- quelle.obj public/models/<family>-white-v1.glb
```

Output: Weißes Mesh, unit-scale, Origin zentriert, kein Simplify.

**Aktivierungsregel (verbindlich):**

Ein GLB kommt **erst** in `MODEL_PATHS`, wenn:
1. ✅ Polyester-Blank gesourct (Artikelnummer, EK)
2. ✅ Preis in `lib/products.ts` / `lib/pricing.ts`
3. ✅ Print-Profil kalibriert (`GARMENT_PROFILES` + No-Print + Fotos)
4. ✅ Jonny-OK

**Flache Hartware (Mauspad, Magnet, Schild):** Oft **kein** eigenes Mesh nötig. 2D-Atelier auf Foto + Print-Profil reicht.

---

### Schicht C — Druckfertige Admin-Doku

**Ziel:** Pro Bestellung PDF mit allem, was die Druckerei braucht.

**Bestehende 3-Ebenen-Pipeline (unverändert):**

**Ebene 1 — Druckblatt** (`lib/print-export.ts`)
- Canvas 2480 × 3508 px = A4 @ 300 dpi
- Weißer Grund, Motiv zentriert
- JPEG Quality 0,92
- Das Blatt für die Presse

**Ebene 2 — Platzierung** (`lib/print-position.ts` + `lib/print-job.ts`)
- Overlay & Placement in **Prozent** (verbindlich)
- mm-Näherung nur wenn `mmReferenceHeight` gesetzt
- No-Print-Zonen gestrichelt im PDF

**Ebene 3 — Kundenblick** (`lib/print-customer-view.ts`)
- Produktfoto + Motiv exakt wie Atelier/360°
- Reklamations-Nachweis

**Neu: SKU-spezifische Profile**

Statt globalem Singleton erweitert jedes neue Produkt `GARMENT_PROFILES`:

```typescript
GARMENT_PROFILES = {
  '1': {  // AirFit Pro Tee (live)
    blank: 'James & Nicholson JN827',
    weightGsm: 165,
    printShape: 'a4_flat',
    ...
  },
  '2': {  // AirFit Pro Shorts (live)
    blank: 'James & Nicholson JN387',
    weightGsm: 135,
    printShape: 'a4_flat',
    mmReferenceHeight: null,  // nur Prozent
    ...
  },
  '3': {  // PILOT: Dekokissenbezug
    blank: 'BRILDOR Kissenbezug 40×40cm',
    weightGsm: 180,
    printShape: 'a4_flat',
    press: 'VEVOR 29×38 cm',
    overlayFront: { top: 15, left: 15, width: 70, height: 70 },
    noPrintNote: 'Nähte, 1cm Rand',
    mmReferenceHeight: null,  // erst nach Messung
    ...
  }
}
```

---

## 🎨 3D-Familien: ~14 GLBs für 133 SKUs

### Tabellarische Übersicht

| # | Familie | SKUs (Beispiele) | Anzahl | Machbarkeit | GLB-Status | Hinweis |
|---|---|---|---|---|---|---|
| 1 | **tee** | 001, 002, 003, 004, 012, 023 | 6 | bedingt | ✅ **LIVE** | shirt-white-v2.glb |
| 2 | **body** | 005 | 1 | bedingt | 🔴 Später | Baby ohne Kind |
| 3 | **tank** | 006, 013 | 2 | bedingt | 🔴 1 Mesh | Tank + Fitness |
| 4 | **polo** | 007 | 1 | bedingt | 🔴 1 Mesh | Kragen No-Print |
| 5 | **longsleeve** | 008 | 1 | bedingt | 🔴 1 Mesh | A4 Brust |
| 6 | **jersey** | 009, 010, 011 | 3 | bedingt | 🔴 1 Mesh | Sport/Basket/Fußball |
| 7 | **bra** | 014 | 1 | bedingt | 🔴 1 Mesh / 2D | Sport-BH |
| 8 | **shorts** | 015 | 1 | bedingt | ✅ **LIVE** | shorts-white-v1.glb |
| 9 | **pants** | 016, 017 | 2 | eingeschränkt | 🔴 1 Mesh | Teilmotiv A4 |
| 10 | **leggings** | 018, 019 | 2 | bedingt | 🔴 1 Mesh | Leggings + Radler |
| 11 | **jacket** | 020 | 1 | eingeschränkt | 🔴 Hoodie-nah | Teilmotiv |
| 12 | **hoodie** | 021, 022 | 2 | eingeschränkt | 🔴 1 Mesh | Teilmotiv A4 |
| 13 | **socks** | 024 | 1 | bedingt | 🟡 2D reicht | Klein, flach |
| 14 | **soft-head** | 025–030 | 6 | bedingt | 🟡 2D / Schlauch | Stirnband, Bandana |
| 15 | **patch** | 031 | 1 | bedingt | 🟡 2D | Aufnäher |
| 16 | **tote** | 032, 033 | 2 | bedingt | 🟢 **PILOT-Option** | 033 Anker-EK |
| 17 | **drawstring** | 034, 035 | 2 | bedingt | 🔴 1 Mesh | Turnbeutel |
| 18 | **sportbag** | 036 | 1 | eingeschränkt | 🔴 tote-nah | Teilmotiv |
| 19 | **pouch** | 037–042, 044–050 | 13 | bedingt | 🔴 1 Taschen-Mesh | Kosmetik, Etui |
| 20 | **laptop** | 043 | 1 | eingeschränkt | 🔴 pouch | Teilmotiv |
| 21 | **pillow** | 051–053 | 3 | bedingt | 🟢 **PILOT!** | BRILDOR-Bezug |
| 22 | **towel** | 054–057 | 4 | bedingt | 🟡 2D / flach | Küche, Sport |
| 23 | **table-textile** | 058–061 | 4 | bedingt | 🟡 2D | Set, Läufer |
| 24 | **apron** | 062 | 1 | bedingt | 🔴 1 Mesh / 2D | Schürze |
| 25 | **potholder** | 063 | 1 | bedingt | 🟡 2D | Topflappen |
| 26 | **coaster** | 064–066 | 3 | bedingt | 🟡 2D / Plane | MDF, Kork, Alu |
| 27 | **panel** | 067–073 | 7 | bedingt | 🟡 2D / Plane | Schilder, Wandbilder |
| 28 | **clock** | 074 | 1 | bedingt | 🟡 2D | Uhr-Rohling |
| 29 | **flag** | 075–077 | 3 | bedingt | 🟡 2D | Fahne, Wimpel |
| 30 | **mousepad** | 078–080 | 3 | 078 bedingt, 079–080 eingeschränkt | 🟡 2D | Gaming Teilmotiv |
| 31 | **phone** | 081 | 1 | bedingt | 🔴 1 Mesh / 2D | Hülle |
| 32 | **hard-small** | 082–086, 089–091, 094–101 | 17 | bedingt | 🟡 2D | Magnet, Anhänger |
| 33 | **puzzle** | 087 | 1 | bedingt | 🟡 2D | bis A4 |
| 34 | **notebook** | 092 | 1 | bedingt | 🟡 2D | Cover |
| 35 | **photo-board** | 093 | 1 | bedingt | 🟡 panel | Fototafel |
| 36 | **mug** | 102–107, 114–116 | 10 | **prüfen** | 🔴 Zylinder Wrap | 11-in-1 |
| 37 | **tumbler** | 108–111 | 4 | **prüfen** | 🔴 hoher Zylinder | 11-in-1 |
| 38 | **bottle** | 112–113 | 2 | **prüfen** | 🔴 Flasche | 11-in-1 |
| 39 | **cap** | 117–121 | 5 | **prüfen** | 🟡 **Mesh existiert!** | cap-white-v1.glb inaktiv |
| 40 | **visor** | 122 | 1 | **prüfen** | 🔴 cap-nah | 11-in-1 |
| 41 | **plate** | 123–126 | 4 | **prüfen** | 🔴 Kreisscheibe | Aufsatz |
| 42 | **pen** | 127–129 | 3 | **prüfen** | 🔴 dünner Zylinder | Aufsatz |
| 43 | **shoe** | 130–133 | 4 | **prüfen** | 🔴 Später | 11-in-1 |

**Legende:**
- ✅ LIVE — Im Shop aktiv
- 🟢 PILOT! — Empfohlener nächster Schritt
- 🟡 2D reicht — Kein 3D-Mesh nötig
- 🔴 Offen — Noch zu bauen
- **prüfen** — 11-in-1-Aufsatz unbewiesen

**Zählung:**
- **~14 echte GLBs** für Bekleidung/Taschen (tee, shorts, hoodie, tote, pouch, pillow...)
- **~29 2D-only** (flache Hartware, Textilien)
- **~32 Status prüfen** (11-in-1-abhängig)

**Fazit:** Keine 133 GLBs. Skaliert durch Familien + SKU-Profile.

---

## 🖼️ Druckformate (PrintShape)

Heute: Ein Format (`a4_flat`) für alles.  
Ziel: `printShape` steuert Export und PDF-Diagramm.

| printShape | Blatt | Typische Familien | Presse | Status |
|---|---|---|---|---|
| **a4_flat** | 210 × 297 mm, 300 dpi | tee, tote, pillow, mousepad, panel | VEVOR Flach 29×38 cm | ✅ Live |
| **a4_partial** | Dasselbe Blatt, Motiv nur Brust/Front | pants, hoodie, jacket, sportbag | VEVOR Flach | 🔴 Code erweitern |
| **wrap_cylinder** | Rechteck = Umfang × Höhe | mug, tumbler, bottle, pen | 11-in-1 | 🔴 Prüfen |
| **circle** | Durchmesser des Tellers | plate | 11-in-1 | 🔴 Prüfen |
| **cap_front** | Frontpanel ca. 70–80 mm hoch | cap | 11-in-1 / Cap-Presse | 🔴 Prüfen |
| **panel** | Zuschnitt Hartware | coaster, schild | Flachpresse | 🔴 Code erweitern |
| **shoe** | Aufsatzfläche | shoe | 11-in-1 | 🔴 Prüfen |

**SC-F100 Limitation:** Nur A4-Transfer. Allover auf Hose/Hoodie/große Tasche ist **eingeschränkt** — Teilmotiv, Rest unbedruckt.

---

## 🤝 Druckpartner Deutschland (3 Firmen)

### Recherche-Stand: 21.10.2026

**Quelle:** `ON-ME_HoneyB_Druckpartner_DE_3-Firmen_2026-10-21.pdf`

| # | Firma | Standort | Rolle | Stärken | Lücken |
|---|---|---|---|---|---|
| **1** | **Zick Production** | Cottbus | Full-Service B2B | Sublimation, Siebdruck, Stick, Werbeartikel, Lohndruck gemischtes Bundle | Teller, Stift, Schuh **ANFRAGEN** |
| **2** | **Shirtigo GmbH** | Hürth bei Köln | Print-on-Demand | DE-Produktion, Shop-Anbindung, ab 1 Stück | Teller, Stift, Schuh **NEIN** |
| **3** | **sprd.net AG (Spreadshirt)** | Leipzig | Großes POD-Sortiment | Eigene Werke Europa, Business-Mengenrabatt bis ~60% | Spezialrohlinge **NEIN** |

### Abdeckung 133er-Sortiment

| Kategorie | Zick Production | Shirtigo | Spreadshirt |
|---|---|---|---|
| **A** Bekleidung 001–031 | ✅ JN inkl., Sportswear, Sublimation/Transfer | ✅ Shirts, Hoodies, Hosen, JN Classic | ✅ 350+ Produkte, DTG + Stick |
| **B** Taschen 032–050 | ✅ eigener Shop laschendruck.de | ✅ Taschen im Katalog | ✅ Taschen, Rucksäcke |
| **C** Wohnen 051–077 | 🟡 TEIL: Frottier, Handtücher; Kissen anfragen | ✅ Kissen, Fußmatten, Poster | ✅ Kissenbezüge, Schürzen |
| **D** Geschenke 078–101 | ✅ Tassen, Thermo, Kulis im Shop | 🟡 TEIL: Tassen, Handyhüllen, Poster | 🟡 TEIL: Tassen, Flaschen, Sticker |
| **E** Tassen 102–116 | ✅ Sublimation | ✅ glossy + zweifarbig | ✅ Thermosublimation 4,50€ |
| **F** Caps 117–122 | ✅ Druck + Stick | ✅ Caps & Mützen | ✅ Caps, Stick möglich |
| **G** Teller 123–126 | ⚠️ **ANFRAGEN** | ❌ NEIN | ❌ NEIN |
| **H** Stifte 127–129 | ✅ Werbekulis im Shop | ❌ NEIN | ❌ NEIN |
| **I** Schuhe 130–133 | ⚠️ **LOHNDRUCK ANFRAGEN** | ❌ NEIN | ❌ NEIN |

**Fazit:**
- **Zick** ist die **einzige** der drei, die Lohndruck auf mitgebrachte Rohlinge (Tasse, Stift, Cap) in einem Haus anbietet
- **Shirtigo + Spreadshirt** sind Shop-Fulfillment, keine Manufaktur für Spezialrohlinge
- **Teller, Schuhe:** Keine der drei führt als Standard-SKU

### Kontaktdaten (Stand 21.10.2026)

**Zick Production**  
Brandenburger Platz 46, 03046 Cottbus  
+49 355 28 91 31-00  
info@zick-production.de  
DE206083763

**Shirtigo GmbH**  
Winterstraße 2a, 50354 Hürth  
+49 2233 71 32 282  
cockpit@shirtigo.de  
DE286957007

**sprd.net AG**  
Gießerstraße 27, 04229 Leipzig  
+49 341 996 59989  
legal@spreadshirt.net  
DE813871494

**Hinweis:** Preise aus öffentlichen Listen, kein Angebot. Muster mit echtem Emblem vor Menge.

---

## 🚀 Pilot-Strategie: Kissen 051

### Warum Kissen als erster Schritt?

✅ **Gleiche Presse wie T-Shirt** (VEVOR flach, A4)  
✅ **Gleiche Druckzone** (210×297mm)  
✅ **Form klar anders als Shirt** → beweist, dass Familie + Profil skalieren  
✅ **BRILDOR-Bezüge dokumentiert** (Blank-Kandidat)  
✅ **2D-Atelier reicht für v1** (GLB optional)  
✅ **Kein 11-in-1 Risiko** (sofort machbar)

### Checkliste Pilot Kissen 051

```markdown
Phase 1: Vorbereitung
[ ] 1. BRILDOR Kissenbezug 40×40cm bestellen
[ ] 2. EK-Preis notieren (Status ehrlich lassen wenn offen)
[ ] 3. Foto vorn anfertigen (Studio-Look, weißer Grund)
[ ] 4. Emblem-Composite in Druckzone (Photoshop/GIMP)
[ ] 5. Overlay-Rechteck in % messen (top, left, width, height)
[ ] 6. Placement-Zone definieren (wo Motiv landet)
[ ] 7. No-Print-Text formulieren ("Nähte, 1cm Rand")

Phase 2: Code-Erweiterung
[ ] 8. lib/print-spec.ts → GARMENT_PROFILES['3'] anlegen
[ ] 9. printShape: 'a4_flat' (wie Tee)
[ ] 10. mmReferenceHeight: null (erst nach Messung)
[ ] 11. Fotos unter public/products/051/ ablegen

Phase 3: Test
[ ] 12. Dummy-Design mit Emblem erstellen
[ ] 13. saveDesign() aufrufen → Transform speichern
[ ] 14. Fake-Order anlegen (Test-Stripe-Session)
[ ] 15. Admin-PDF generieren: /api/orders/{id}/print-pdf
[ ] 16. PDF visuell prüfen:
    - Druckblatt 2480×3508px
    - Overlay-Rechteck stimmt mit Foto überein
    - Kundenblick zeigt Emblem an richtiger Stelle

Phase 4: Aktivierung
[ ] 17. Optional: GLB pillow-white-v1.glb (Quader-Mesh)
[ ] 18. lib/products.ts → Produkt 3 anlegen (VK nur mit Jonny-OK!)
[ ] 19. MODEL_PATHS['3'] wenn GLB vorhanden
[ ] 20. Kamera getCamera('3') wenn 3D
[ ] 21. Shop-Route /product/3 testen

Phase 5: Abnahme
[ ] 22. Jonny-Review: Foto, Overlay, Preis
[ ] 23. Shop-Status: anker → shop_live
[ ] 24. Vercel Deploy
```

### Erwartetes Ergebnis

Nach dem Pilot haben wir:
1. ✅ **Beweis**, dass SKU-Profile funktionieren
2. ✅ **Zweite Produktfamilie** neben tee/shorts
3. ✅ **Template** für flache A4-Produkte (Tote, Mousepad, Panel)
4. ✅ **Vertrauen** für weitere 131 Produkte

---

## 📋 Datenmodell pro SKU

### TypeScript-Interface (Konzept)

```typescript
interface ProductSKU {
  // Identifikation
  sku: string;                    // "051"
  family: string;                 // "pillow"
  shopProductId: string | null;   // "3" oder null (erst nach Aktivierung)
  status: 'offen' | 'anker' | 'pilot' | 'modell' | 'pruefen' | 'shop_live';
  
  // Blank-Artikel
  blank: string;                  // "BRILDOR Kissenbezug 40×40cm"
  weightGsm: number;              // 180
  
  // Druckverfahren
  printShape: 'a4_flat' | 'a4_partial' | 'wrap_cylinder' | 'circle' | 'cap_front' | 'panel' | 'shoe';
  press: string;                  // "VEVOR 29×38 cm"
  printWidthMm: number;           // 210 (Override wenn nicht A4)
  printHeightMm: number;          // 297
  dpi: number;                    // 300
  
  // Druckseiten
  sides: ('front' | 'back')[];    // ["front"] oder ["front","back"]
  
  // Overlay & Placement (Prozent des Fotos)
  overlayFront: {
    top: number;      // %
    left: number;     // %
    width: number;    // %
    height: number;   // %
  };
  overlayBack: { ... } | null;
  
  placementFront: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  placementBack: { ... } | null;
  
  // No-Print-Hinweise
  noPrintNote: string;            // "Nähte, 1cm Rand"
  
  // Millimeter-Referenz (optional)
  mmReferenceHeight: number | null;  // 850 oder null
  
  // Assets
  frontSrc: string;               // "/products/051/front.png"
  backSrc: string | null;         // "/products/051/back.png" oder null
  
  // 3D
  glbFamily: string | null;       // "pillow" oder null (2D-only)
  
  // Status
  machbarkeit: 'bedingt' | 'eingeschraenkt' | 'pruefen';
}
```

### CSV-Struktur (für produkte_133.csv)

```csv
sku,family,status,blank,weightGsm,printShape,press,sides,machbarkeit,frontSrc,glbFamily
001,tee,shop_live,"James & Nicholson JN827",165,a4_flat,"VEVOR 29×38",front+back,bedingt,/products/001/front.png,tee
015,shorts,shop_live,"James & Nicholson JN387",135,a4_flat,"VEVOR 29×38",front,bedingt,/products/015/front.png,shorts
051,pillow,pilot,"BRILDOR Kissenbezug",180,a4_flat,"VEVOR 29×38",front,bedingt,/products/051/front.png,pillow
117,cap,pruefen,"Polyester-Cap (offen)",120,cap_front,"11-in-1 prüfen",front,pruefen,/products/117/front.png,cap
...
```

---

## 🛠️ Code-Änderungen (Pilot Kissen)

### Dateien, die angefasst werden

| Datei | Änderung | Priorität |
|---|---|---|
| `lib/print-spec.ts` | GARMENT_PROFILES['3'] anlegen | P0 |
| `lib/products.ts` | Produkt 3 definieren (nach Jonny-OK) | P1 |
| `lib/pricing.ts` | Preis für productId 3 (nach Jonny-OK) | P1 |
| `app/components/Shirt3D.tsx` | MODEL_PATHS['3'] wenn GLB | P2 (optional) |
| `public/models/library/catalog.json` | pillow-white-v1.glb Asset-Index | P2 (optional) |
| `public/products/051/` | Fotos front.png (+ back.png wenn 2-seitig) | P0 |

**Nicht anfassen ohne Auftrag:**
- Stripe Live-Keys
- Preise 001/015
- Live-GLBs shirt-white-v2.glb / shorts-white-v1.glb

### Beispiel: GARMENT_PROFILES erweitern

```typescript
// lib/print-spec.ts

export const GARMENT_PROFILES: Record<string, GarmentProfile> = {
  '1': {
    // AirFit Pro T-Shirt (LIVE)
    blank: 'James & Nicholson JN827',
    weightGsm: 165,
    printShape: 'a4_flat',
    press: 'VEVOR TL-LZ11001',
    photo: {
      front: '/airfit-front-t.png',
      back: '/airfit-back-t.png',
    },
    overlay: {
      front: { top: 20, left: 25, width: 50, height: 60 },
      back: { top: 20, left: 25, width: 50, height: 60 },
    },
    placement: {
      front: { top: 22, left: 27, width: 46, height: 56 },
      back: { top: 22, left: 27, width: 46, height: 56 },
    },
    noPrintZones: 'Schulter, Seitennaht, Kragen, Saum',
    mmReferenceHeight: 850,  // Gr. L gemessen
  },
  
  '2': {
    // AirFit Pro Shorts (LIVE)
    blank: 'James & Nicholson JN387',
    weightGsm: 135,
    printShape: 'a4_flat',
    press: 'VEVOR TL-LZ11001',
    photo: {
      front: '/airfit-shorts-front.png',
      back: '/airfit-shorts-back.png',
    },
    overlay: {
      front: { top: 25, left: 30, width: 40, height: 50 },
      back: null,  // Shorts nur vorn
    },
    placement: {
      front: { top: 27, left: 32, width: 36, height: 46 },
      back: null,
    },
    noPrintZones: 'Kordelbund, Seitennaht-Paspel, Schritt, Saum',
    mmReferenceHeight: null,  // noch nicht gemessen
  },
  
  '3': {
    // PILOT: Dekokissenbezug 40×40cm
    blank: 'BRILDOR Kissenbezug 40×40cm',
    weightGsm: 180,
    printShape: 'a4_flat',
    press: 'VEVOR TL-LZ11001',
    photo: {
      front: '/products/051/front.png',
      back: null,  // Kissen einseitig
    },
    overlay: {
      front: { top: 15, left: 15, width: 70, height: 70 },
      back: null,
    },
    placement: {
      front: { top: 17, left: 17, width: 66, height: 66 },
      back: null,
    },
    noPrintZones: 'Nähte, 1cm Rand',
    mmReferenceHeight: null,  // erst nach Bezug-Messung
  },
};
```

---

## 📐 Overlay-Kalibrierung (kritisch!)

### Problem

Live-Overlay P1 ist **nicht physisch kalibriert**. Neue Familien erben diese ±2% Unschärfe.

### Was "kalibriert" heißt

1. **Rohlingfoto** mit Lineal/Maßband aufnehmen
2. **Overlay-Rechteck** in Photoshop/GIMP messen (Pixel → %)
3. **Testdruck** mit Emblem auf echtem Blank
4. **Vermessen** wo Motiv landet (Abweichung in mm)
5. **Overlay anpassen** ±2% bis pixelgenau
6. **mmReferenceHeight setzen** (Höhe des Blanks in mm, Gr. L)

### Warum das wichtig ist

Admin-PDF zeigt mm-Angaben. Druckerei richtet danach ihre Presse ein. Wenn Overlay falsch ist:
- Motiv sitzt zu hoch/niedrig
- Reklamation
- Print-Job muss neu

### Status Quo

| Produkt | Overlay-Status | mmReferenceHeight | Action |
|---|---|---|---|
| 001 Tee | ⚠️ Näherung (kein physischer Test) | 850 mm (Gr. L + Kragenoffset) | Testdruck P0 |
| 015 Shorts | ⚠️ Erstversion (nicht testdrucken laut Doku) | null | Gr. L messen |
| 051 Kissen | 🔴 Noch nicht kalibriert | null | Nach Bezug-Erhalt |

**Regel:** Overlay in % ist **verbindlich**. mm nur als Näherung, wenn `mmReferenceHeight` gemessen.

---

## 🧪 11-in-1-Aufsätze: Status prüfen

### Was ist 11-in-1?

VEVOR TL-LZ11001 kommt mit **11 Aufsätzen**:
1. Flachpresse (29×38 cm) — ✅ **bestätigt** für Tee/Shorts
2. Tasse 6–12 oz
3. Teller
4. Cap
5. Schuh
6. ... weitere

### Problem

Tasse/Cap/Teller/Stift/Schuh-Aufsätze sind **physisch ungeprüft**. 32 SKUs hängen davon ab.

### Risiko

Wenn Aufsatz nicht passt / sublimiert nicht sauber:
- 32 Produkte bleiben `prüfen`
- Kein Shop-Launch für E/F/G/H/I
- Partner-Angebote nötig (Shirtigo Tasse 4,50€, Zick Lohndruck)

### Test-Plan

```markdown
[ ] 1. Polyester-Tasse 11 oz besorgen
[ ] 2. Aufsatz montieren (Anleitung VEVOR)
[ ] 3. Emblem drucken (Temperatur/Druck/Zeit testen)
[ ] 4. Qualität prüfen:
    - Farbtreue
    - Schärfe
    - Kratzfestigkeit
    - Spülmaschinenfest
[ ] 5. Bei Erfolg: Wrap-Profil für mug-Familie
[ ] 6. Bei Misserfolg: Shirtigo/Zick als Fallback
```

**Erst nach Test:** mug/cap/plate/pen/shoe-Familien aktivieren.

---

## 💰 Pricing-Strategie

### Aktuelle Preise (Live-Shop)

| Produkt | VK Shop | EK Shop | DB netto | CSV-Variable | Bundle |
|---|---|---|---|---|---|
| 001 Tee | 44,99€ | 16,40€ | 12,80€ | 15 €/h | ✅ Set 74,99€ |
| 015 Shorts | 39,99€ | 10,60€ | ca. 12,80€ | 15 €/h | ✅ Set 74,99€ |

**Kalkulation (Modell, nicht verbindlich):**
```
EK (Blank brutto) + CSV-Variable (Arbeit 15€/h, 11 Min à 2,75€) = Shop-EK
Shop-EK × 2,74 (für DB ~12,80€ netto bei 0% MwSt. §19 UStG) = VK
```

**ChatGPT-Register:** 001 auf 39,90€, 015 auf 30,90€ gesetzt (Anker-Modell). **Shop gilt: 44,99€ / 39,99€**.

### Pricing für 133 Produkte

**Regel:** Kein VK ohne echten EK.

**Quellen für EK:**
1. **Anker-EK** — ChatGPT-Register (z.B. Henbury H075 10,81€ für 001)
2. **Partner-Angebot** — Zick/Shirtigo/Spreadshirt (z.B. Tasse 4,50€)
3. **Blank-Kauf** — Real bezahlter Preis (z.B. BRILDOR Kissen)

**Status-Tabelle:**

| Status | Bedeutung | VK im Shop? |
|---|---|---|
| `offen` | EK unbekannt, Blank nicht gesourct | ❌ Nein |
| `anker` | Anker-EK aus ChatGPT, nicht real gekauft | ⚠️ Modell (nicht verbindlich) |
| `modell` | Kalkuliert, wartet auf Jonny-OK | ❌ Nein |
| `pilot` | Blank bestellt, Test läuft | ❌ Nein |
| `pruefen` | Aufsatz/Partner unbestätigt | ❌ Nein |
| `shop_live` | Jonny-OK, VK freigegeben | ✅ Ja |

**Jonny entscheidet VK.** Kalkulation ist Vorschlag.

---

## 🎨 Bilder: Visuell angepasst pro SKU

### Regel für jedes SKU-Bild

1. ✅ **Eigenes Rohlingfoto** — keine T-Shirt-Silhouette auf fremder Form
2. ✅ **Echtes Emblem in der realen Druckzone** — nicht mittig ins Leere
3. ✅ **Licht und Perspektive der Familie** — weiches Studio, weißer/neutraler Grund
4. ✅ **Fertigprodukt-Look** — Naht, Henkel, Kordel, Kissennaht sichtbar
5. ✅ **Kein Kind** in 004, 005, 115, 121
6. ✅ **Magic Mug 107** bleibt schwarz, Emblem als Heiß-Ansicht kennzeichnen
7. ✅ **Katalog-Composites** unter `mockups/composites/NNN_HoneyB-Original.png` sind 2D-Basis

### Shop-Fotos für Live-Produkte

Bleiben die kalibrierten Dateien:
- `/airfit-front-t.png`
- `/airfit-back-t.png`
- `/airfit-shorts-front.png`
- `/airfit-shorts-back.png`

**Kein Halb-Update!** Print-Overlay ist auf diese Fotos kalibriert. Neues JN827-Rückenfoto → komplette Neu-Kalibrierung.

### Drei Linien (Original, Nature, Music)

**Original** — Honigdachs-Emblem pur (Gold auf Schwarz)  
**Nature** — Honigdachs mit Wald/Berg/Bienen (Earth-Töne)  
**Music** — Honigdachs mit Noten/Vinyl (Rock-Style)

**Status:** Nur als Markenplatten auf 001 im Katalog, nicht 133 × 3.

---

## 🔧 Admin-Seite: Was neu dazu kommt

### Bestehend (weiter nutzen)

- `/admin/print/[orderId]` — Druckauftrag + PDF-Download
- Order-Freeze-Badge
- Blank-Namen gemischt (Tee + Shorts in einer Order)

### Neu: Produktakte (Admin, intern)

**Eine Seite pro SKU oder Familie**, **bevor** Artikel im Shop aktiv ist.

**Route (Vorschlag):** `/admin/products/[sku]`

**Inhalt:**
- Familie + GLB-Pfad (oder "nur 2D")
- Blank, EK-Status, Machbarkeit
- Foto vorn/hinten
- Overlay-Rechteck als Grafik auf dem Foto
- Placement-Zone
- No-Print-Text
- Druckformat + Blatt-mm
- `mmReferenceHeight` oder klar "unbekannt"
- **Beispiel-PDF** mit Dummy-Motiv (Emblem) zum Kalibrieren

**Ziel:** Druckfertige Dokumentation mit Positionierung und Größe unabhängig von echter Bestellung.

### Bestell-PDF (schon da, Profile erweitern)

Sobald SKU `productId` im Shop hat, schreibt dasselbe PDF die Akte in die Order. **Kein zweites PDF-System.**

---

## 📊 Metriken & KPIs (Skalierung)

### Erfolgs-Metriken Pilot Kissen

| Metrik | Ziel | Beweis |
|---|---|---|
| **Foto-Qualität** | Studio-Look, Emblem sichtbar | Visuell |
| **Overlay-Genauigkeit** | ±2% Abweichung nach Testdruck | Messung mm |
| **PDF-Vollständigkeit** | 3 Ebenen, alle Felder gefüllt | Admin-Download |
| **Shop-Integration** | Atelier → Cart → Checkout → PDF | E2E-Test |
| **Jonny-Abnahme** | ✅ OK für VK | Freigabe |

### Skalierungs-Metriken (133 Produkte)

| Metrik | Aktuell | Ziel | Progress |
|---|---|---|---|
| **SKUs mit Foto** | 2/133 | 133/133 | 1,5% |
| **SKUs mit Overlay kalibriert** | 0/133 | 133/133 | 0% |
| **SKUs mit Print-Profil** | 2/133 | 133/133 | 1,5% |
| **SKUs mit EK/VK** | 2/133 | 133/133 | 1,5% |
| **SKUs shop_live** | 2/133 | ??? | 1,5% |
| **Familien mit GLB** | 2/~14 | ~14/~14 | 14% |

**Realistisches Ziel Q1 2027:** 20–30 SKUs shop_live (Bekleidung A + Taschen B + Wohnen C flach).

---

## ⚠️ Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| **11-in-1 funktioniert nicht** | Mittel | Hoch (32 SKUs) | Partner-Fulfillment (Shirtigo Tasse 4,50€) |
| **EK/VK für 131 unbekannt** | Hoch | Hoch | Stufenweise: Pilot → 10 → 30 → 60... |
| **Overlay-Kalibrierung zu aufwendig** | Mittel | Mittel | 2D-only für flache Produkte, Prozent verbindlich |
| **GLB-Bau zu komplex** | Niedrig | Mittel | make-shop-glb Pipeline funktioniert |
| **Partner-Angebote nicht konkurrenzfähig** | Mittel | Mittel | Eigenbau bleibt Option (SC-F100) |
| **Blank-Sourcing verzögert** | Hoch | Niedrig | Status `offen` ehrlich lassen |
| **133 zu viel für Shop-UI** | Niedrig | Hoch | Kategorien A–I, Filter, Suche |

---

## 🗓️ Roadmap (Empfohlen)

### Q4 2026 — Pilot & Fundament

**Woche 1–2:**
- ✅ Lagebericht + Strategie-Doku fertig
- [ ] Pilot Kissen 051: Blank bestellen
- [ ] Code vorbereiten (GARMENT_PROFILES['3'])

**Woche 3–4:**
- [ ] Kissen Fotos + Overlay messen
- [ ] Admin-PDF testen (Dummy-Design)
- [ ] Optional: pillow-white-v1.glb bauen
- [ ] Jonny-Review → shop_live?

### Q1 2027 — Flache A4-Familien

**Monat 1 (Jan):**
- [ ] Tote 033 (Anker-EK vorhanden)
- [ ] Mousepad 078
- [ ] Panel 067–070 (Schilder)

**Monat 2 (Feb):**
- [ ] 11-in-1 Tassen-Test
- [ ] Bei Erfolg: mug 102–107 (10 SKUs)
- [ ] Bei Misserfolg: Shirtigo-Fulfillment

**Monat 3 (Mär):**
- [ ] Partner-Angebote vergleichen
- [ ] 20–30 SKUs shop_live Ziel

### Q2 2027 — Bekleidungs-Meshes

- [ ] Hoodie 021/022 (GLB + Testdruck)
- [ ] Jersey 009/010/011
- [ ] Tank 006/013
- [ ] Leggings 018/019

### Q3/Q4 2027 — Spezial-Formen

- [ ] Cap (nach Blank + Presse)
- [ ] Bottle/Tumbler (Wrap)
- [ ] Plate (Kreis)
- [ ] Shoe (zuletzt)

---

## 📝 Checkliste: Was "fertig" für ein SKU heißt

Ein SKU ist **atelier- und admin-fertig**, wenn:

- [ ] Familie zugeordnet
- [ ] Rohlingfoto vorn (hinten wenn nötig)
- [ ] Emblem sitzt in der Druckzone, kein Kind wo verboten
- [ ] Overlay % gemessen
- [ ] Placement % gemessen
- [ ] No-Print-Text formuliert
- [ ] printShape + Blatt-mm definiert
- [ ] Blank-Name oder ehrlich `offen`
- [ ] Dummy-PDF erzeugt und gelesen
- [ ] GLB nur wenn Form im Atelier gedreht werden muss
- [ ] mm-Angabe nur nach Messung, sonst `null`
- [ ] **Shop-Live erst nach:** Preis + Jonny-OK + (für P1-Verwandte) Testdruck-Logik verstanden

---

## 🎓 Lessons Learned (Live-Shop)

### Was gut funktioniert hat

1. ✅ **Design-Freeze-System** — kein Checkout ohne designId, Admin-Alert bei on_hold
2. ✅ **Zero-Drift-Pricing** — Server-seitige Kalkulation, Bundle-Rabatt automatisch
3. ✅ **3-Ebenen-PDF** — Druckerei hat alles (Blatt, Platzierung, Kundenblick)
4. ✅ **i18n von Anfang an** — DE/RO/EN vollständig, kein Nachziehen
5. ✅ **Metadata-Truncation-Fix** — abgekürzte Keys, backwards-kompatibel

### Was Wochen gekostet hat

1. ⚠️ **Overlay ohne Testdruck** — P1 nicht physisch kalibriert, Unschärfe ±2%
2. ⚠️ **Shorts mmReferenceHeight null** — PDF zeigt nur Prozent, keine mm
3. ⚠️ **GLB-Fehlversuche** — Kids-Pant als Shorts, CLO-Shirt im Shorts-Slot, graue Meshes
4. ⚠️ **JN827 Rückenfoto fehlt** — Back-Overlay bleibt Näherung

**Regel für 133:** Dieselbe Sorgfalt pro Familie. Kein Massen-Deploy.

---

## 🔗 Verbindliche Quellen

| Was | Wo |
|---|---|
| **133er Sortiment A–I** | `~/Downloads/ON-ME-HoneyB-133/register/produkte_133.csv` |
| **Fertigkatalog** | `~/Schreibtisch/ON-ME_HoneyB_Produktkatalog_133_Fertig_2026-10-21.pdf` |
| **Druckpartner DE** | `~/Schreibtisch/ON-ME_HoneyB_Druckpartner_DE_3-Firmen_2026-10-21.pdf` |
| **Lagebericht Shop** | `~/Schreibtisch/on-me-honey-b/LAGEBERICHT-KOMPLETT-2026-10-21.md` |
| **Live-Shop** | https://on-me-honey-b.vercel.app |
| **Shop-Pfad** | `~/Schreibtisch/on-me-honey-b` |
| **Print-Wahrheit** | `lib/print-spec.ts` |
| **3D-Viewer** | `app/components/Shirt3D.tsx` |
| **Admin-Druckansicht** | `app/admin/print/[orderId]/page.tsx` |
| **PDF-Export** | `lib/print-job.ts` + `/api/orders/{id}/print-pdf` |
| **GLB-Policy** | `public/models/library/catalog.json` + `public/models/GLB-WORKFLOW.md` |
| **Emblem** | `~/Schreibtisch/Luxus-Honigdachs-Emblem mit Goldschrift.png` |

**133, nicht 169.** Flex/Vinyl (J/K) draußen.  
**Shop-live nur 001 und 015.** JN827 44,99€, JN387 39,99€, Set 74,99€.  
**Logo:** Echtes Honigdachs-Emblem, nie neu generieren.  
**Kinder/Baby (004, 005, 115, 121):** Nur Produktfoto, kein Kind.

---

## 💡 Nächste konkrete Schritte

### Option A: Pilot Kissen starten (empfohlen)

```bash
1. BRILDOR-Bezug bestellen (EK klären)
2. Fotos machen (vorn, Emblem in Druckzone)
3. Code erweitern (lib/print-spec.ts)
4. Admin-PDF testen
5. Jonny-OK → Shop aktivieren
```

**Zeitrahmen:** 1–2 Wochen  
**Risiko:** Niedrig (gleiche Presse wie Tee)  
**Output:** Beweis, dass SKU-Profile skalieren

---

### Option B: Partner-Angebote einholen

**Zick Production (Lohndruck):**
```
Betreff: Anfrage Lohndruck Sublimation — ON ME HoneyB

Sehr geehrte Damen und Herren,

wir betreiben einen Print-on-Demand-Shop (on-me-honey-b.vercel.app) 
mit Epson SC-F100 + VEVOR 11-in-1 und suchen einen Partner für 
Lohndruck auf mitgebrachte Polyester-Rohlinge:

1. Kissen (BRILDOR-Bezüge)
2. Tassen (11 oz, eigene Rohlinge)
3. Taschen (Shopper, Turnbeutel)

Anfragen:
- Mindestabnahme pro Artikel?
- Preis pro Stück (exkl. Rohling)?
- Lieferzeit?
- Muster mit eigenem Emblem (PNG) möglich?

Mit freundlichen Grüßen,
Jonny (butasioan@googlemail.com)
```

**Shirtigo (Fulfillment):**
```
Betreff: Shop-Anbindung ON ME HoneyB

Hallo Shirtigo-Team,

wir planen Fulfillment für Tassen, Kissen, Taschen über eure API.

Fragen:
- Tasse glossy 11 oz: 4,50€ ab Stk. 1?
- Kissenbezug 40×40cm im Katalog?
- API-Doku für Design-Upload?
- Eigenes Emblem (PNG) als Upload?

Projekt: on-me-honey-b.vercel.app

Grüße,
Jonny
```

**Zeitrahmen:** 1 Woche Antwort  
**Output:** Konkrete Preise, Mindestmengen, Muster-Optionen

---

### Option C: Lagebericht an Grok schicken

**Was Grok helfen kann:**

1. **Produktfoto-Optimierung** — 133 × Emblem-Composites verbessern
2. **3D-Mesh-Familie-Struktur** — welche Formen zusammenpassen
3. **Print-Overlay-Kalkulation** — % pro Produkttyp vorschlagen
4. **Marketing-Copy** — Produktbeschreibungen DE/RO/EN generieren
5. **Bundle-Strategien** — welche Sets Sinn machen (Tee+Shorts ✅, was noch?)

**Briefing für Grok:**

```markdown
# Auftrag an Grok

Basis-Dokumente:
1. LAGEBERICHT-KOMPLETT-2026-10-21.md (Live-Shop 2 Produkte)
2. STRATEGIE-133-PRODUKTE-2026-10-21.md (Skalierungsplan)
3. ON-ME_HoneyB_Produktkatalog_133_Fertig_2026-10-21.pdf

Aufgaben:
1. Analysiere Produktkatalog-Fotos (133 Composites)
2. Schlage Overlay-Prozente pro Familie vor (tee, pillow, tote, mug...)
3. Generiere Marketing-Copy DE/RO/EN für Top 20 Produkte
4. Identifiziere Bundle-Optionen (außer Tee+Shorts Set)
5. Empfehle Reihenfolge für nächste 10 Produkte nach Pilot Kissen

Output: Markdown-Dokument mit konkreten Werten.
```

**Zeitrahmen:** Sofort  
**Output:** Grok-Analyse + Empfehlungen

---

### Option D: SKU-Datenmodell in CSV umsetzen

**Ziel:** `produkte_133.csv` mit allen Feldern für jedes SKU.

**Spalten (Konzept):**
```csv
sku,family,status,blank,weightGsm,printShape,press,sides,overlayFrontTop,overlayFrontLeft,overlayFrontWidth,overlayFrontHeight,noPrintNote,mmReferenceHeight,frontSrc,backSrc,glbFamily,machbarkeit
```

**Erste 10 Zeilen (Beispiel):**
```csv
001,tee,shop_live,"James & Nicholson JN827",165,a4_flat,"VEVOR 29×38",front+back,20,25,50,60,"Schulter, Naht, Kragen",850,/products/001/front.png,/products/001/back.png,tee,bedingt
002,tee,anker,"Damen-Tee (offen)",165,a4_flat,"VEVOR 29×38",front+back,20,25,50,60,"Schulter, Naht, Kragen",null,/products/002/front.png,/products/002/back.png,tee,bedingt
...
051,pillow,pilot,"BRILDOR Kissenbezug",180,a4_flat,"VEVOR 29×38",front,15,15,70,70,"Nähte, 1cm Rand",null,/products/051/front.png,null,pillow,bedingt
...
117,cap,pruefen,"Polyester-Cap (offen)",120,cap_front,"11-in-1 prüfen",front,30,20,50,60,"Schirm, Lasche",null,/products/117/front.png,null,cap,pruefen
```

**Werkzeug:** Excel/LibreOffice → CSV exportieren → `~/Downloads/ON-ME-HoneyB-133/register/produkte_133.csv`

**Zeitrahmen:** 2–3 Stunden  
**Output:** Vollständige SKU-Datenbank

---

## 🎉 Erfolgs-Kriterien

### Pilot Kissen erfolgreich, wenn:

1. ✅ Foto sieht aus wie fertiges Produkt
2. ✅ Overlay-Rechteck passt auf Foto
3. ✅ Admin-PDF zeigt 3 Ebenen korrekt
4. ✅ Dummy-Design im Atelier positionierbar
5. ✅ Jonny sagt: "Das kann in den Shop"

### 133-Strategie erfolgreich, wenn:

1. ✅ 20–30 SKUs shop_live bis Q1 2027
2. ✅ ~14 Familien-GLBs (nicht 133 Meshes)
3. ✅ Partner-Angebote für 11-in-1-Lücken
4. ✅ Admin-Produktakte pro SKU
5. ✅ Overlay-Kalibrierung für Top-Familien (tee, hoodie, tote, pillow)

---

## 📞 Support & Fragen

**Projekt-Owner:** Jonny (butasioan@googlemail.com)  
**Live-Shop:** https://on-me-honey-b.vercel.app  
**Projekt-Pfad:** ~/Schreibtisch/on-me-honey-b  
**Dokument-Autor:** Claude Sonnet 4.5  
**Stand:** 21. Oktober 2026

---

**Erstellt am:** 21. Oktober 2026  
**Erstellt für:** Skalierung on-me-honey-b auf 133 Produkte  
**Erstellt von:** Claude Sonnet 4.5  
**Basis:** Lagebericht, Produktkatalog, Druckpartner-Dossier, 3D-Familien-Konzept

---

## 🔚 Ende der Strategie

**Nächster Schritt:** Jonny wählt Option A/B/C/D → Pilot oder Partner oder Grok oder CSV.

**Viel Erfolg! 🍯**
