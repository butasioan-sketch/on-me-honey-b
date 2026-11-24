import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/tracking" },
  robots: { index: false, follow: true },
  title: "Sendungsverfolgung | ON ME HONEY B",
  description:
    "Verfolge deine ON ME Bestellung — Gib deine Bestellnummer ein und sieh den aktuellen Status.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
