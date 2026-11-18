# A4-Flachartikel: Rohlinge und Druckverfahren (Nachweisstand)

Stand 18.11.2026 · erfasst von Claude aus vorhandenen Daten · **keine Freischaltung, kein Preis**.

Grundlage: `lib/catalog/produkte_133_komplett.csv` (printShape `a4_flat`, 54 SKUs), Produktkatalog 133 „Fertig“ (21.10.2026, Repo-Wurzel), BRILDOR-PDF (Repo-Wurzel), Kalkulations-CSV 169 (`~/Downloads/downloads 2026 gesamt/ON_ME_KALKULATION_169_POSITIONEN.csv`, Spalte `source`) und deren Quellenlegende (ChatGPT-Gespräch 18.10.2026 im Vault).

## Druckverfahren (für alle a4_flat gleich, belegt)

| Schritt | Technik | Grenze |
|---|---|---|
| Transfer | Epson SureColor SC-F100, Sublimation | max. DIN A4 (210 × 297 mm), gespiegelt |
| Presse | VEVOR TL-LZ11001 Flachpresse | Heizplatte 29 × 38 cm |
| Rohling | weißes Polyester oder polymerbeschichtet | Druck auf Baumwolle nicht möglich |
| Temperatur/Zeit | nur für BRILDOR belegt: 180 °C, 60 s, mittlerer bis hoher Druck | für alle anderen **offen** (Datenblatt) |

Testvorlage für den physischen Druck: `docs/print-tests/051-a4-randmotiv.png` (Erzeuger `scripts/make-print-test-a4.py <sku>`).

## Belegstufen

- **A** belegt: Lieferantendokument oder Live-Shop-Einkauf mit Artikel, Material und EK.
- **B** Hinweis: Artikelname im Katalog genannt, aber kein Datenblatt/EK im Repo.
- **C** Link: nur Händler-URL und Preis aus Kalkulationstabelle, kein abgelegtes Dokument; vor Einkauf abrufen und als PDF ablegen.
- **–** Lücke: keine Lieferantenangabe vorhanden.

Verteilung: A 3 · B 4 · C 2 · Lücke 45.

## Widersprüche in den Quellen

- Kalkulations-CSV P01 nennt **Henbury H075** (10,91 € netto) für 001; Shop und Code nutzen **JN827**. CSV ist für 001 veraltet.
- Kalkulations-CSV P02 nennt **PROACT PA1050** für Shorts; Shop nutzt **JN387**. Katalog führt PA1050 nur als Alternative.
- Kalkulations-CSV P04 nennt **BestSublimation** Kissenbezug 1,47 € netto; Katalog und 051-Pfad nutzen **BRILDOR** 2,39 € netto. Zwei Kandidaten, Bestellentscheidung offen.
- Alle Kalkulations-EK außer P01–P06 sind Modellwerte (`source = MODELL`), keine Angebote.

## Nächste Kandidaten (meiste Nachweise zuerst)

1. **053 Zierkissenbezüge**: gleicher BRILDOR-Rohling wie 051 möglich; Koordinatenfix 051 übertragbar. Fehlt: Maß, Entscheidung eigener Rohling oder Variante von 051.
2. **033 Shopper**: BagBase BG901 benannt, Preis vorhanden. Fehlt: Datenblatt (Material, Druckfläche, Temperatur), abgelegtes Angebot.
3. **078 Mauspads**: Egotier 93282 benannt. Fehlt: Maß, Dicke, Datenblatt, bestätigter Preis.
4. **009–011 Trikots**: PROACT PA4012 benannt. Fehlt: EK, Größen, Datenblatt.

## Tabelle aller a4_flat-SKUs

