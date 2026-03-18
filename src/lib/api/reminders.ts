import { createSupabaseServerClient } from '../supabase/server';
import type { Reminder, ReminderPayment, ReminderAnalytics } from '@/types/reminder.types';
import type { CreateReminderInput, UpdateReminderInput } from '../validations/reminder.schemas';
import { checkIfPaidForCurrentCycle } from '../utils/reminders';

export async function getReminders(userId: string): Promise<Reminder[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_day', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getReminderById(userId: string, id: string): Promise<Reminder | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createReminder(
  userId: string,
  input: CreateReminderInput,
): Promise<Reminder> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminders')
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create reminder');
  return data;
}

export async function updateReminder(
  userId: string,
  id: string,
  input: UpdateReminderInput,
): Promise<Reminder> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminders')
    .update(input)
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Reminder not found');
  return data;
}

export async function deleteReminder(userId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('reminders').delete().eq('user_id', userId).eq('id', id);

  if (error) throw error;
}

export async function getReminderPayments(userId: string, reminderId: string): Promise<ReminderPayment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminder_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('reminder_id', reminderId)
    .order('paid_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReminderPayment(
  userId: string,
  reminderId: string,
  amountPaid: number,
  paidAt: string,
): Promise<ReminderPayment> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reminder_payments')
    .insert({
      user_id: userId,
      reminder_id: reminderId,
      amount_paid: amountPaid,
      paid_at: paidAt,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create payment');
  return data;
}

export async function getReminderAnalytics(
  userId: string,
  reminderId: string,
): Promise<ReminderAnalytics> {
  const [payments, reminder] = await Promise.all([
    getReminderPayments(userId, reminderId),
    getReminderById(userId, reminderId),
  ]);

  if (!reminder) throw new Error('Reminder not found');

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const paymentCount = payments.length;
  const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;
  const lastPaidAt = payments.length > 0 ? payments[0].paid_at : null;

  const { getDaysUntilDue, getDaysUntilCutoff, isCutoffSoon } = await import('../utils/dates');
  const daysUntilDue = getDaysUntilDue(reminder.due_day, reminder.recurrence);
  const isOverdue = daysUntilDue < 0;

  // Calculate cutoff information only if cutoff_day is set
  let daysUntilCutoff: number | null = null;
  let isCutoffSoonFlag: boolean = false;
  
  if (reminder.cutoff_day !== null && reminder.cutoff_day !== undefined) {
    daysUntilCutoff = getDaysUntilCutoff(reminder.cutoff_day);
    isCutoffSoonFlag = isCutoffSoon(daysUntilCutoff);
  }

  // Check if paid for current cycle
  const { isPaidForCurrentCycle } = checkIfPaidForCurrentCycle(reminder, payments);

  return {
    total_paid: totalPaid,
    payment_count: paymentCount,
    payment_history: payments,
    average_payment: averagePayment,
    last_paid_at: lastPaidAt,
    days_until_due: daysUntilDue,
    is_overdue: isOverdue,
    days_until_cutoff: daysUntilCutoff,
    is_cutoff_soon: isCutoffSoonFlag,
    is_paid_for_current_cycle: isPaidForCurrentCycle,
  };
}
