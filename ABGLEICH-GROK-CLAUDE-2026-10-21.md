# ON ME HoneyB — Abgleich Grok × Claude

**Stand:** 21. Oktober 2026  
**Rolle:** Grok = Audit am Live-Repo. Claude = Strategie-Text. Jonny = Freigabe.  
**Konfliktregel:** Audit + Live-Code schlagen Lagebericht und Strategie-Chat.

Drei Dokumente liegen vor:

| Datei | Autor | Rolle |
|---|---|---|
| `ON-ME_HoneyB_3D-Print-Konzept_133_2026-10-21.md` | Grok | Architektur 133, Familien, Print-Doku |
| `STRATEGIE-133-PRODUKTE-2026-10-21.md` | Claude | Skalierungsplan, Checklisten, Partner-Mails |
| `on-me-honey-b/LAGEBERICHT-KOMPLETT-2026-10-21.md` | Claude | Live-Shop 2 Produkte (schon im Repo) |

---

## Urteil in einem Satz

Die **Richtung ist gleich und richtig**: Familien-GLBs, 2D pro SKU, bestehende 3-Ebenen-PDF, Pilot Kissen/Shopper, Live 001/015 nicht anfassen.

Claudes Strategie **darf nicht 1:1 in den Code**. Der Beispiel-Block `GARMENT_PROFILES` überschreibt die echten Overlay-Zahlen von Tee und Shorts.

---

## 1. Einigkeit (behalten)

- ✅ Ja als System, nein als 133 Unikat-GLBs
- ✅ Formel: Familie (GLB) + SKU (Foto/Overlay/Blank) + Print-Profil
- ✅ Drei Schichten: 2D-Fertigbild · 3D-Familie · Admin-PDF
- ✅ Aktivierung: Blank + Preis + Profil + Jonny-OK
- ✅ `printShape` statt einem A4-Singleton für Tasse/Teller/Cap
- ✅ 32 SKUs E–I bleiben `prüfen` (11-in-1)
- ✅ Kinder/Baby ohne Kind im Bild
- ✅ Emblem nie neu generieren
- ✅ Flex/Vinyl 169er draußen
- ✅ Pilot flach A4: Kissen 051 oder Shopper 033
- ✅ Kein Massen-Deploy, keine Shop-Preise ohne EK
- ✅ Partner: Zick Bundle, Shirtigo Shop-POD, Spreadshirt Menge

**Das steht in beiden MDs. Das ist die Linie.**

---

## 2. ⚠️ NICHT in den Shop kopieren (KRITISCH!)

Claude schreibt unter „Beispiel: GARMENT_PROFILES erweitern" **neue Overlay-Zahlen für Produkt 1 und 2**. Die stehen **NICHT** im Live-Code.

### Live (`lib/print-spec.ts`, gelesen 21.10.2026)

| Feld | ✅ Live-Code | ❌ Claude-Beispiel | 🔥 Wirkung bei Copy-Paste |
|---|---|---|---|
| Tee Overlay vorn | `26.3 / 34.7 / 30.9 / 29.2` | `20 / 25 / 50 / 60` | Motiv viel zu groß, sitzt falsch |
| Tee Overlay hinten | `29.9 / 34.5 / 28.9 / 27.3` | dasselbe 20/25/50/60 | Rücken zerstört |
| Tee Placement | `20 / 20 / 60 / 58` | `22 / 27 / 46 / 56` | andere Verschiebe-Zone |
| Tee mm | `740 + 110` (= 850, Gr. L + Kragen) | `850` als Literal | Zahl stimmt, Herkunft im Code ist die Summe |
| Shorts Overlay | `28.5 / 29 / 38 / 39` | `25 / 30 / 40 / 50` | Paspel-Kalibrierung weg |
| Shorts Placement | `14 / 20 / 56 / 68` | `27 / 32 / 36 / 46` | andere Zone |
| Shorts Rückseite | Foto + gleiches Overlay existiert | `back: null` | Rücken-Druck im PDF/Atelier tot |
| Shorts mm | `null` (ehrlich, nicht gemessen) | `null` | gleich, richtig ✅ |

### 🔥 REGEL: Profil `'1'` und `'2'` in `print-spec.ts` bleiben unangetastet!

