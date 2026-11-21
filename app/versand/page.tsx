import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import { SHIPPING_OPTIONS } from '@/lib/shipping';
import { PRODUCTION_DAYS, MAX_DELIVERY_DAYS_DE, contactEmail } from '@/lib/delivery';
import { MAX_SHOP_QUANTITY } from '@/lib/order-limits';

export const metadata: Metadata = {
  title: 'Versand & Reklamation | ON ME HONEY B',
  description: 'Versandoptionen für Deutschland, Produktionszeiten (Handfertigung) und Reklamation mit kostenloser Rücksendung bei Produkt- und Druckfehlern.',
};

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const shippingDE = SHIPPING_OPTIONS.map(({ carrier, price, eta }) => ({
  label: carrier,
  detail: `${euro.format(price.DE)} · ${eta.DE} nach Produktion`,
}));

function ShippingCard({ title, rows }: { title: string; rows: { label: string; detail: string }[] }) {
  return (
    <div className="plt-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ fontWeight: 600, color: '#ccc' }}>{row.label}</span>
            <span style={{ color: '#888' }}>{row.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VersandPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1000px 500px at 50% -10%, rgba(226,0,26,0.07), transparent 60%), linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader />

      <main id="main-content" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <p style={{ color: '#D4AF37', fontSize: '0.72rem', letterSpacing: '0.22em', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>ON ME HONEY B</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Versand & Reklamation</h1>
        <p style={{ color: '#b5b5b5', fontSize: '0.95rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          Wir sind ein kleines Start-up und fertigen jedes Stück selbst per Hand – erst nach deiner Bestellung.
        </p>
        <ul style={{ color: '#c8c8c8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 2rem', paddingLeft: '1.2rem' }}>
          <li><strong style={{ color: '#fff' }}>Produktion:</strong> {PRODUCTION_DAYS.min}–{PRODUCTION_DAYS.max} Werktage ab Zahlungseingang</li>
          <li><strong style={{ color: '#fff' }}>Versand:</strong> je nach Versanddienst (siehe unten)</li>
          <li><strong style={{ color: '#fff' }}>Gesamt:</strong> Lieferung spätestens {MAX_DELIVERY_DAYS_DE} Werktage nach Zahlungseingang</li>
          <li><strong style={{ color: '#fff' }}>Mehr als {MAX_SHOP_QUANTITY} Stück?</strong> Bitte über das <Link href="/grossbestellung" style={{ color: '#D4AF37' }}>Anfrageformular</Link> – du bekommst ein Angebot mit festem Termin.</li>
        </ul>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <ShippingCard title="Deutschland" rows={shippingDE} />
        </div>

        <div className="plt-card" style={{ padding: '1.75rem', border: '1px solid rgba(226,0,26,0.2)', background: 'rgba(226,0,26,0.04)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>Reklamation & Qualitätsversprechen</h2>
          <p style={{ color: '#b5b5b5', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            Da jedes Stück individuell mit deinem Motiv gefertigt wird, besteht kein Widerrufsrecht
            (§ 312g Abs. 2 Nr. 1 BGB). Rücksendungen ohne Mangel sind daher nicht möglich.
          </p>
          <p style={{ color: '#b5b5b5', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Bei <strong style={{ color: '#fff' }}>Produkt- oder Druckfehlern, Transportschäden oder Falschlieferungen</strong> gilt
            die gesetzliche Gewährleistung (2 Jahre): Wir fertigen neu oder bessern nach – und tragen alle Kosten,
            auch die Rücksendung.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#b5b5b5' }}>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>So reklamierst du:</p>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: 1.6 }}>
              <li>Fotos vom Fehler, vom Etikett und von der Verpackung machen.</li>
              <li>
                E-Mail mit Bestellnummer an{' '}
                {contactEmail() ? (
                  <a href={`mailto:${contactEmail()}`} style={{ color: '#D4AF37' }}>{contactEmail()}</a>
                ) : (
                  <Link href="/impressum" style={{ color: '#D4AF37' }}>die Adresse im Impressum</Link>
                )}{' '}
                – am besten innerhalb von 14 Tagen nach Erhalt (deine gesetzlichen Rechte bleiben auch danach bestehen).
              </li>
              <li>Wir melden uns innerhalb von 48 Stunden. Muss die Ware zurück, bekommst du ein <strong style={{ color: '#fff' }}>kostenloses Rücksendeetikett</strong>; Porto, das du ausgelegt hast, erstatten wir gegen Beleg.</li>
              <li>Neuanfertigung oder Erstattung innerhalb von 14 Tagen nach Eingang bzw. Prüfung der Fotos. Bei offensichtlichen Fehlern verzichten wir meist auf die Rücksendung.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
          <Link href="/faq" style={{ color: '#888', fontSize: '0.82rem', textDecoration: 'none', borderBottom: '1px solid #333' }}>
            Weitere Fragen → FAQ
          </Link>
          <Link href="/product/1" style={{ color: '#888', fontSize: '0.82rem', textDecoration: 'none', borderBottom: '1px solid #333' }}>
            ← Zurück zum Atelier
          </Link>
        </div>
      </main>
    </div>
  );
}
