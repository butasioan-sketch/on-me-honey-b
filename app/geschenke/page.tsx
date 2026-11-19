import type { Metadata } from "next";
import SiteHeader from "@/app/components/SiteHeader";
import LiveProductGrid from "@/app/components/LiveProductGrid";
import { GiftsIntro, SeasonNav } from "@/app/components/CampaignContent";
import {
  CAMPAIGNS,
  campaignCopies,
  getGiftProducts,
} from "@/lib/catalog/campaigns";

export const metadata: Metadata = {
  title: "Geschenke — ON ME HONEY B",
  description:
    "Persönliche Geschenke mit eigenem Motiv. Maßgefertigt nach deiner Bestellung.",
  alternates: { canonical: "/geschenke" },
};

export default function GeschenkePage() {
  const seasons = Object.values(CAMPAIGNS).map((c) => ({
    slug: c.slug,
    icon: c.icon,
    copy: campaignCopies(c),
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <SiteHeader />
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1rem" }}
      >
        <GiftsIntro />
        <LiveProductGrid products={getGiftProducts()} />
        <SeasonNav seasons={seasons} />
      </main>
    </div>
  );
}
