# Migrationen

`000-schema.sql` ist das Schema, das die App schon schreibt: orders, designs, analytics_events, reviews, newsletter_subscribers.
`001-add-indexes.sql` legt nur Indizes auf diesen Tabellen an.

Nicht ausführen, bevor die Dateien gelesen wurden. Auf der bestehenden Datenbank sind die CREATE-Befehle folgenlos, die ALTER-Befehle ergänzen nur fehlende Spalten.
