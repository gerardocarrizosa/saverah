-- ============================================================================
-- Migration: Add cutoff_day column for credit card reminders
-- Date: 2026-03-07
-- ============================================================================

-- Add cutoff_day column to reminders table
-- Only applicable for credit card reminders (Tarjeta de Crédito)
ALTER TABLE reminders ADD COLUMN cutoff_day INTEGER CHECK (cutoff_day BETWEEN 1 AND 31);

-- Create index for better query performance on cutoff_day
CREATE INDEX idx_reminders_cutoff_day ON reminders(cutoff_day);

-- Update table comment to reflect the new structure
COMMENT ON TABLE reminders IS 'Stores user reminders for bills, credit cards, subscriptions. Payment amounts are tracked separately in reminder_payments table. Credit cards can have a cutoff_day for billing cycle closure.';

COMMENT ON COLUMN reminders.cutoff_day IS 'Day of month when the billing period closes (1-31). Only applicable for credit card reminders.';
