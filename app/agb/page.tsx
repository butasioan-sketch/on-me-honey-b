import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/app/components/SiteHeader';
import { SHIPPING_OPTIONS } from '@/lib/shipping';
import { PRODUCTION_DAYS, MAX_DELIVERY_DAYS_DE, contactEmail } from '@/lib/delivery';
import { MAX_SHOP_QUANTITY } from '@/lib/order-limits';

export const metadata: Metadata = {
  title: 'AGB | ON ME HONEY B',
  description: 'Allgemeine Geschäftsbedingungen von ON ME HONEY B – personalisierte Einzelanfertigungen, in Handarbeit gefertigt.',
};

const S = {
  h2: { fontSize: '1.05rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.4rem', color: '#fff' } as const,
  p: { color: '#b5b5b5', lineHeight: 1.75, fontSize: '0.9rem', marginTop: '0.5rem' } as const,
};

export default function AGBPage() {
  const mail = contactEmail();
  const contact = mail ? <a href={`mailto:${mail}`} style={{ color: '#D4AF37' }}>{mail}</a> : <Link href="/impressum" style={{ color: '#D4AF37' }}>die im Impressum genannte E-Mail-Adresse</Link>;
  const carriers = SHIPPING_OPTIONS.map((o) => `${o.carrier} ${o.eta.DE}`).join(', ');
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1000px 500px at 50% -10%, rgba(226,0,26,0.07), transparent 60%), linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader />
      <main id="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
        <p style={{ color: '#D4AF37', fontSize: '0.72rem', letterSpacing: '0.22em', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>ON ME HONEY B</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Allgemeine Geschäftsbedingungen</h1>
        <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '2rem' }}>Stand: 21. November 2026</p>

        <h2 style={S.h2}>§ 1 Geltungsbereich</h2>
        <p style={S.p}>Diese AGB gelten für alle Bestellungen von Verbrauchern und Unternehmern über den Online-Shop ON ME HONEY B. Anbieter ist der im <Link href="/impressum" style={{ color: '#D4AF37' }}>Impressum</Link> genannte Betreiber. Für Großbestellungen nach § 9 gelten diese AGB, soweit das individuelle Angebot nichts anderes regelt. Abweichende Bedingungen von Unternehmern gelten nicht.</p>

        <h2 style={S.h2}>§ 2 Wer wir sind</h2>
        <p style={S.p}>ON ME HONEY B ist ein kleines Start-up. Wir fertigen jedes Stück selbst in Handarbeit: Druckvorbereitung, Sublimationsdruck, Pressen und Endkontrolle erfolgen bei uns. Eine Lager- oder Massenproduktion findet nicht statt.</p>

        <h2 style={S.h2}>§ 3 Vertragsschluss</h2>
        <p style={S.p}>Die Darstellung der Produkte im Shop ist kein bindendes Angebot. Sie gestalten Ihr Motiv auf dem 3D-Modell, wählen die Größe und legen den Artikel in den Warenkorb. Über „Zur Kasse“ gelangen Sie zur Bezahlseite unseres Zahlungsdienstleisters Stripe. Dort können Sie alle Angaben prüfen und Eingabefehler korrigieren oder den Vorgang abbrechen. Mit dem Klick auf die Bezahl-Schaltfläche geben Sie ein verbindliches Angebot ab. Wir nehmen es an, indem wir die Zahlung annehmen. Danach erhalten Sie unverzüglich eine Bestellbestätigung per E-Mail. Vertragssprache ist Deutsch. Wir speichern den Vertragstext; diese AGB können Sie jederzeit auf dieser Seite abrufen und speichern.</p>

        <h2 style={S.h2}>§ 4 Preise und Zahlung</h2>
        <p style={S.p}>Alle Preise sind Endpreise in Euro. Als Kleinunternehmer gemäß § 19 UStG berechnen wir keine Umsatzsteuer und weisen sie nicht aus. Versandkosten werden vor der Bestellung im Warenkorb angezeigt. Bezahlt wird über Stripe mit den dort angebotenen Zahlungsarten (z. B. Karte, SEPA-Lastschrift).</p>

        <h2 style={S.h2}>§ 5 Produktion und Lieferung</h2>
        <p style={S.p}>Jedes Stück wird erst nach Ihrer Bestellung in Handarbeit gefertigt. Die Produktion dauert {PRODUCTION_DAYS.min}–{PRODUCTION_DAYS.max} Werktage (Montag bis Freitag, ohne gesetzliche Feiertage) ab Zahlungseingang. Danach versenden wir innerhalb Deutschlands mit dem gewählten Versanddienst ({carriers}). Die Lieferung erfolgt spätestens {MAX_DELIVERY_DAYS_DE} Werktage nach Zahlungseingang. Bei Zahlungsarten mit späterer Belastung (z. B. SEPA-Lastschrift) beginnt die Frist am Tag nach dem Vertragsschluss.</p>

        <h2 style={S.h2}>§ 6 Kein Widerrufsrecht bei personalisierter Ware</h2>
        <p style={S.p}>Alle Artikel werden nach Ihrem Motiv einzeln angefertigt („Print on Demand“). Ein Widerrufsrecht besteht daher nicht (§ 312g Abs. 2 Nr. 1 BGB). Ihre gesetzlichen Gewährleistungsrechte nach § 7 bleiben davon unberührt – bei Produkt- und Druckfehlern sind Sie also voll abgesichert.</p>

        <h2 style={S.h2}>§ 7 Gewährleistung, Produkt- und Druckfehler</h2>
        <p style={S.p}>Es gilt das gesetzliche Mängelhaftungsrecht; die Frist beträgt zwei Jahre ab Lieferung. Ein Mangel liegt insbesondere vor bei einem von uns verursachten Druckfehler (z. B. verschoben, unvollständig, verfärbt), bei Material- oder Nähfehlern, bei Transportschäden oder bei einer Falschlieferung.</p>
        <p style={S.p}>Bitte melden Sie Mängel möglichst innerhalb von 14 Tagen nach Erhalt an {contact} – mit Bestellnummer und Fotos vom Mangel, Etikett und Verpackung. Das hilft uns, schnell zu helfen; Ihre gesetzlichen Rechte hängen davon nicht ab, auch eine spätere Meldung innerhalb der Gewährleistungsfrist ist möglich.</p>
        <p style={S.p}>Sie können wählen zwischen Nachbesserung und Neuanfertigung. Scheitert beides, können Sie vom Vertrag zurücktreten oder den Preis mindern. Leichte, beim Sublimationsdruck übliche Farbabweichungen zwischen Bildschirm und Druck sowie die Qualität eines von Ihnen hochgeladenen Motivs mit zu geringer Auflösung, auf die wir Sie beim Gestalten hingewiesen haben, sind kein Mangel.</p>

        <h2 style={S.h2}>§ 8 Rücksendekosten bei Reklamation</h2>
        <p style={S.p}>Bei einer berechtigten Reklamation tragen wir alle Kosten. Sie erhalten von uns ein kostenloses Rücksendeetikett per E-Mail. Ist das nicht möglich, erstatten wir Ihnen das Porto für die günstigste übliche Versandart gegen Beleg. Bei offensichtlichen Mängeln (anhand Ihrer Fotos) verzichten wir in der Regel auf die Rücksendung. Neuanfertigung oder Erstattung erfolgen innerhalb von 14 Tagen nach Eingang der Ware bzw. nach Prüfung der Fotos; Erstattungen über das ursprüngliche Zahlungsmittel. Rücksendungen ohne Mangel (z. B. weil das Motiv nicht mehr gefällt) sind wegen § 6 nicht möglich.</p>

        <h2 style={S.h2}>§ 9 Großbestellungen über {MAX_SHOP_QUANTITY} Stück</h2>
        <p style={S.p}>Über den Shop sind bis zu {MAX_SHOP_QUANTITY} Stück je Bestellung möglich. Für größere Mengen nutzen Sie bitte unser <Link href="/grossbestellung" style={{ color: '#D4AF37' }}>Anfrageformular</Link>. Wir erstellen ein individuelles Angebot mit Preis, Produktionszeit und Liefertermin. Ein Vertrag entsteht erst, wenn Sie unser Angebot in Textform annehmen.</p>

        <h2 style={S.h2}>§ 10 Rechte am Motiv</h2>
        <p style={S.p}>Sie versichern, dass Sie über die erforderlichen Rechte am hochgeladenen Motiv verfügen und durch den Druck keine Rechte Dritter verletzt werden. Wir dürfen Motive ablehnen, die rechtswidrig sind oder erkennbar Rechte Dritter verletzen; bereits gezahlte Beträge erstatten wir dann vollständig.</p>

        <h2 style={S.h2}>§ 11 Eigentumsvorbehalt</h2>
        <p style={S.p}>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>

        <h2 style={S.h2}>§ 12 Schlussbestimmungen</h2>
        <p style={S.p}>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gesetzliche Verbraucherschutzvorschriften des Staates, in dem Sie Ihren gewöhnlichen Aufenthalt haben, bleiben unberührt. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </main>
    </div>
  );
}
