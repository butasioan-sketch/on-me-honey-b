import Link from 'next/link';
import SiteHeader from '@/app/components/SiteHeader';

export const metadata = {
  title: 'Widerrufsrecht | ON ME HONEY B',
  description: 'Kein Widerrufsrecht bei personalisierter Ware (§ 312g Abs. 2 Nr. 1 BGB) – Gewährleistung bei Produkt- und Druckfehlern bleibt vollständig erhalten.',
};

const box = { marginBottom: '1.5rem', padding: '1.1rem 1.25rem', background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', lineHeight: 1.75, color: '#c8c8c8' } as const;

export default function WiderrufPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader />
      <main id="main-content" style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.25rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Widerrufsrecht</h1>

        <section style={{ ...box, borderLeft: '3px solid #D4AF37' }}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem', color: '#fff' }}>Kein Widerrufsrecht</h2>
          <p style={{ margin: 0 }}>
            Alle Produkte von ON ME HONEY B werden nach Ihrer Bestellung mit Ihrem eigenen Motiv einzeln in Handarbeit gefertigt.
            Bei solchen Waren besteht kein Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB). Darauf weisen wir vor der Bestellung im
            Warenkorb und auf der Bezahlseite hin.
          </p>
        </section>

        <section style={box}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem', color: '#fff' }}>Was trotzdem gilt: Produkt- und Druckfehler</h2>
          <p style={{ margin: 0 }}>
            Ihre gesetzliche Gewährleistung von zwei Jahren bleibt vollständig erhalten. Bei Druck-, Material- oder Produktfehlern,
            Transportschäden oder einer falschen Lieferung fertigen wir neu oder bessern nach – nach Ihrer Wahl. Alle Kosten tragen
            wir, auch die Rücksendung (kostenloses Rücksendeetikett). Den Ablauf finden Sie unter{' '}
            <Link href="/versand" style={{ color: '#D4AF37' }}>Versand &amp; Reklamation</Link> sowie in den{' '}
            <Link href="/agb" style={{ color: '#D4AF37' }}>AGB §§ 7–8</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
