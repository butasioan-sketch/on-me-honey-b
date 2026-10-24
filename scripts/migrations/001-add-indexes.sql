-- Zusätzliche Indizes. Tabellen heißen orders, designs, analytics_events.
-- stripe_session_id ist schon UNIQUE. analytics.event gibt es nicht.

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_designs_product_id ON designs (product_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events (type);
