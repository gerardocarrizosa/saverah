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
  notes?: string | null;
  created_at: string;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  installment_total_amount: number | null;
  installment_start_date: string | null;
  installment_end_date: string | null;
};

export type SingleExpenseInput = {
  description: string;
  amount: number;
  category: string;
  spent_at: string | Date;
  notes?: string | null;
  is_installment?: false | null;
  installment_count?: 1 | null;
};

export type InstallmentExpenseInput = {
  description: string;
  amount: number;
  category: string;
  spent_at: string | Date;
  notes?: string | null;
  is_installment: true;
  installment_count: number;
};

export type CreateExpensePayload = SingleExpenseInput | InstallmentExpenseInput;

export type CreateExpenseResponse = Expense | Expense[];

export type DeleteExpenseScope = 'single' | 'series';

export type DeleteExpenseResult = {
  success: boolean;
  deleted_count: number;
  scope: DeleteExpenseScope;
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
