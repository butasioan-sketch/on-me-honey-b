import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import LiveProductGrid from "@/app/components/LiveProductGrid";
import { CAMPAIGNS, getGiftProducts } from "@/lib/catalog/campaigns";

export const metadata: Metadata = {
  title: "Geschenke — ON ME HONEY B",
  description:
    "Persönliche Geschenke mit eigenem Motiv. Maßgefertigt nach deiner Bestellung.",
  alternates: { canonical: "/geschenke" },
};

export default function GeschenkePage() {
  const products = getGiftProducts();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <SiteHeader />
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1rem" }}
      >
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: 900,
            marginBottom: "1rem",
          }}
        >
          🎁 Geschenke mit deinem Motiv
        </h1>
        <p
          style={{
            color: "#ccc",
            maxWidth: "640px",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Jedes Stück wird nach deiner Bestellung mit deinem Motiv gefertigt.
          Hier findest du alles, was du sofort gestalten und bestellen kannst.
        </p>

        <LiveProductGrid products={products} />

        <nav
          aria-label="Saison"
          style={{
            marginTop: "2.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {Object.values(CAMPAIGNS).map((c) => (
            <Link
              key={c.slug}
              href={`/saison/${c.slug}`}
              className="plt-card"
              style={{
                padding: "0.75rem 1.25rem",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
