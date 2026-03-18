import type { Reminder, ReminderPayment } from '@/types/reminder.types';

export interface PaidStatusResult {
  isPaidForCurrentCycle: boolean;
  lastPaidAt: string | null;
}

/**
 * Check if a reminder has been paid for the current billing cycle
 * based on its recurrence pattern and payment history.
 */
export function checkIfPaidForCurrentCycle(
  reminder: Pick<Reminder, 'due_day' | 'recurrence'>,
  payments: Pick<ReminderPayment, 'paid_at'>[],
  today: Date = new Date()
): PaidStatusResult {
  if (payments.length === 0) {
    return { isPaidForCurrentCycle: false, lastPaidAt: null };
  }

  // Sort payments by paid_at desc and get the most recent one
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  );
  const lastPayment = sortedPayments[0];
  const lastPaidAt = new Date(lastPayment.paid_at);
  lastPaidAt.setHours(0, 0, 0, 0);

  let isPaidForCurrentCycle = false;

  switch (reminder.recurrence) {
    case 'monthly': {
      // For monthly reminders: check if there's a payment between last due date and next due date
      // If daysUntilDue > 0, the payment covers this cycle if it was paid after the last due date
      // or during the current month before the due date
      const currentDueDate = new Date(today.getFullYear(), today.getMonth(), reminder.due_day);
      const lastDueDate = new Date(currentDueDate);
      lastDueDate.setMonth(lastDueDate.getMonth() - 1);

      // If today is before due date, check if paid after last due date
      // If today is after due date, check if paid after current due date
      const checkDate = today < currentDueDate ? lastDueDate : currentDueDate;
      isPaidForCurrentCycle = lastPaidAt >= checkDate;
      break;
    }

    case 'yearly': {
      // For yearly reminders: check if paid in current year
      const currentYearDueDate = new Date(today.getFullYear(), 0, reminder.due_day);
      const lastYearDueDate = new Date(currentYearDueDate);
      lastYearDueDate.setFullYear(lastYearDueDate.getFullYear() - 1);

      const checkDate = today < currentYearDueDate ? lastYearDueDate : currentYearDueDate;
      isPaidForCurrentCycle = lastPaidAt >= checkDate;
      break;
    }

    case 'weekly': {
      // For weekly reminders: check if paid within the current week
      // Get the start of the current week (Sunday)
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      // Get the due date for this week
      const currentWeekDueDate = new Date(currentWeekStart);
      currentWeekDueDate.setDate(currentWeekStart.getDate() + reminder.due_day);

      const lastWeekDueDate = new Date(currentWeekDueDate);
      lastWeekDueDate.setDate(lastWeekDueDate.getDate() - 7);

      const checkDate = today < currentWeekDueDate ? lastWeekDueDate : currentWeekDueDate;
      isPaidForCurrentCycle = lastPaidAt >= checkDate;
      break;
    }
  }

  return {
    isPaidForCurrentCycle,
    lastPaidAt: lastPayment.paid_at
  };
}
