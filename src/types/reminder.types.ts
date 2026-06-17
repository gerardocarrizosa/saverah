export type Reminder = {
  id: string;
  user_id: string;
  name: string;
  due_day: number;
  cutoff_day?: number | null;
  recurrence: 'monthly' | 'yearly' | 'weekly';
  category: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
};

export type ReminderPayment = {
  id: string;
  reminder_id: string;
  user_id: string;
  paid_at: string;
  amount_paid: number;
  created_at: string;
};

export type ReminderAnalytics = {
  total_paid: number;
  payment_count: number;
  payment_history: ReminderPayment[];
  average_payment: number;
  last_paid_at: string | null;
  days_until_due: number;
  is_overdue: boolean;
  days_until_cutoff?: number | null;
  is_cutoff_soon?: boolean;
  is_paid_for_current_cycle: boolean;
};
