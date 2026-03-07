export type Income = {
  id: string;
  user_id: string;
  source: string;
  type: 'steady' | 'variable' | 'other';
  amount: number;
  received_at: string;
  notes?: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  spent_at: string;
  notes?: string;
  created_at: string;
};

export type BudgetLimit = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
};

export type CategorySummary = {
  category: string;
  spent: number;
  limit: number | null;
  percentage: number | null;
  status: 'ok' | 'warning' | 'exceeded';
};

export type BudgetSummary = {
  total_income: number;
  total_expenses: number;
  balance: number;
  categories: CategorySummary[];
};
