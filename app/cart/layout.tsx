import type { Metadata } from "next";

// Warenkorb ist personenbezogen und ohne eigenen Inhalt → nicht in den Suchindex.
export const metadata: Metadata = {
  title: "Warenkorb | ON ME HONEY B",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