| SKU | Name | Status | Stufe | Rohling | Quelle / Lücke |
|---|---|---|---|---|---|
| 001 | Unisex-T-Shirts | shop_live | A | James & Nicholson JN827 | Live-Shop, Repo CLAUDE.md; EK 16,40 € brutto |
| 002 | Damen-T-Shirts | anker | – | offen | keine Lieferantenangabe vorhanden |
| 003 | Herren-T-Shirts | anker | – | offen | keine Lieferantenangabe vorhanden |
| 004 | Kinder-T-Shirts | anker | – | offen | keine Lieferantenangabe vorhanden |
| 005 | Baby-Bodys | offen | – | offen | keine Lieferantenangabe vorhanden |
| 006 | Tanktops | offen | – | offen | keine Lieferantenangabe vorhanden |
| 007 | Poloshirts | offen | – | offen | keine Lieferantenangabe vorhanden |
| 008 | Langarmshirts | offen | – | offen | keine Lieferantenangabe vorhanden |
| 009 | Sporttrikots | offen | B | PROACT PA4012, 100 % rec. PE, 130 g/m² | Katalog 133 Lieferanten-Hinweis (Rexlander); kein EK, kein Datenblatt |
| 010 | Basketballtrikots | offen | B | PROACT PA4012 (wie 009) | Katalog 133 Lieferanten-Hinweis; kein EK, kein Datenblatt |
| 011 | Fußballtrikots | offen | B | PROACT PA4012 (wie 009) | Katalog 133 Lieferanten-Hinweis; kein EK, kein Datenblatt |
| 012 | Laufshirts | anker | – | offen | keine Lieferantenangabe vorhanden |
| 013 | Fitness-Tops | offen | – | offen | keine Lieferantenangabe vorhanden |
| 014 | Sport-BHs | offen | – | offen | keine Lieferantenangabe vorhanden |
| 015 | Shorts | shop_live | A | James & Nicholson JN387 | Live-Shop, Repo CLAUDE.md; EK 10,60 € brutto |
| 018 | Leggings | offen | – | offen | keine Lieferantenangabe vorhanden |
| 019 | Radlerhosen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 023 | Unterhemden | anker | – | offen | keine Lieferantenangabe vorhanden |
| 024 | Polyester-Socken | offen | – | offen | keine Lieferantenangabe vorhanden |
| 025 | Stirnbänder | offen | – | offen | keine Lieferantenangabe vorhanden |
| 026 | Schweißbänder | offen | – | offen | keine Lieferantenangabe vorhanden |
| 027 | Bandanas | offen | – | offen | keine Lieferantenangabe vorhanden |
| 028 | Schlauchtücher | offen | – | offen | keine Lieferantenangabe vorhanden |
| 029 | Halstücher | offen | – | offen | keine Lieferantenangabe vorhanden |
| 030 | Polyester-Schals | offen | – | offen | keine Lieferantenangabe vorhanden |
| 032 | Stofftragetaschen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 033 | Einkaufstaschen / Shopper | anker | C | BagBase BG901 Shopper, weiß, 100 % PE | Kalkulations-CSV P03: 2,69 € netto, dtf1.de; nur Link, kein Dokument im Repo |
| 034 | Turnbeutel | offen | – | offen | keine Lieferantenangabe vorhanden |
| 035 | Sportbeutel | offen | – | offen | keine Lieferantenangabe vorhanden |
| 037 | Kosmetiktaschen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 038 | Kulturbeutel | offen | – | offen | keine Lieferantenangabe vorhanden |
| 039 | Federmäppchen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 040 | Stiftemäppchen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 041 | Kleine Geldbörsen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 042 | Brillenetuis | offen | – | offen | keine Lieferantenangabe vorhanden |
| 044 | Tablet-Hüllen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 045 | Dokumententaschen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 050 | Kartenetuis | offen | – | offen | keine Lieferantenangabe vorhanden |
| 051 | Dekokissenbezüge | pilot | A | BRILDOR Ref. 037944, 40×40 cm, 180 g/m² | BRILDOR-PDF im Repo (21.10.2026), EK 2,39 € netto |
| 052 | Kopfkissenbezüge | offen | – | offen | keine Lieferantenangabe vorhanden |
| 053 | Zierkissenbezüge | offen | B | BRILDOR Mikrofaser-Kissenbezug (wie 051) | Katalog 133 Lieferanten-Hinweis; Maß für Zierkissen nicht belegt |
| 054 | Polyester-Küchentücher | offen | – | offen | keine Lieferantenangabe vorhanden |
| 055 | Geschirrtücher | offen | – | offen | keine Lieferantenangabe vorhanden |
| 056 | Sporthandtücher Mikrofaser | offen | – | offen | keine Lieferantenangabe vorhanden |
| 057 | Gästehandtücher | offen | – | offen | keine Lieferantenangabe vorhanden |
| 058 | Tischsets | offen | – | offen | keine Lieferantenangabe vorhanden |
| 059 | Tischläufer | offen | – | offen | keine Lieferantenangabe vorhanden |
| 061 | Kleine Tischdecken | offen | – | offen | keine Lieferantenangabe vorhanden |
| 062 | Küchen- und Grillschürzen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 075 | Kleine Dekofahnen | offen | – | offen | keine Lieferantenangabe vorhanden |
| 077 | Kleine Stoffbanner | offen | – | offen | keine Lieferantenangabe vorhanden |
| 078 | Mauspads | offen | C | Egotier 93282 Sublimations-Mauspad | Kalkulations-CSV P05: 0,79 €, wordans.de, „Preisbasis prüfen“; nur Link |
| 087 | Foto-Puzzles bis A4 | offen | – | offen | keine Lieferantenangabe vorhanden |
| 092 | Notizbücher | offen | – | offen | keine Lieferantenangabe vorhanden |
