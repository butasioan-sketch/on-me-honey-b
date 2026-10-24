-- Schema der laufenden App. Entspricht dem früheren initDb().
-- CREATE und ALTER sind idempotent. Auf der bestehenden Neon-DB ergänzt das nur fehlende Spalten.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  customer_email TEXT,
  amount_total NUMERIC,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'paid',
  items JSONB DEFAULT '[]',
  locale TEXT DEFAULT 'de',
  shipping_country TEXT DEFAULT 'DE',
  design_id TEXT,
  shipping_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS design_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_job JSONB;

CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  front_image TEXT,
  back_image TEXT,
  product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE designs ADD COLUMN IF NOT EXISTS front_transform JSONB;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS back_transform JSONB;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS meta JSONB;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMPTZ;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS front_preview TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS back_preview TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS zones_data TEXT;

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  page TEXT,
  product_id TEXT,
  locale TEXT,
  value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  order_id TEXT,
  locale TEXT DEFAULT 'de',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status, created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  locale TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers (lower(email));
