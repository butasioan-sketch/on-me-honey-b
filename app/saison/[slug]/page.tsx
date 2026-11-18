import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/app/components/SiteHeader";
import LiveProductGrid from "@/app/components/LiveProductGrid";
import {
  CAMPAIGNS,
  getCampaign,
  getCampaignProducts,
  isCampaignActive,
} from "@/lib/catalog/campaigns";

// Saisonfenster wechseln nach Datum: stündlich neu rendern.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CAMPAIGNS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) return {};
  return {
    title: `${campaign.name} — ON ME HONEY B`,
    description: campaign.intro,
    alternates: { canonical: `/saison/${campaign.slug}` },
  };
}

export default async function SaisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const active = isCampaignActive(campaign);
  const products = getCampaignProducts(campaign);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <SiteHeader />
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1rem" }}
      >
        <p
          style={{
            color: "#D4AF37",
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontSize: "0.8rem",
          }}
        >
          SAISON · {campaign.name.toUpperCase()}
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: 900,
            margin: "0.5rem 0 1rem",
          }}
        >
          {campaign.icon} {campaign.headline}
        </h1>
        <p
          style={{
            color: "#ccc",
            maxWidth: "640px",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          {active ? campaign.intro : campaign.announcement}
        </p>

        <LiveProductGrid products={products} />

        <p style={{ marginTop: "2.5rem", color: "#aaa" }}>
          Weitere Ideen:{" "}
          <Link href="/geschenke" style={{ color: "#D4AF37" }}>
            Alle Geschenke
          </Link>
        </p>
      </main>
    </div>
  );
}
