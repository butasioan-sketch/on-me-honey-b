# Migrationen

`000-schema.sql` ist das Schema, das die App schon schreibt: orders, designs, analytics_events, reviews, newsletter_subscribers.
`001-add-indexes.sql` legt nur Indizes auf diesen Tabellen an.
`002-add-shipping-address.sql` ergänzt die im Stripe-Checkout erfasste Lieferanschrift. Vor dem Anwendungscode ausrollen.
`003-add-confirmation-email-sent.sql` merkt den Versand der Bestätigungs-E-Mail (Nachholen bei Stripe-Retry). Vor dem Anwendungscode ausrollen.

Nicht ausführen, bevor die Dateien gelesen wurden. Auf der bestehenden Datenbank sind die CREATE-Befehle folgenlos, die ALTER-Befehle ergänzen nur fehlende Spalten.
