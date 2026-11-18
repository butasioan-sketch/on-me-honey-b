"use client";

import Link from "next/link";
import { useLocale } from "@/app/components/LocaleProvider";
import type { CampaignCopy } from "@/lib/catalog/campaigns";
import type { Locale } from "@/lib/i18n";

export type CopyByLocale = Record<Locale, CampaignCopy>;
export interface SeasonLink {
  slug: string;
  icon: string;
  copy: CopyByLocale;
}

const UI = {
  de: {
    season: "SAISON",
    more: "Weitere Ideen:",
    gifts: "Alle Geschenke",
    giftsTitle: "Geschenke mit deinem Motiv",
    giftsIntro:
      "Jedes Stück wird nach deiner Bestellung mit deinem Motiv gefertigt. Hier findest du alles, was du sofort gestalten und bestellen kannst.",
    seasonNav: "Saison",
  },
  ro: {
    season: "SEZON",
    more: "Mai multe idei:",
    gifts: "Toate cadourile",
    giftsTitle: "Cadouri cu motivul tău",
    giftsIntro:
      "Fiecare piesă este realizată după comanda ta, cu motivul tău. Aici găsești tot ce poți crea și comanda imediat.",
    seasonNav: "Sezon",
  },
  en: {
    season: "SEASON",
    more: "More ideas:",
    gifts: "All gifts",
    giftsTitle: "Gifts with your design",
    giftsIntro:
      "Every piece is made after you order, with your design. Here is everything you can design and order right away.",
    seasonNav: "Season",
  },
} as const;

const h1Style = {
  fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
  fontWeight: 900,
} as const;
const introStyle = {
  color: "#ccc",
  maxWidth: "640px",
  lineHeight: 1.7,
  marginBottom: "2rem",
} as const;

/** Kopf einer Saisonseite in der gewählten Sprache. */
export function CampaignIntro({
  icon,
  copies,
  active,
}: {
  icon: string;
  copies: CopyByLocale;
  active: boolean;
}) {
  const { locale } = useLocale();
  const copy = copies[locale];
  return (
    <>
      <p
        style={{
          color: "#D4AF37",
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontSize: "0.8rem",
        }}
      >
        {UI[locale].season} · {copy.name.toUpperCase()}
      </p>
      <h1 style={{ ...h1Style, margin: "0.5rem 0 1rem" }}>
        {icon} {copy.headline}
      </h1>
      <p style={introStyle}>{active ? copy.intro : copy.announcement}</p>
    </>
  );
}

export function CampaignFooter() {
  const { locale } = useLocale();
  return (
    <p style={{ marginTop: "2.5rem", color: "#aaa" }}>
      {UI[locale].more}{" "}
      <Link href="/geschenke" style={{ color: "#D4AF37" }}>
        {UI[locale].gifts}
      </Link>
    </p>
  );
}

export function GiftsIntro() {
  const { locale } = useLocale();
  return (
    <>
      <h1 style={{ ...h1Style, marginBottom: "1rem" }}>
        🎁 {UI[locale].giftsTitle}
      </h1>
      <p style={introStyle}>{UI[locale].giftsIntro}</p>
    </>
  );
}

export function SeasonNav({ seasons }: { seasons: SeasonLink[] }) {
  const { locale } = useLocale();
  return (
    <nav
      aria-label={UI[locale].seasonNav}
      style={{
        marginTop: "2.5rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      {seasons.map((c) => (
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
          {c.icon} {c.copy[locale].name}
        </Link>
      ))}
    </nav>
  );
}