**Pilot ist nur ein NEUES `'3'`** (oder interne SKU), ohne die Live-Rechtecke anzufassen.

Kissen-Overlay `15 / 15 / 70 / 70` in Claudes Text ist eine **Schätzung vor Foto**. Erst messen am echten Bezug, dann eintragen. Nicht als kalibriert behandeln.

BRILDOR 40×40 cm / 180 g/m² ist **Blank-Kandidat**, kein bestellter Artikel und kein Shop-Blank.

---

## 3. Weitere Korrekturen am Claude-Text

| Claude schreibt | ✅ Live / Partner-Dossier | Korrektur |
|---|---|---|
| Shirtigo Tasse **4,50 €** | Shirtigo glossy **6,69 €**; **4,50 €** ist Spreadshirt **Druck je Fläche** bzw. Shirtigo-Versand Hoodie/Tasse | Partner-PDF prüfen |
| `laschendruck.de` | `taschen-druck.de` | Tippfehler |
| Lagebericht Q4: „✅ Live-Schaltung (Stripe LIVE)" | Stripe ist **TEST**. P0 E2 offen | nicht als erledigt führen |
| Overlay P1 „850 mm gemessen" | Code-Näherung Gr. L, **D-P1 Testdruck offen** | mm = Näherung |
| SKUs mit Overlay kalibriert 0/133 | Tee/Shorts haben Overlay-**Näherung** am Foto, nicht 0 Profile | 2 Profile existieren, 0 physisch testgedruckt |
| 20–30 SKUs shop_live Q1 2027 | Zielvorstellung | kein Auftrag, kein KPI-Versprechen |
| CSV-Arbeit 15 €/h × 11 min in der Shop-Kalkulation | Shop-VK ist fest 44,99 / 39,99 / 74,99 | Modell intern, nicht in `pricing.ts` |
| `MODEL_PATHS['3']` + `/product/3` in derselben Pilot-Checkliste | Shop-Route = Live-Verkauf | Dummy-PDF intern zuerst, Shop-Route erst nach Jonny-OK und Preis |

Lagebericht selbst (Shop-Ist für 2 Produkte) ist nützlich und liegt schon unter `~/Schreibtisch/on-me-honey-b/LAGEBERICHT-KOMPLETT-2026-10-21.md`. Die Häkchen in der Vision-Sektion (Stripe LIVE) sind zu optimistisch.

---

## 4. Was Claude extra hat — und gut ist ✅

Diese Teile aus der Strategie-MD ergänzen Grok und bleiben als **Plan**, nicht als Code:

- ✅ Checkliste Pilot in 5 Phasen (Vorbereitung → Code → Test → Aktivierung → Abnahme)
- ✅ TypeScript-Interface `ProductSKU` als Zielmodell
- ✅ CSV-Spaltenvorschlag `family,printShape,overlayFront*`
- ✅ Partner-Mail-Entwürfe Zick / Shirtigo (Jonny sendet, Grok sendet nicht)
- ✅ 11-in-1 Testplan (Tasse zuerst)
- ✅ Status-Wörterbuch offen / anker / modell / pilot / pruefen / shop_live
- ✅ Optionen A–D zur Wahl

