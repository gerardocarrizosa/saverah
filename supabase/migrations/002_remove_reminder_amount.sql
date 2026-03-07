-- ============================================================================
-- Migration: Remove amount column from reminders table
-- Date: 2026-03-01
-- ============================================================================

-- Drop the amount column from reminders table
ALTER TABLE reminders DROP COLUMN amount;

-- Update table comment to reflect the new structure
COMMENT ON TABLE reminders IS 'Stores user reminders for bills, credit cards, subscriptions. Payment amounts are tracked separately in reminder_payments table.';
