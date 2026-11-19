# SKU 051 – Dekokissenbezug 40 × 40 cm: Produktionspfad

Stand 18.11.2026 · vorbereitet von Claude · **nicht freigeschaltet** (`shop_live: false`, keine Gate-Aktivierung).

Ziel: erster vollständiger Produktionspfad außerhalb von 001/015. Alles unten ist belegt oder ausdrücklich als **offen** markiert. Keine Zahl ist geschätzt, außer wo „Schätzwert“ steht.

## 1. Rohling (belegt)

Quelle: `Sublimierbare Mikrofaser-Kissenbezüge _ BRILDOR ®.pdf` (Repo-Wurzel, Abruf 21.10.2026).

| Merkmal | Wert |
|---|---|
| Lieferant / Artikel | BRILDOR, „Kissenbezug 40x40 cm“, Ref. 037944, Art.-Nr. 953670 |
| Material | 100 % Polyester, Mikrofaser/kurzfloriger Velvet, 180 g/m² |
| Maß / Druckbereich | 40 × 40 cm, Druckbereich pro Seite 40 × 40 cm, beidseitig personalisierbar |
| Verschluss | seitlich, verdeckter Reißverschluss 30 cm; an dieser Seite 0,5 cm Naht freilassen |
| Gewicht | 78 g |
| EK | 2,39 € netto / 2,89 € brutto (Staffel: 10 × 2,15 €, 25 × 2,03 €, 50 × 1,91 € netto) |
| Füllung (separat) | Ref. 000098, 40 × 40 cm, 232 g, 2,25 € netto / 2,72 € brutto |
| Pflege | max. 40 °C, keine Trockenreinigung, kein Bleichmittel, Luft trocknen, niedrig bügeln |

## 2. Druck (belegt + Abgleich mit vorhandener Technik)

| Schritt | Herstellerwert | Eigene Technik (Produktkatalog 21.10.2026) |
|---|---|---|
| Transferdruck | gespiegelt drucken | Epson SureColor SC-F100, Transfer **bis DIN A4** |
| Presse | 180 °C, 60 s, mittlerer bis hoher Druck | VEVOR TL-LZ11001, Heizplatte 29 × 38 cm |

**Folgerung:** Der volle Druckbereich 40 × 40 cm ist mit der vorhandenen Technik **nicht** in einem Druck/Pressgang möglich. Machbar ist ein A4-Motiv (21 × 29,7 cm) pro Seite; beide Seiten = zwei Pressgänge.

## 3. Abgleich mit dem Code (Widersprüche, nicht geändert)

| Stelle | Ist | Problem | Vorschlag |
|---|---|---|---|
| `lib/print-spec.ts` `PILLOW_OVERLAY` | 52,5 % × 74,25 % (= A4 auf 40 cm) | passt zur A4-Technik | beibehalten |
| `lib/print-spec.ts` `PILLOW_PLACEMENT` | 80 % × 80 % (= 32 × 32 cm) | größer als A4-Transfer | auf A4-Fläche begrenzen oder größeres Transfersystem beschaffen |
| `PILLOW_PROFILE.overlayVerified` | `false` | kein Testdruck | bleibt `false` bis Testdruck |
| Katalogregister 051 `sides` | `'front+back'` | Hersteller bestätigt beide Seiten. Jonny möchte Vorder- und Rückseite anbieten. | Separate Pressgänge und beide Seiten physisch prüfen. |
| `lib/products-all-133.ts` 051 `hasGLB` | `false` | GLB existiert: `public/models/sku/051-v1.glb` (Codex, Blender-Quelle) | nach GLB-Abnahme auf `true` |
| `lib/products-all-133.ts` 051 `blank` | „BRILDOR Kissenbezug (Kandidat)“ | Artikel jetzt eindeutig | „BRILDOR Ref. 037944“ nach Bestellentscheidung |

## 4. Release-Gate (`lib/catalog/release-gate.ts`) – Status je Prüfung

| Prüfung | Status | Was fehlt |
|---|---|---|
| catalog | ✓ | – |
| blank | **offen** | Bestellentscheidung Rohling (Ref. 037944) |
| photo | ✓ | `public/products/051/front.jpg` |
| runtimeId | **offen** | `shopId` (vorgesehen `'3'`) erst bei Freigabe |
| price | **offen** | VK von Jonny; EK-Basis oben |
| printProfile | **offen** | `overlayVerified: false`; Placement > A4 (siehe 3.) |
| productionPath | **offen** | `PRODUCTION_EVIDENCE['051']` eintragen: mode `3d`, asset `/models/sku/051-v1.glb`, assetCheck = Codex-Firefox-Abnahme |
| physicalTestPrint | **offen** | Testdruck A4 auf Bezug, Vorschau ↔ PDF ↔ Ergebnis vergleichen |
| notBlocked | ✓ | kein 11-in-1 |
| jonnyOk | **offen** | Betreiberfreigabe |

## 5. Reihenfolge bis zur Freigabe

1. Jonny: VK festlegen, Rohling bestätigen (Ref. 037944, ggf. Füllung 000098).
2. Code: `PILLOW_PLACEMENT` auf A4 begrenzen; Register 051 (`blank`, `hasGLB`) aktualisieren; `PRODUCT_FLAT['3']` = VK.
3. Physischer Testdruck auf beiden Seiten mit 180 °C / 60 s je Pressgang; Ergebnis in `PRODUCTION_EVIDENCE['051'].physicalTestPrint` mit Datum/Quelle.
4. Gate-Test grün, dann `shopId '3'`, `shop_live: true`, `RELEASE_APPROVALS['051']` mit Jonny-Beleg.
5. Preview-Test: Atelier, Checkout (Stripe TEST), PDF, danach Produktion nach Gesamtabnahme.
