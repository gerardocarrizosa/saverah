// Dashboard Types

export interface DashboardSettings {
  id: string;
  user_id: string;
  quick_stats_expanded: boolean;
  urgent_alerts_expanded: boolean;
  budget_alerts_expanded: boolean;
  monthly_overview_expanded: boolean;
  recent_activity_expanded: boolean;
  savings_goals_expanded: boolean;
  budget_streak_expanded: boolean;
  achievements_expanded: boolean;
  credit_cards_expanded: boolean;
  stats_visibility: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateDashboardSettingsInput {
  quick_stats_expanded?: boolean;
  urgent_alerts_expanded?: boolean;
  budget_alerts_expanded?: boolean;
  monthly_overview_expanded?: boolean;
  recent_activity_expanded?: boolean;
  savings_goals_expanded?: boolean;
  budget_streak_expanded?: boolean;
  achievements_expanded?: boolean;
  credit_cards_expanded?: boolean;
  stats_visibility?: boolean;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  goal_type: 'fixed' | 'percentage';
  target_amount: number | null;
  target_percentage: number | null;
  month: number;
  year: number;
  is_active: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSavingsGoalInput {
  goal_type: 'fixed' | 'percentage';
  target_amount?: number;
  target_percentage?: number;
  month: number;
  year: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition_type: 'first_expense' | 'savings_rate' | 'streak_days' | 'unique_categories' | 'total_payments' | 'budget_adherence';
  condition_value: number | null;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  metadata: Record<string, unknown>;
  is_viewed: boolean;
  created_at: string;
  achievement?: Achievement;
}

export interface BudgetStreakRecord {
  id: string;
  user_id: string;
  record_date: string;
  all_categories_within_limit: boolean;
  exceeded_categories: string[];
  daily_total: number | null;
  created_at: string;
}

export interface EstimatedReminderAmount {
  id: string;
  user_id: string;
  reminder_id: string;
  estimated_amount: number;
  calculation_method: 'average' | 'last_payment' | 'manual';
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityItem {
  id: string;
  type: 'income' | 'expense' | 'payment';
  description: string;
  amount: number;
  date: string;
  category?: string;
}

export interface CreditCardDisplay {
  id: string;
  name: string;
  cutoffDay: number;
  dueDay: number;
  daysUntilCutoff: number;
  daysUntilDue: number;
  isCutoffSoon: boolean;
  isDueSoon: boolean;
  estimatedPayment: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}
