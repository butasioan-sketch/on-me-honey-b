import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/app/components/SiteHeader";
import LiveProductGrid from "@/app/components/LiveProductGrid";
import {
  CampaignFooter,
  CampaignIntro,
} from "@/app/components/CampaignContent";
import {
  CAMPAIGNS,
  campaignCopies,
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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <SiteHeader />
      <main
        id="main-content"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1rem" }}
      >
        <CampaignIntro
          icon={campaign.icon}
          copies={campaignCopies(campaign)}
          active={isCampaignActive(campaign)}
        />
        <LiveProductGrid products={getCampaignProducts(campaign)} />
        <CampaignFooter />
      </main>
    </div>
  );
}
