import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "So bestellst du – Video-Anleitung | ON ME HONEY B",
  description:
    "Schritt für Schritt: Produkt wählen, eigenes Motiv auf das 3D-Modell laden, Größe wählen und sicher bezahlen – mit Karte, SEPA und weiteren Zahlungsarten über Stripe.",
  alternates: { canonical: "/so-gehts" },
};

const STEPS = [
  [
    "Produkt wählen",
    "Öffne ein Produkt. Du siehst es als 3D-Modell, das du mit Finger oder Maus drehen kannst.",
  ],
  [
    "Motiv hochladen",
    "Tippe auf „Bild hierher ziehen oder tippen“ und wähle dein Bild. Es erscheint sofort auf dem Modell – vorne oder hinten.",
  ],
  [
    "Anpassen",
    "Mit den Reglern änderst du Größe und Position. „360° drehen“ zeigt dir das Ergebnis von allen Seiten.",
  ],
  [
    "Größe wählen",
    "Wähle deine Größe und tippe auf „Jetzt bestellen“ oder lege das Teil in den Warenkorb.",
  ],
  [
    "Bezahlen",
    "Du landest auf der sicheren Bezahlseite von Stripe. E-Mail und Lieferadresse eingeben, Zahlungsart wählen (z. B. Karte, PayPal, Klarna, SEPA-Lastschrift oder Apple Pay – je nach Gerät), bezahlen – fertig. Die Bestätigung kommt per E-Mail. Wir fertigen dann in 3–5 Werktagen von Hand; spätestens 10 Werktage nach Zahlungseingang ist deine Bestellung bei dir.",
  ],
] as const;

function Video({
  src,
  title,
  captions,
}: {
  src: string;
  title: string;
  captions: string;
}) {
  return (
    <figure style={{ margin: 0 }}>
      <video
        controls
        playsInline
        preload="metadata"
        poster={`${src}.jpg`}
        width={1280}
        height={696}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "1280 / 696",
          borderRadius: "14px",
          background: "#000",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-label={title}
      >
        <source src={`${src}.mp4`} type="video/mp4" />
        <track
          kind="captions"
          src={captions}
          srcLang="de"
          label="Deutsch"
          default
        />
      </video>
      <figcaption
        style={{ color: "#a0a0a0", fontSize: "0.85rem", marginTop: "0.5rem" }}
      >
        {title}
      </figcaption>
    </figure>
  );
}

export default function SoGehtsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1000px 500px at 50% -10%, rgba(226,0,26,0.08), transparent 60%), linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <SiteHeader />
      <main
        id="main-content"
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "2.5rem 1rem 5rem",
        }}
      >
        <p
          className="plt-label"
          style={{ color: "#D4AF37", margin: "0 0 0.5rem" }}
        >
          Anleitung
        </p>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 900,
            margin: "0 0 0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          So bestellst du – in 5 Schritten
        </h1>
        <p style={{ color: "#b5b5b5", lineHeight: 1.6, margin: "0 0 2rem" }}>
          Zwei kurze Videos zeigen dir den ganzen Weg: vom Gestalten auf dem
          3D-Modell bis zur Bezahlung.
        </p>

        <section
          aria-labelledby="video-gestalten"
          style={{ marginBottom: "2.5rem" }}
        >
          <h2
            id="video-gestalten"
            style={{ fontSize: "1.3rem", margin: "0 0 0.75rem" }}
          >
            1. Gestalten und bestellen
          </h2>
          <Video
            src="/videos/bestellen"
            captions="/videos/bestellen.de.vtt"
            title="Video: Produkt öffnen, Motiv hochladen, anpassen, Größe wählen, bestellen"
          />
        </section>

        <section
          aria-labelledby="video-bezahlen"
          style={{ marginBottom: "2.5rem" }}
        >
          <h2
            id="video-bezahlen"
            style={{ fontSize: "1.3rem", margin: "0 0 0.75rem" }}
          >
            2. Sicher bezahlen
          </h2>
          <Video
            src="/videos/bezahlen"
            captions="/videos/bezahlen.de.vtt"
            title="Video: Warenkorb, Versand wählen, Bezahlseite von Stripe, Bestätigung"
          />
          <p style={{ color: "#a0a0a0", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Im Video wird mit einer Stripe-Testkarte bezahlt, es fließt kein
            echtes Geld. Welche Zahlungsarten dir angeboten werden, zeigt die
            Bezahlseite von Stripe.
          </p>
        </section>

        <section aria-labelledby="schritte">
          <h2 id="schritte" style={{ fontSize: "1.3rem", margin: "0 0 1rem" }}>
            Die Schritte zum Nachlesen
          </h2>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
            }}
          >
            {STEPS.map(([title, text]) => (
              <li key={title} style={{ lineHeight: 1.6 }}>
                <strong>{title}:</strong>{" "}
                <span style={{ color: "#c8c8c8" }}>{text}</span>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: "2rem" }}>
            <Link
              href="/product/1"
              className="plt-btn-primary"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Jetzt gestalten
            </Link>
          </p>
          <p style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>
            Weitere Fragen? <Link href="/faq">Häufige Fragen</Link> ·{" "}
            <Link href="/versand">Versand</Link> ·{" "}
            <Link href="/widerruf">Widerruf</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
