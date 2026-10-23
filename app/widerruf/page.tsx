import SiteHeader from '@/app/components/SiteHeader';

export const metadata = {
  title: 'Widerrufsbelehrung - ON ME HONEY B',
  description: 'Widerrufsrecht für Verbraucher gemäß BGB',
};

export default function WiderrufPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <SiteHeader />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
          Widerrufsbelehrung
        </h1>

        <section style={{ marginBottom: '2rem', lineHeight: 1.8, color: '#ccc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Widerrufsrecht
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter,
            der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z. B. ein mit
            der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
            Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </section>

        <section style={{ marginBottom: '2rem', lineHeight: 1.8, color: '#ccc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Folgen des Widerrufs
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
            einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
            Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben),
            unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
            Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
            eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
            werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den
            Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem
            Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist
            ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
          </p>
        </section>

        <section style={{ marginBottom: '2rem', lineHeight: 1.8, color: '#ccc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Ausschluss des Widerrufsrechts
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nach Kundenspezifikation
            angefertigt werden oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB).
          </p>
          <p style={{ marginBottom: '1rem', padding: '1rem', background: '#1a1a1a', borderLeft: '3px solid #D4AF37', borderRadius: '4px' }}>
            <strong style={{ color: '#D4AF37' }}>Hinweis:</strong> Da alle Produkte von ON ME HONEY B individuell nach
            Ihren Design-Vorgaben angefertigt werden (maßgefertigte Ware), ist das Widerrufsrecht gemäß § 312g Abs. 2 Nr. 1 BGB
            ausgeschlossen.
          </p>
        </section>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #222', fontSize: '0.9rem', color: '#666' }}>
          <p>Weitere Informationen finden Sie in unseren <a href="/agb" style={{ color: '#D4AF37', textDecoration: 'none' }}>AGB §6</a>.</p>
        </div>
      </main>
    </div>
  );
}
