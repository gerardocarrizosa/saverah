-- Migration: Dashboard Enhancement Tables
-- Created: March 2026
-- Description: Tables for savings goals, achievements, dashboard settings, streak history, and estimated amounts

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 1. USER DASHBOARD SETTINGS
-- Stores collapse/expand state of dashboard sections and general preferences
-- ============================================
CREATE TABLE user_dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Section visibility states (true = expanded, false = collapsed)
  quick_stats_expanded boolean DEFAULT true,
  urgent_alerts_expanded boolean DEFAULT true,
  budget_alerts_expanded boolean DEFAULT true,
  monthly_overview_expanded boolean DEFAULT true,
  recent_activity_expanded boolean DEFAULT true,
  savings_goals_expanded boolean DEFAULT true,
  budget_streak_expanded boolean DEFAULT true,
  achievements_expanded boolean DEFAULT true,
  credit_cards_expanded boolean DEFAULT true,
  
  -- General settings
  stats_visibility boolean DEFAULT true, -- For the toggle to hide/show financial numbers
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_dashboard_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own dashboard settings"
  ON user_dashboard_settings 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings"
  ON user_dashboard_settings 
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard settings"
  ON user_dashboard_settings 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_dashboard_settings_updated_at
  BEFORE UPDATE ON user_dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. SAVINGS GOALS
-- Monthly savings goals configured by users
-- ============================================
CREATE TABLE savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Goal type: fixed amount or percentage of income
  goal_type text NOT NULL CHECK (goal_type IN ('fixed', 'percentage')),
  
  -- Target values
  target_amount numeric(12, 2),
  target_percentage numeric(5, 2),
  
  -- Period (monthly)
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  
  -- Status
  is_active boolean DEFAULT true,
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, month, year)
);

-- Index for efficient querying
CREATE INDEX idx_savings_goals_user_month_year 
  ON savings_goals(user_id, year DESC, month DESC);

-- Enable RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own savings goals"
  ON savings_goals 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals"
  ON savings_goals 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
  ON savings_goals 
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
  ON savings_goals 
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. ACHIEVEMENTS (Master Data)
-- Predefined achievements in the system
-- ============================================
CREATE TABLE achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL CHECK (condition_type IN (
    'first_expense',
    'savings_rate',
    'streak_days',
    'unique_categories',
    'total_payments',
    'budget_adherence'
  )),
  condition_value numeric(10, 2),
  points integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed initial achievements
INSERT INTO achievements (id, title, description, icon, condition_type, condition_value, points) VALUES
  ('first_expense', 'Primer Paso', 'Registra tu primer gasto', '🌱', 'first_expense', 1, 5),
  ('savings_master', 'Maestro del Ahorro', 'Ahorra 20% de tus ingresos en un mes', '🥇', 'savings_rate', 20, 25),
  ('savings_champion', 'Campeón del Ahorro', 'Ahorra 30% de tus ingresos en un mes', '🏆', 'savings_rate', 30, 50),
  ('streak_7', 'Semana Perfecta', '7 días sin exceder presupuesto', '🔥', 'streak_days', 7, 15),
  ('streak_14', 'Dos Semanas', '14 días sin exceder presupuesto', '🔥🔥', 'streak_days', 14, 30),
  ('streak_30', 'Maestro del Control', '30 días sin exceder presupuesto', '👑', 'streak_days', 30, 100),
  ('organized', 'Organizado', 'Usa 5 categorías diferentes', '📊', 'unique_categories', 5, 10),
  ('super_organized', 'Super Organizado', 'Usa 10 categorías diferentes', '📊📊', 'unique_categories', 10, 25),
  ('regular_payer', 'Pagador Regular', 'Realiza 10 pagos de recordatorios', '💳', 'total_payments', 10, 15),
  ('consistent_saver', 'Ahorrador Consistente', '3 meses consecutivos con ahorro positivo', '💰', 'budget_adherence', 3, 50);

-- No RLS needed for master data (readable by all)

-- ============================================
-- 4. USER ACHIEVEMENTS
-- Junction table: which achievements each user has unlocked
-- ============================================
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  
  -- Unlock timestamp
  unlocked_at timestamptz DEFAULT now(),
  
  -- Additional data (flexible JSONB)
  metadata jsonb DEFAULT '{}',
  
  -- Seen by user (for "New" badge)
  is_viewed boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id 
  ON user_achievements(user_id, unlocked_at DESC);

CREATE INDEX idx_user_achievements_unviewed 
  ON user_achievements(user_id, is_viewed) 
  WHERE is_viewed = false;

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements for users"
  ON user_achievements 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can mark achievements as viewed"
  ON user_achievements 
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. BUDGET STREAK HISTORY
-- Daily tracking of budget adherence for streak calculation
-- ============================================
CREATE TABLE budget_streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Record date
  record_date date NOT NULL,
  
  -- Did all categories stay within limits this day?
  all_categories_within_limit boolean NOT NULL,
  
  -- Which categories exceeded (if any)
  exceeded_categories text[] DEFAULT '{}',
  
  -- Total spent that day (for reference)
  daily_total numeric(12, 2),
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, record_date)
);

-- Index for efficient streak calculation
CREATE INDEX idx_streak_history_user_date 
  ON budget_streak_history(user_id, record_date DESC);

CREATE INDEX idx_streak_history_within_limit 
  ON budget_streak_history(user_id, all_categories_within_limit, record_date DESC);

-- Enable RLS
ALTER TABLE budget_streak_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own streak history"
  ON budget_streak_history 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert streak records for users"
  ON budget_streak_history 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. ESTIMATED REMINDER AMOUNTS
-- Estimated payment amounts for reminders (for "Total Due" calculation)
-- ============================================
CREATE TABLE estimated_reminder_amounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_id uuid REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
  
  -- Estimated amount based on average or last payment
  estimated_amount numeric(12, 2) NOT NULL,
  
  -- Type of estimation
  calculation_method text NOT NULL CHECK (calculation_method IN ('average', 'last_payment', 'manual')),
  
  -- When it was calculated
  calculated_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, reminder_id)
);

-- Enable RLS
ALTER TABLE estimated_reminder_amounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own estimated amounts"
  ON estimated_reminder_amounts 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create estimated amounts"
  ON estimated_reminder_amounts 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimated amounts"
  ON estimated_reminder_amounts 
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimated amounts"
  ON estimated_reminder_amounts 
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_estimated_amounts_updated_at
  BEFORE UPDATE ON estimated_reminder_amounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SETUP
-- Create default settings for existing users
-- ============================================

-- Insert default dashboard settings for all existing users
INSERT INTO user_dashboard_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE user_dashboard_settings IS 'Stores user preferences for dashboard section visibility and general settings';
COMMENT ON TABLE savings_goals IS 'Monthly savings goals set by users (fixed amount or percentage)';
COMMENT ON TABLE achievements IS 'Master table of predefined achievements in the system';
COMMENT ON TABLE user_achievements IS 'Tracks which achievements each user has unlocked';
COMMENT ON TABLE budget_streak_history IS 'Daily budget adherence tracking for streak calculation';
COMMENT ON TABLE estimated_reminder_amounts IS 'Estimated payment amounts for reminders to calculate total monthly dues';
