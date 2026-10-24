-- ===================================================================
-- ON ME HONEY B - Initial Database Schema
-- ===================================================================
-- This is a ONE-TIME migration that creates all tables and columns.
-- Run ONCE in production: psql $DATABASE_URL < scripts/migrations/000-schema.sql
--
-- After this migration, initDb() becomes lightweight (see INFRA P1 4.1)
-- ===================================================================

-- ORDERS TABLE
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
  print_job JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DESIGNS TABLE  
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  front_image TEXT,
  back_image TEXT,
  product_id TEXT,
  front_transform JSONB,
  back_transform JSONB,
  meta JSONB,
  frozen_at TIMESTAMPTZ,
  front_preview TEXT,
  back_preview TEXT,
  zones_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  page TEXT,
  product_id TEXT,
  locale TEXT,
  value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  order_id TEXT,
  locale TEXT DEFAULT 'de',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for reviews status filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- NEWSLETTER TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email TEXT PRIMARY KEY,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- Verification: Check all tables exist
-- ===================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
