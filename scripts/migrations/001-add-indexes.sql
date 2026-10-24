-- ===================================================================
-- ON ME HONEY B - Database Performance Indexes (INFRA P1 4.5)
-- ===================================================================
-- Run this ONCE in production: psql $DATABASE_URL < scripts/migrations/001-add-indexes.sql
-- Or via Neon console SQL editor
-- ===================================================================

-- Orders: Most common queries are by created_at DESC (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Orders: Webhook looks up by stripe_session_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- Orders: Status filtering (on_hold, paid, shipped)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Designs: Product-specific queries
CREATE INDEX IF NOT EXISTS idx_designs_product_id ON designs(product_id);

-- Designs: Created_at for sorting
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at DESC);

-- Analytics: Date-range queries
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Analytics: Event-type filtering
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);

-- Reviews: Already has idx_reviews_status from initDb
-- Newsletter: Already has unique constraint on email from initDb

-- ===================================================================
-- Verification queries (run after migration to check index usage)
-- ===================================================================

-- EXPLAIN ANALYZE SELECT * FROM orders ORDER BY created_at DESC LIMIT 50;
-- EXPLAIN ANALYZE SELECT * FROM orders WHERE stripe_session_id = 'cs_test_xxx';
-- EXPLAIN ANALYZE SELECT * FROM designs WHERE product_id = '1';
-- EXPLAIN ANALYZE SELECT * FROM analytics WHERE created_at > NOW() - INTERVAL '7 days';

