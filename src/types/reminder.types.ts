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
  email_notifications_enabled: boolean;
  email_notification_timings: ReminderNotificationTiming[];
};

export type ReminderNotificationTiming = 0 | 1 | 3 | 7;

export type ReminderNotificationStatus = 'sent' | 'failed' | 'skipped';

export type ReminderNotificationChannel = 'email';

export type ReminderNotification = {
  id: string;
  user_id: string;
  reminder_id: string;
  channel: ReminderNotificationChannel;
  notification_date: string;
  due_date: string;
  timing_days_before: ReminderNotificationTiming;
  status: ReminderNotificationStatus;
  recipient_email: string | null;
  provider: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
};

export type NotificationOutcome = {
  reminder_id: string;
  timing_days_before: ReminderNotificationTiming;
  status: ReminderNotificationStatus;
  notification_id?: string;
  provider_message_id?: string;
  error_message?: string;
};

export type NotificationRunResult = {
  notification_date: string;
  evaluated_count: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  sent: NotificationOutcome[];
  failed: NotificationOutcome[];
  skipped: NotificationOutcome[];
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
