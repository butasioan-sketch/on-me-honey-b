# GLB-Referenzprüfung 001–129

Stand 18.11.2026 · Claude · Zweig `fix/glb-masse-jn`. 130–133 ausgenommen (Gemini/Codex).

**Methode:** Jedes GLB aus `public/models/sku/` mit Cycles gerendert (Schrägansicht, bei Verdacht zusätzlich hinten/unten) und neben `public/products/<sku>/front.jpg` gelegt; zusätzlich Codex' Firefox-Fotos (`00_Xena/.../Testnachweise/Firefox-133`) für 035/036/048/055/057/059/060/061. Sichtprüfung auf Form, Proportion, sichtbare Bauteile, Öffnungen/Schichtkanten. Maße nur für 001/015 (Hersteller-Maßblatt) und 051 (BRILDOR) geprüft; alle anderen Maße bleiben Schätzwerte (siehe Kopf der jeweiligen `build_<sku>.py`).

**Ergebnis:** 129 SKUs geprüft · 22 korrigiert · 1 mit offener, benannter Abweichung · Rest übereinstimmend.

Alle Korrekturen bauen deterministisch (`blender -b -t 1`), Budget < 300 KiB, keine Draco-Kompression; unveränderte SKUs sind byte-gleich.

| SKU | Name | Status |
|---|---|---|
| 001 | Unisex-T-Shirts | korrigiert eec62f7: Maße JN827 M (Rumpf 54,0 cm) |
| 002 | Damen-T-Shirts | übereinstimmend in Form und Proportion |
| 003 | Herren-T-Shirts | übereinstimmend in Form und Proportion |
| 004 | Kinder-T-Shirts | übereinstimmend in Form und Proportion |
| 005 | Baby-Bodys | geprüft: Schritt/Druckknöpfe sauber (Scheinbefund) |
| 006 | Tanktops | übereinstimmend in Form und Proportion |
| 007 | Poloshirts | übereinstimmend in Form und Proportion |
| 008 | Langarmshirts | übereinstimmend in Form und Proportion |
| 009 | Sporttrikots | übereinstimmend in Form und Proportion |
| 010 | Basketballtrikots | übereinstimmend in Form und Proportion |
| 011 | Fußballtrikots | übereinstimmend in Form und Proportion |
| 012 | Laufshirts | übereinstimmend in Form und Proportion |
| 013 | Fitness-Tops | übereinstimmend in Form und Proportion |
| 014 | Sport-BHs | übereinstimmend in Form und Proportion |
| 015 | Shorts | korrigiert eec62f7: Maße JN387 M (Hüfte 54,6, Bund 53,3, Länge 48,0 cm) |
| 016 | Sporthosen | geprüft: Beinbündchen vorhanden (Scheinbefund aus Blickwinkel) |
| 017 | Jogginghosen | übereinstimmend in Form und Proportion |
| 018 | Leggings | übereinstimmend in Form und Proportion |
| 019 | Radlerhosen | korrigiert 4cdb620: V-Kerbe/Spalt unter dem Bund geschlossen, flacher Bund |
| 020 | Trainingsjacken | übereinstimmend in Form und Proportion |
| 021 | Hoodies | übereinstimmend in Form und Proportion |
| 022 | Sweatshirts | übereinstimmend in Form und Proportion |
| 023 | Unterhemden | übereinstimmend in Form und Proportion |
| 024 | Polyester-Socken | übereinstimmend in Form und Proportion |
| 025 | Stirnbänder | übereinstimmend in Form und Proportion |
| 026 | Schweißbänder | übereinstimmend in Form und Proportion |
| 027 | Bandanas | übereinstimmend in Form und Proportion |
| 028 | Schlauchtücher | übereinstimmend in Form und Proportion |
| 029 | Halstücher | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 030 | Polyester-Schals | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 031 | Stoff-Aufnäher / Patches | übereinstimmend in Form und Proportion |
| 032 | Stofftragetaschen | übereinstimmend in Form und Proportion |
| 033 | Einkaufstaschen / Shopper | übereinstimmend in Form und Proportion |
| 034 | Turnbeutel | übereinstimmend in Form und Proportion |
| 035 | Sportbeutel | korrigiert (Faltlagen-Commit): Kordeln weich statt geknickt |
| 036 | Kleine Sporttaschen | korrigiert (Caps/036/102-Commit): schwarze Front-Reißverschlusslinie ergänzt; Griffe und oberer Reißverschluss waren bereits schwarz |
| 037 | Kosmetiktaschen | übereinstimmend in Form und Proportion |
| 038 | Kulturbeutel | übereinstimmend in Form und Proportion |
| 039 | Federmäppchen | übereinstimmend in Form und Proportion |
| 040 | Stiftemäppchen | übereinstimmend in Form und Proportion |
| 041 | Kleine Geldbörsen | übereinstimmend in Form und Proportion |
| 042 | Brillenetuis | übereinstimmend in Form und Proportion |
| 043 | Laptop-Hüllen | übereinstimmend in Form und Proportion |
| 044 | Tablet-Hüllen | übereinstimmend in Form und Proportion |
| 045 | Dokumententaschen | übereinstimmend in Form und Proportion |
| 046 | Reisepasshüllen | übereinstimmend in Form und Proportion |
| 047 | Kofferanhänger | korrigiert (047-Commit): Gurtschlaufe ca. 2 cm breit / gut 4 cm hoch mit schwarzer Schnalle, Sichtfenster vorne unten |
| 048 | Schlüsselbänder / Lanyards | korrigiert (Faltlagen-Commit): Karabiner oval mit Schnapper, Ausreißer-Vertex entfernt |
| 049 | Schlüsselanhänger Polyester | übereinstimmend in Form und Proportion |
| 050 | Kartenetuis | übereinstimmend in Form und Proportion |
| 051 | Dekokissenbezüge | übereinstimmend in Form und Proportion |
| 052 | Kopfkissenbezüge | übereinstimmend in Form und Proportion |
| 053 | Zierkissenbezüge | übereinstimmend in Form und Proportion |
| 054 | Polyester-Küchentücher | übereinstimmend in Form und Proportion |
| 055 | Geschirrtücher | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 056 | Sporthandtücher Mikrofaser | übereinstimmend in Form und Proportion |
| 057 | Gästehandtücher | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 058 | Tischsets | übereinstimmend in Form und Proportion |
| 059 | Tischläufer | korrigiert (Faltlagen-Commit): Faltlagen geschlossen |
| 060 | Stoffservietten | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 061 | Kleine Tischdecken | korrigiert (Faltlagen-Commit): Faltstapel geschlossen, keine Schlitze |
| 062 | Küchen- und Grillschürzen | übereinstimmend in Form und Proportion |
| 063 | Topflappen | übereinstimmend in Form und Proportion |
| 064 | Untersetzer MDF | übereinstimmend in Form und Proportion |
| 065 | Untersetzer Kork | übereinstimmend in Form und Proportion |
| 066 | Untersetzer Aluminium | übereinstimmend in Form und Proportion |
| 067 | Kleine Wandbilder Aluminium | übereinstimmend in Form und Proportion |
| 068 | Fotoschilder | übereinstimmend in Form und Proportion |
| 069 | Sublimations-Fotopaneele | übereinstimmend in Form und Proportion |
| 070 | Dekorative MDF-Schilder | übereinstimmend in Form und Proportion |
| 071 | Türschilder | übereinstimmend in Form und Proportion |
| 072 | Namensschilder | übereinstimmend in Form und Proportion |
| 073 | Tischschilder | übereinstimmend in Form und Proportion |
| 074 | Wanduhrenrohlinge | übereinstimmend in Form und Proportion |
| 075 | Kleine Dekofahnen | übereinstimmend in Form und Proportion |
| 076 | Wimpel | übereinstimmend in Form und Proportion |
| 077 | Kleine Stoffbanner | übereinstimmend in Form und Proportion |
| 078 | Mauspads | geprüft: Rückansicht in Firefox zeigt die dunkle Gummiunterseite; Rohling und Maße separat bestätigen |
| 079 | Gaming-Mauspads | übereinstimmend in Form und Proportion |
| 080 | Schreibtischunterlagen | übereinstimmend in Form und Proportion |
| 081 | Handyhüllen | übereinstimmend in Form und Proportion |
| 082 | Schlüsselanhänger Metall | übereinstimmend in Form und Proportion |
| 083 | Schlüsselanhänger MDF | übereinstimmend in Form und Proportion |
| 084 | Kühlschrankmagnete | übereinstimmend in Form und Proportion |
| 085 | Flaschenöffner | korrigiert von Codex 22a238e: Metallkörper, Druckfläche, Loch, Öffnung; Öffnung leicht eckiger als Foto (von Claude in Firefox gesehen) |
| 086 | Lesezeichen Aluminium | übereinstimmend in Form und Proportion |
| 087 | Foto-Puzzles bis A4 | übereinstimmend in Form und Proportion |
| 088 | Untersetzer-Sets | übereinstimmend in Form und Proportion |
| 089 | Visitenkarten Metall | übereinstimmend in Form und Proportion |
| 090 | Kleine Ausweisschilder | übereinstimmend in Form und Proportion |
| 091 | Namensplaketten | übereinstimmend in Form und Proportion |
| 092 | Notizbücher | übereinstimmend in Form und Proportion |
| 093 | Dekorative Fototafeln | übereinstimmend in Form und Proportion |
| 094 | Weihnachtsanhänger | übereinstimmend in Form und Proportion |
| 095 | Weihnachtsbaum-Ornamente | übereinstimmend in Form und Proportion |
| 096 | Geschenkanhänger | übereinstimmend in Form und Proportion |
| 097 | Hundemarken | übereinstimmend in Form und Proportion |
| 098 | Haustier-Namensschilder | übereinstimmend in Form und Proportion |
| 099 | Kleine Bilderrahmen | übereinstimmend in Form und Proportion |
| 100 | Schmuckanhänger | übereinstimmend in Form und Proportion |
| 101 | Kleine Fotokacheln Keramik | übereinstimmend in Form und Proportion |
| 102 | Keramiktassen 6 oz | korrigiert (Caps/036/102-Commit): bauchige Tulpenform mit schmalem Fuß |
| 103 | Keramiktassen 9 oz | übereinstimmend in Form und Proportion |
| 104 | Keramiktassen 11 oz | übereinstimmend in Form und Proportion |
| 105 | Keramiktassen 12 oz | übereinstimmend in Form und Proportion |
| 106 | Zweifarbige Tassen | übereinstimmend in Form und Proportion |
| 107 | Magic Mugs | übereinstimmend in Form und Proportion |
| 108 | Emaillebecher | übereinstimmend in Form und Proportion |
| 109 | Metallbecher | übereinstimmend in Form und Proportion |
| 110 | Edelstahl-Trinkbecher | übereinstimmend in Form und Proportion |
| 111 | Thermobecher | übereinstimmend in Form und Proportion |
| 112 | Trinkflaschen | übereinstimmend in Form und Proportion |
| 113 | Aluminium-Trinkflaschen | übereinstimmend in Form und Proportion |
| 114 | Campingbecher | übereinstimmend in Form und Proportion |
| 115 | Kinderbecher | übereinstimmend in Form und Proportion |
| 116 | Stiftehalter in Becherform | übereinstimmend in Form und Proportion |
| 117 | Basecaps | korrigiert (Caps/036/102-Commit): Schirm D-förmig, ohne Ecken, vorgebogen |
| 118 | Trucker-Caps | korrigiert 4cdb620: Netzbahnen sichtbar abgesetzt |
| 119 | 5-Panel-Caps | korrigiert (Caps/036/102-Commit): Schirm D-förmig, ohne Ecken, vorgebogen |
| 120 | Sportcaps | korrigiert 4cdb620: Perforationsfeld sichtbar abgesetzt |
| 121 | Kindercaps | korrigiert (Caps/036/102-Commit): Schirm D-förmig, ohne Ecken, vorgebogen |
| 122 | Visors | korrigiert (Caps/036/102-Commit): Schirm D-förmig und vorgebogen; Hinweis: glb-verify cap meldet wie vorher BBox-Höhe 7 cm < 10 cm (Visor ohne Krone, Altbefund) |
| 123 | Runde Sublimationsteller | übereinstimmend in Form und Proportion |
| 124 | Kleine Dekorationsteller | übereinstimmend in Form und Proportion |
| 125 | Große Dekorationsteller | übereinstimmend in Form und Proportion |
| 126 | Unterteller | übereinstimmend in Form und Proportion |
| 127 | Kugelschreiber | übereinstimmend in Form und Proportion |
| 128 | Werbestifte | übereinstimmend in Form und Proportion |
| 129 | Schreibgeräte hitzefest | übereinstimmend in Form und Proportion |
