import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Großbestellung ab 21 Stück – Anfrage | ON ME HONEY B",
  description:
    "Für mehr als 20 Stück erstellen wir dir ein individuelles Angebot mit Preis, Produktionszeit und festem Liefertermin. Handgefertigt von einem kleinen Team.",
  alternates: { canonical: "/grossbestellung" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
