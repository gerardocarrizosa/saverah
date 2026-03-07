-- Saverah Database Schema
-- Run these commands in the Supabase SQL Editor
-- Order: 1. Enable UUID extension, 2. Create tables, 3. Enable RLS, 4. Create policies

-- ============================================================================
-- STEP 1: Enable UUID Extension (if not already enabled)
-- ============================================================================
extension "pgcrypto" schema public;

-- ============================================================================
-- STEP 2: Create Tables
-- ============================================================================

-- Bills, credit cards, subscriptions
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  recurrence TEXT NOT NULL CHECK (recurrence IN ('monthly', 'yearly', 'weekly')),
  category TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history for reminder analytics
CREATE TABLE IF NOT EXISTS reminder_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_at TIMESTAMPTZ NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income sources (steady salary, freelance, etc.)
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('steady', 'variable', 'other')),
  amount NUMERIC(12, 2) NOT NULL,
  received_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense entries
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  spent_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-category monthly spending limits
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS) on all tables
-- ============================================================================

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies (Users can only access their own data)
-- ============================================================================

-- Reminders policies
CREATE POLICY "Users own their reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- Reminder payments policies
CREATE POLICY "Users own their reminder payments" ON reminder_payments
  FOR ALL USING (auth.uid() = user_id);

-- Income policies
CREATE POLICY "Users own their income" ON income
  FOR ALL USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users own their expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Budget limits policies
CREATE POLICY "Users own their budget limits" ON budget_limits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Create Indexes for better performance
-- ============================================================================

-- Reminders indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_day ON reminders(due_day);
CREATE INDEX idx_reminders_category ON reminders(category);

-- Reminder payments indexes
CREATE INDEX idx_reminder_payments_reminder_id ON reminder_payments(reminder_id);
CREATE INDEX idx_reminder_payments_user_id ON reminder_payments(user_id);
CREATE INDEX idx_reminder_payments_paid_at ON reminder_payments(paid_at DESC);

-- Income indexes
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_received_at ON income(received_at DESC);
CREATE INDEX idx_income_type ON income(type);

-- Expenses indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_spent_at ON expenses(spent_at DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Budget limits indexes
CREATE INDEX idx_budget_limits_user_id ON budget_limits(user_id);
CREATE INDEX idx_budget_limits_category ON budget_limits(category);

-- ============================================================================
-- STEP 6: Add Comments for documentation
-- ============================================================================

COMMENT ON TABLE reminders IS 'Stores user reminders for bills, credit cards, subscriptions';
COMMENT ON TABLE reminder_payments IS 'Tracks payment history for reminders';
COMMENT ON TABLE income IS 'Stores user income sources and amounts';
COMMENT ON TABLE expenses IS 'Stores user expenses by category';
COMMENT ON TABLE budget_limits IS 'Stores monthly spending limits per category';