Option C („Auftrag an Grok: Overlay % vorschlagen") ist **schon erledigt** durch das 3D-Konzept plus diesen Abgleich. Keine erfundenen Overlay-Prozente für 131 SKUs ohne Foto-Messung.

---

## 5. Dateien — was öffnen, was bauen

| Datei | Nutzen | Status |
|---|---|---|
| **Dieses Abgleich-MD** | Was gilt, wenn sich Texte widersprechen | ✅ Verbindlich |
| Grok-Konzept 3D | Familien, alle 133 SKUs, PrintShape, Admin-Akte | ✅ Architektur-Basis |
| Claude-Strategie | Checklisten, Mails, Roadmap — mit Abschnitt 2 dieses Abgleichs im Kopf | ⚠️ Code-Beispiele NICHT übernehmen |
| Lagebericht im Shop-Repo | Ist-Zustand 2 Produkte | ✅ Dokumentation |
| `lib/print-spec.ts` | Einzige Overlay-Wahrheit für Live | ✅ Einzige Quelle |

**Kein Shop-Deploy, kein Commit, kein neues `GARMENT_PROFILES['3']` in diesem Schritt.**

---

## 6. ⚠️ AUCH DER "KORRIGIERTE" CODE IST FALSCH (Grok Abschnitt 12)

Claude hat die Live-Zahlen jetzt richtig zitiert. Der Block ist trotzdem **kein Paste für `print-spec.ts`**.

### Live-Interface `GarmentProfile` (heute):

```typescript
{
  productId: string,
  photoWidth: number,
  photoHeight: number,
  overlay: { front: Rect, back: Rect },
  placement: { front: Rect, back: Rect },
  blank: string,
  weightGsm: number,
  frontSrc: string,
  backSrc: string,
  mmReferenceHeight: number | null
}
```

`Rect` = `{ top: number, left: number, width: number, height: number }` — keine `null`!

### Was Claudes Beispiel (Abschnitt 6) extra hat — und der Compiler ablehnt:

| Im Claude-Beispiel | ❌ Live-Code | Problem |
|---|---|---|
| `printShape`, `press`, `photo: {front,back}`, `noPrintZones` | Felder existieren **nicht** | Compiler-Fehler |
| No-Print liegt in `NO_PRINT_NOTE_BY_PRODUCT` | Separate Konstante | Nicht im Profil |
| Fotos sind `photo: {front, back}` | `frontSrc` / `backSrc` (Strings) | Falsche Namen |
| `overlay.front.top: null` | `Rect` braucht **Zahlen** | null nicht erlaubt |
| `overlay.back: null`, `backSrc: null` | Beide Seiten sind `Rect` bzw. String | null nicht erlaubt |
| `'1'` und `'2'` komplett neu geschrieben | Live nutzt `TEE_PROFILE` / `SHORTS_PROFILE` Konstanten | Nicht ersetzen! |

### ✅ Richtige Pilot-Zeile (später, nach Messung):

```typescript
// NUR anhängen an bestehende Profile, '1'/'2' nicht anfassen!
// Zahlen erst nach Foto-Messung eintragen, sonst diesen Block nicht committen.

// Profil '3' erst anlegen WENN alle vier Prozent gemessen sind:
const PILLOW_PROFILE: GarmentProfile = {
  productId: '3',
  photoWidth: 800,  // Nach Foto
  photoHeight: 800,
  overlay: {
    front: { top: X, left: Y, width: Z, height: W },  // AM FOTO GEMESSEN
    back: { top: X, left: Y, width: Z, height: W }     // Gleich wie front (einseitig)
  },
  placement: {
    front: { top: A, left: B, width: C, height: D },  // Nach Overlay
    back: { top: A, left: B, width: C, height: D }
  },
  blank: 'BRILDOR Kissenbezug 40×40cm',
  weightGsm: 180,
  frontSrc: '/products/051/front.png',
  backSrc: '/products/051/front.png',  // Gleich wie front (einseitig)
  mmReferenceHeight: null  // Erst nach Bezug-Messung
};

// Dann zu export-Map hinzufügen (nicht ersetzen!):
export const GARMENT_PROFILES = {
  ...bestehende Profile...,
  '3': PILLOW_PROFILE
};
```

**Kein Commit ohne gemessene Zahlen!**

---

## 7. Korrigierte Pilot-Checkliste Kissen 051

### Phase 1: Vorbereitung (KEIN CODE!)

```markdown
[ ] 1. BRILDOR Kissenbezug Artikelnummer + EK recherchieren
[ ] 2. Bezug bestellen (oder alternativen Polyester-Bezug)
[ ] 3. Foto vorn anfertigen (Studio-Look, weißer Grund)
[ ] 4. Emblem-Composite in Druckzone (Photoshop/GIMP)
[ ] 5. Overlay-Rechteck in % messen (Photoshop Rulers)
       - top: X% vom oberen Rand
       - left: X% vom linken Rand
       - width: X% Breite
       - height: X% Höhe
[ ] 6. Placement-Zone definieren (wo Motiv im Atelier landet)
[ ] 7. No-Print-Text formulieren ("Nähte, 1cm Rand")
```

### Phase 2: Code-Erweiterung (NUR nach Phase 1!)

```markdown
[ ] 8. lib/print-spec.ts öffnen und LESEN (Interface verstehen!)
[ ] 9. PILLOW_PROFILE Konstante anlegen (siehe Abschnitt 6)
[ ] 10. ⚠️ TEE_PROFILE / SHORTS_PROFILE NICHT ANFASSEN!
[ ] 11. Overlay = gemessene Werte aus Phase 1 (keine null!)
[ ] 12. mmReferenceHeight: null (erst nach Messung am Blank)
[ ] 13. Fotos unter public/products/051/ ablegen
[ ] 14. NO_PRINT_NOTE_BY_PRODUCT['3'] = "Nähte, 1cm Rand"
```

### Phase 3: Test (KEIN SHOP!)

```markdown
[ ] 15. Dummy-Design mit Emblem erstellen
[ ] 16. saveDesign() intern aufrufen → Transform speichern
[ ] 17. Fake-Order anlegen (ohne Stripe, nur DB-Test)
[ ] 18. Admin-PDF generieren: /api/orders/{id}/print-pdf
[ ] 19. PDF visuell prüfen:
        - Druckblatt 2480×3508px
        - Overlay-Rechteck stimmt mit Foto überein
        - Kundenblick zeigt Emblem an richtiger Stelle
        - No-Print-Zonen im Diagramm
```

### Phase 4: Aktivierung (NUR nach Jonny-OK!)

```markdown
[ ] 20. Jonny-Review: Foto, Overlay, PDF
[ ] 21. Preis festlegen (VK nach EK + Kalkulation)
[ ] 22. lib/products.ts → Produkt 3 anlegen
[ ] 23. lib/pricing.ts → Preis für productId 3
[ ] 24. Optional: GLB pillow-white-v1.glb (Quader-Mesh)
[ ] 25. Optional: MODEL_PATHS['3'] wenn GLB vorhanden
[ ] 26. Optional: Kamera getCamera('3') wenn 3D
[ ] 27. Shop-Route /product/3 aktivieren
[ ] 28. Shop-Status: pilot → shop_live
[ ] 29. Vercel Deploy
```

---

## 8. Nächster Schritt — Jonny wählt

### Option A — Pilot Kissen (KORRIGIERT)

**1. Vorbereitung ohne Code:**
- BRILDOR Bezug recherchieren/bestellen
- Foto mit Emblem anfertigen
- Overlay AM FOTO messen (Photoshop Rulers)

**2. Code nur nach Foto:**
- `lib/print-spec.ts` **LESEN** (Interface verstehen!)
- `PILLOW_PROFILE` anhängen (nicht ersetzen!)
- Live-Profile nicht anfassen

**3. Test intern:**
- Dummy-PDF, visuell prüfen

**4. Shop erst nach Jonny-OK:**
- Preis, products.ts, Shop-Route

**Zeitrahmen:** 1-2 Wochen  
**Risiko:** Niedrig (gleiche Presse wie Tee)

---

### Option B — Partner-Angebote einholen

**Zick Production (Lohndruck):**

```
An: info@zick-production.de
Betreff: Anfrage Lohndruck Sublimation — ON ME HoneyB

Sehr geehrte Damen und Herren,

wir betreiben einen Print-on-Demand-Shop (on-me-honey-b.vercel.app) 
mit Epson SC-F100 + VEVOR 11-in-1 und suchen einen Partner für 
Lohndruck auf mitgebrachte Polyester-Rohlinge:

1. Kissen (BRILDOR-Bezüge oder ähnlich)
2. Tassen (11 oz, eigene Rohlinge)
3. Taschen (Shopper, Turnbeutel)

Anfragen:
- Mindestabnahme pro Artikel?
- Preis pro Stück (exkl. Rohling)?
- Lieferzeit?
- Muster mit eigenem Emblem (PNG-Datei) möglich?

Mit freundlichen Grüßen,
Jonny (butasioan@googlemail.com)
```

**Shirtigo (Fulfillment):**

```
An: cockpit@shirtigo.de
Betreff: Shop-Anbindung ON ME HoneyB

Hallo Shirtigo-Team,

wir planen Fulfillment für Tassen, Kissen, Taschen über eure API.

Fragen:
- Keramiktasse glossy 11 oz: Preis ab Stk. 1? (Katalog prüfen)
- Kissenbezug 40×40cm verfügbar?
- API-Doku für Design-Upload?
- Eigenes Emblem (PNG) als Upload möglich?

Projekt: on-me-honey-b.vercel.app

Grüße,
Jonny
```

**⚠️ Shirtigo-Preis aus Cockpit-Katalog prüfen, nicht 4,50€ fest behaupten!**

**Zeitrahmen:** 1 Woche Antwort

---

### Option D — CSV erweitern

**Spalten an `produkte_133.csv` anhängen:**

```csv
family,printShape,overlayFrontTop,overlayFrontLeft,overlayFrontWidth,overlayFrontHeight
```

**Für 001/015:**
- Overlay-Zahlen aus LIVE-Code `lib/print-spec.ts` übernehmen
- Rest leer lassen bis Messung

**Zeitrahmen:** 2-3 Stunden

---

## 9. Zusammenfassung: Was gilt

| Dokument | Rolle | Verbindlichkeit |
|---|---|---|
| **Grok-Abgleich** (dieses) | Konfliktlösung | ✅ Höchste |
| **Live-Code** `lib/print-spec.ts` | Overlay-Wahrheit + Interface | ✅ Einzige Quelle |
| **Grok 3D-Konzept** | Architektur 133 | ✅ Technische Basis |
| **Claude Strategie** | Checklisten, Mails | ⚠️ Plan, nicht Code |

**Regel bei Widerspruch:** Audit + Live-Code schlagen Strategie-Chat.

---

## 10. Claude-Fehler anerkannt (erweitert)

### Erste Runde
1. ❌ Overlay-Zahlen für '1'/'2' erfunden statt Live-Code gelesen
2. ❌ Shirtigo-Preis falsch (6,69€ nicht 4,50€)
3. ❌ Zu optimistische ✅-Häkchen (Stripe LIVE)
4. ❌ BRILDOR als "dokumentiert" statt "Kandidat"
5. ❌ Shorts `back: null` statt existierendem Overlay

### Zweite Runde (Grok Abschnitt 12)
6. ❌ Interface falsch (`printShape`, `press`, `photo`, `noPrintZones` existieren nicht)
7. ❌ Feldnamen falsch (`photo` statt `frontSrc`/`backSrc`)
8. ❌ `null` für Typen die keine `null` akzeptieren (`Rect`, `string`)
9. ❌ Live-Konstanten (`TEE_PROFILE`) nicht erkannt
10. ❌ "Korrektur" immer noch nicht paste-bar

**Dank an Grok für BEIDE Audit-Runden!** 🙏

**Lektion:** Live-Code LESEN vor Code-Beispielen schreiben.

---

## 11. Was bleibt richtig ✅

- ✅ Familien-Strategie (~14 GLBs)
- ✅ 3 Schichten (2D + 3D + PDF)
- ✅ Pilot Kissen/Shopper als Konzept
- ✅ Live nicht anfassen (Prinzip)
- ✅ 32 SKUs prüfen (11-in-1)
- ✅ Checklisten Phase 1–4 nützlich
- ✅ Partner-Mails brauchbar (Preise korrigiert)

**Die Richtung stimmt. Die Code-Beispiele nicht.**

---

## 12. Git-Status: Keine PDFs/MDs untracked deployen

```bash
git status
```

Zeigt `??` für:
- `LAGEBERICHT-KOMPLETT-2026-10-21.md`
- `STRATEGIE-133-PRODUKTE-2026-10-21.md`
- `ABGLEICH-GROK-CLAUDE-2026-10-21.md`
- Alle anderen neuen MDs/PDFs

**Nicht mit `./p deploy` mitschicken!** Diese sind Dokumentation, nicht Shop-Code.

---

*Grok-Audit Runde 1+2 · 21.10.2026 · Live-Interface aus `lib/print-spec.ts` · Claude-Fehler 1–10 anerkannt*

**Kopien:**
- `~/Schreibtisch/ABGLEICH-GROK-CLAUDE-2026-10-21.md`
- `~/Schreibtisch/on-me-honey-b/ABGLEICH-GROK-CLAUDE-2026-10-21.md` (untracked, nicht deployen)
- `~/Downloads/ON-ME-HoneyB-Audit.md`
