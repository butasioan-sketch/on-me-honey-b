import type { Category } from "@/lib/products-all-133";

/**
 * Einleitungstexte der Kategorieseiten (SEO-Audit 24.11.2026: Kategorien hatten < 150 Wörter).
 * Regel: nur belegbare Aussagen. Bestellbar ist derzeit nur die Essential Collection
 * (AirFit Pro T-Shirt + Shorts); alle anderen Artikel sind als 3D-Vorschau mit eigenem
 * Motiv ansehbar. Druckverfahren je Artikel erst nennen, wenn Rohling + Testdruck feststehen.
 */
export type CategoryCopy = {
  description: string;
  paragraphs: string[];
  ideas: string[];
};

const COMMON =
  "Jeder Artikel hat ein eigenes 3D-Modell: Du lädst dein Motiv hoch und siehst es sofort von allen Seiten auf dem Produkt.";

export const CATEGORY_COPY: Record<Category, CategoryCopy> = {
  A: {
    description:
      "Bekleidung mit deinem eigenen Motiv: T-Shirt und Shorts der Essential Collection im Atelier gestalten, weitere Kleidung als 3D-Vorschau.",
    paragraphs: [
      "In dieser Kategorie findest du Kleidung, die mit deinem eigenen Motiv gestaltet wird – vom T-Shirt über Shorts bis zu Hoodies, Langarmshirts und Sportbekleidung.",
      "Als Erstes startet die Essential Collection: das AirFit Pro T-Shirt und die AirFit Pro Shorts aus AirFit Performance Fabric, unisex und auf Bestellung in Handarbeit gefertigt. Du gestaltest Vorder- und Rückseite im Atelier, wir fertigen dein Teil einzeln an.",
      COMMON +
        " So kannst du Ideen für Team-Shirts, Vereinskleidung oder Geschenke schon heute ausprobieren, auch wenn der Artikel noch in Vorbereitung ist.",
    ],
    ideas: [
      "Team- und Vereinsshirts",
      "Lauf- und Sportbekleidung",
      "Shirt mit Familienfoto",
      "Jubiläum und Junggesellenabschied",
    ],
  },
  B: {
    description:
      "Taschen und Accessoires mit eigenem Motiv: Stofftaschen, Turnbeutel, Kosmetiktaschen, Etuis und Lanyards als 3D-Vorschau gestalten.",
    paragraphs: [
      "Taschen und Accessoires sind ideale Flächen für ein großes Motiv: Stofftaschen und Shopper, Turnbeutel, Kosmetiktaschen, Etuis, Laptop-Hüllen, Lanyards und kleine Begleiter für den Alltag.",
      COMMON,
      "Die Artikel dieser Kategorie sind in Vorbereitung. Wir schalten jeden Artikel erst frei, wenn Rohling, Druckprofil und ein echter Testdruck geprüft sind – damit das Ergebnis so aussieht wie in der Vorschau.",
    ],
    ideas: [
      "Einkaufsbeutel mit Logo",
      "Turnbeutel für den Verein",
      "Kosmetiktasche als Geschenk",
      "Lanyard für Events",
    ],
  },
  C: {
    description:
      "Wohnen und Dekoration mit deinem Motiv: Kissenbezüge, Küchentextilien, Fotopaneele, Schilder und mehr als 3D-Vorschau ansehen.",
    paragraphs: [
      "Für dein Zuhause: Kissenbezüge, Küchen- und Grillschürzen, Tischsets, Untersetzer, Fotopaneele, Wandbilder, Schilder und Wanduhren, die dein Foto oder deine Grafik groß in Szene setzen.",
      COMMON,
      "Diese Kategorie ist in Vorbereitung. Wohntextilien und Dekoartikel werden einzeln geprüft, bevor sie bestellbar sind.",
    ],
    ideas: [
      "Kissen mit Haustierfoto",
      "Fotopaneel vom Urlaub",
      "Grillschürze als Geschenk",
      "Türschild fürs Kinderzimmer",
    ],
  },
  D: {
    description:
      "Persönliche Geschenke, Büro- und Technikartikel mit eigenem Motiv – als 3D-Vorschau gestalten und vergleichen.",
    paragraphs: [
      "Geschenkartikel, Büro und Technik: Mauspads, Schlüsselanhänger, Puzzles, Schmuckanhänger und viele kleine Dinge, die mit einem persönlichen Motiv zum Unikat werden.",
      COMMON,
      "Auf der Geschenkseite stehen nur Artikel, die bereits im Atelier gestaltet und bestellt werden können.",
    ],
    ideas: [
      "Mauspad mit Teamfoto",
      "Puzzle aus dem Lieblingsbild",
      "Schlüsselanhänger zum Jahrestag",
      "Kleine Firmengeschenke",
    ],
  },
  E: {
    description:
      "Tassen, Becher und Trinkgefäße mit deinem Motiv: Fototasse, Thermobecher und Flaschen als 3D-Vorschau ansehen.",
    paragraphs: [
      "Tassen, Becher und Trinkgefäße gehören zu den beliebtesten persönlichen Geschenken – mit Foto, Spruch oder Logo rundherum.",
      COMMON +
        " Du drehst die Tasse im Viewer und prüfst, ob dein Motiv am Henkel und an der Naht gut sitzt.",
      "Diese Kategorie ist in Vorbereitung und wird freigeschaltet, sobald Rohlinge und Testdrucke abgenommen sind.",
    ],
    ideas: [
      "Fototasse für die Großeltern",
      "Thermobecher mit Firmenlogo",
      "Becher zum Geburtstag",
      "Trinkflasche fürs Training",
    ],
  },
  F: {
    description:
      "Kappen mit eigenem Motiv: Basecaps, Trucker-Caps, Kindercaps und Visors als 3D-Vorschau gestalten.",
    paragraphs: [
      "Kappen und Kopfbedeckungen: Basecaps, Trucker-Caps, 5-Panel-Caps, Sportcaps, Kindercaps und Visors – mit deinem Logo oder Motiv auf der Front.",
      COMMON,
      "Die Artikel sind in Vorbereitung. Gerade bei Caps ist die Druckfläche klein und gewölbt; deshalb prüfen wir jede Form mit einem echten Testdruck, bevor sie bestellbar ist.",
    ],
    ideas: [
      "Cap mit Vereinslogo",
      "Kindercap mit Namen",
      "Trucker-Cap als Merch",
      "Visor fürs Tennis",
    ],
  },
  G: {
    description:
      "Teller mit deinem Motiv: Sublimationsteller, Dekorationsteller und Unterteller als 3D-Vorschau ansehen.",
    paragraphs: [
      "Teller: runde Sublimationsteller, kleine und große Dekorationsteller und Unterteller, die ein Motiv dauerhaft festhalten.",
      COMMON,
      "Diese Kategorie ist in Vorbereitung. Keramik wird erst freigeschaltet, wenn Farbtreue und Haltbarkeit am echten Stück geprüft sind.",
    ],
    ideas: [
      "Fototeller zur Hochzeit",
      "Dekoteller mit Logo",
      "Teller als Erinnerung",
      "Teller zum Jubiläum",
    ],
  },
  H: {
    description:
      "Stifte und Schreibgeräte mit eigenem Motiv oder Logo – als 3D-Vorschau für Büro, Verein und Werbung.",
    paragraphs: [
      "Stifte und Schreibgeräte sind kleine Werbeträger mit großer Reichweite: Kugelschreiber, Werbestifte und hitzefeste Schreibgeräte mit Logo oder Namen.",
      COMMON,
      "Die Artikel sind in Vorbereitung und werden nach Prüfung von Rohling und Druckbild freigeschaltet.",
    ],
    ideas: [
      "Kugelschreiber mit Firmenlogo",
      "Stift mit Namen zur Einschulung",
      "Stifte für die Praxis",
      "Messe-Giveaways",
    ],
  },
  I: {
    description:
      "Schuhe mit deinem Motiv: Sneaker, Stoffschuhe und Schuhzungen als 3D-Vorschau von allen Seiten ansehen.",
    paragraphs: [
      "Schuhe mit eigenem Design: Polyester-Sneaker, leichte Stoffschuhe, Schuhoberteile und Schuhzungen, auf denen dein Motiv rundherum sichtbar wird.",
      COMMON +
        " Gerade bei Schuhen hilft die Seitenansicht, das Motiv an Spitze und Ferse richtig zu platzieren.",
      "Diese Kategorie ist in Vorbereitung und wird nach Prüfung jeder Schuhform freigeschaltet.",
    ],
    ideas: [
      "Sneaker im Teamdesign",
      "Stoffschuhe als Geschenk",
      "Schuhe zum Junggesellenabschied",
      "Schuhzungen im Teamdesign",
    ],
  },
};
