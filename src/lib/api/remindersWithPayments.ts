import { createSupabaseServerClient } from "../supabase/server";
import type { Reminder, ReminderPayment } from "@/types/reminder.types";
import { checkIfPaidForCurrentCycle } from "../utils/reminders";
import { getReminderDueStatus } from "../utils/dates";

export type ReminderWithStatus = Reminder & {
  daysUntilDue: number;
  isOverdue: boolean;
  isPaidForCurrentCycle: boolean;
  lastPaidAt: string | null;
};

export async function getRemindersWithPaymentStatus(
  userId: string,
): Promise<ReminderWithStatus[]> {
  const supabase = await createSupabaseServerClient();

  // Fetch all reminders for the user
  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("due_day", { ascending: true });

  if (remindersError) throw remindersError;
  if (!reminders) return [];

  // Fetch recent payments for all reminders
  const reminderIds = reminders.map((r) => r.id);
  const { data: payments, error: paymentsError } = await supabase
    .from("reminder_payments")
    .select("*")
    .eq("user_id", userId)
    .in("reminder_id", reminderIds)
    .order("paid_at", { ascending: false });

  if (paymentsError) throw paymentsError;

  // Group payments by reminder_id
  const paymentsByReminder = new Map<string, ReminderPayment[]>();
  payments?.forEach((payment) => {
    if (!paymentsByReminder.has(payment.reminder_id)) {
      paymentsByReminder.set(payment.reminder_id, []);
    }
    paymentsByReminder.get(payment.reminder_id)!.push(payment);
  });

  return reminders.map((reminder) => {
    const { daysUntilDue, isOverdue } = getReminderDueStatus(
      reminder.due_day,
      reminder.recurrence,
    );
    const reminderPayments = paymentsByReminder.get(reminder.id) || [];
    const { isPaidForCurrentCycle, lastPaidAt } = checkIfPaidForCurrentCycle(
      reminder,
      reminderPayments,
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

export async function searchRemindersWithPaymentStatus(
  userId: string,
  query: string,
  category: string | null,
): Promise<ReminderWithStatus[]> {
  const supabase = await createSupabaseServerClient();

  let dbQuery = supabase.from("reminders").select("*").eq("user_id", userId);

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  const { data: reminders, error } = await dbQuery.order("due_day", {
    ascending: true,
  });

  if (error) throw error;
  if (!reminders) return [];

  // Fetch recent payments for filtered reminders
  const reminderIds = reminders.map((r) => r.id);
  const { data: payments, error: paymentsError } = await supabase
    .from("reminder_payments")
    .select("*")
    .eq("user_id", userId)
    .in("reminder_id", reminderIds)
    .order("paid_at", { ascending: false });

  if (paymentsError) throw paymentsError;

  // Group payments by reminder_id
  const paymentsByReminder = new Map<string, ReminderPayment[]>();
  payments?.forEach((payment) => {
    if (!paymentsByReminder.has(payment.reminder_id)) {
      paymentsByReminder.set(payment.reminder_id, []);
    }
    paymentsByReminder.get(payment.reminder_id)!.push(payment);
  });

  return reminders.map((reminder) => {
    const { daysUntilDue, isOverdue } = getReminderDueStatus(
      reminder.due_day,
      reminder.recurrence,
    );
    const reminderPayments = paymentsByReminder.get(reminder.id) || [];
    const { isPaidForCurrentCycle, lastPaidAt } = checkIfPaidForCurrentCycle(
      reminder,
      reminderPayments,
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
