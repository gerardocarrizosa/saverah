import { createSupabaseServerClient } from '../supabase/server';
import type { Reminder, ReminderPayment } from '@/types/reminder.types';
import { checkIfPaidForCurrentCycle } from '../utils/reminders';

export type ReminderWithStatus = Reminder & {
  daysUntilDue: number;
  isOverdue: boolean;
  isPaidForCurrentCycle: boolean;
  lastPaidAt: string | null;
};

export async function getRemindersWithPaymentStatus(userId: string): Promise<ReminderWithStatus[]> {
  const supabase = await createSupabaseServerClient();
  
  // Fetch all reminders for the user
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_day', { ascending: true });

  if (remindersError) throw remindersError;
  if (!reminders) return [];

  // Fetch recent payments for all reminders
  const reminderIds = reminders.map(r => r.id);
  const { data: payments, error: paymentsError } = await supabase
    .from('reminder_payments')
    .select('*')
    .eq('user_id', userId)
    .in('reminder_id', reminderIds)
    .order('paid_at', { ascending: false });

  if (paymentsError) throw paymentsError;

  // Group payments by reminder_id
  const paymentsByReminder = new Map<string, ReminderPayment[]>();
  payments?.forEach(payment => {
    if (!paymentsByReminder.has(payment.reminder_id)) {
      paymentsByReminder.set(payment.reminder_id, []);
    }
    paymentsByReminder.get(payment.reminder_id)!.push(payment);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return reminders.map(reminder => {
    const { daysUntilDue, isOverdue } = calculateDueStatus(reminder.due_day, reminder.recurrence, today);
    const reminderPayments = paymentsByReminder.get(reminder.id) || [];
    const { isPaidForCurrentCycle, lastPaidAt } = checkIfPaidForCurrentCycle(
      reminder, 
      reminderPayments, 
      today
    );

    return {
      ...reminder,
      daysUntilDue,
      isOverdue,
      isPaidForCurrentCycle,
      lastPaidAt,
    };
  });
}

function calculateDueStatus(
  dueDay: number,
  recurrence: 'monthly' | 'yearly' | 'weekly',
  today: Date
): { daysUntilDue: number; isOverdue: boolean } {
  let nextDueDate: Date;

  switch (recurrence) {
    case 'monthly': {
      nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
      }
      break;
    }

    case 'yearly': {
      nextDueDate = new Date(today.getFullYear(), 0, dueDay);
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear() + 1, 0, dueDay);
      }
      break;
    }

    case 'weekly': {
      // Get the start of the current week (Sunday)
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      nextDueDate = new Date(currentWeekStart);
      nextDueDate.setDate(currentWeekStart.getDate() + dueDay);
      if (nextDueDate < today) {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      }
      break;
    }

    default: {
      nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
    }
  }

  const diffTime = nextDueDate.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;

  return { daysUntilDue, isOverdue };
}

export async function searchRemindersWithPaymentStatus(
  userId: string,
  query: string,
  category: string | null
): Promise<ReminderWithStatus[]> {
  const supabase = await createSupabaseServerClient();

  let dbQuery = supabase.from('reminders').select('*').eq('user_id', userId);

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  const { data: reminders, error } = await dbQuery.order('due_day', { ascending: true });

  if (error) throw error;
  if (!reminders) return [];

  // Fetch recent payments for filtered reminders
  const reminderIds = reminders.map(r => r.id);
  const { data: payments, error: paymentsError } = await supabase
    .from('reminder_payments')
    .select('*')
    .eq('user_id', userId)
    .in('reminder_id', reminderIds)
    .order('paid_at', { ascending: false });

  if (paymentsError) throw paymentsError;

  // Group payments by reminder_id
  const paymentsByReminder = new Map<string, ReminderPayment[]>();
  payments?.forEach(payment => {
    if (!paymentsByReminder.has(payment.reminder_id)) {
      paymentsByReminder.set(payment.reminder_id, []);
    }
    paymentsByReminder.get(payment.reminder_id)!.push(payment);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return reminders.map(reminder => {
    const { daysUntilDue, isOverdue } = calculateDueStatus(reminder.due_day, reminder.recurrence, today);
    const reminderPayments = paymentsByReminder.get(reminder.id) || [];
    const { isPaidForCurrentCycle, lastPaidAt } = checkIfPaidForCurrentCycle(
      reminder, 
      reminderPayments, 
      today
    );

    return {
      ...reminder,
      daysUntilDue,
      isOverdue,
      isPaidForCurrentCycle,
      lastPaidAt,
    };
  });
}
