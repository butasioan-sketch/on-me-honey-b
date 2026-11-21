-- Anfragen für Großbestellungen (mehr als 20 Stück), individuelles Angebot statt Checkout.
CREATE TABLE IF NOT EXISTS bulk_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  products TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 20 AND quantity <= 100000),
  wanted_by DATE,
  message TEXT,
  locale TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL DEFAULT 'neu',
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_created ON bulk_inquiries (created_at DESC);
