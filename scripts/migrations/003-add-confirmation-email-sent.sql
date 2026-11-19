-- Merkt, ob die Bestätigungs-E-Mail angenommen wurde, damit ein Stripe-Retry sie nachholen kann.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;
