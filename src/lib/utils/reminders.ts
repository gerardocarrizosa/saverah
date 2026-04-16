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
  
  // Extract UTC date components to preserve the actual calendar date
  // regardless of timezone differences
  const lastPaidAtUtc = new Date(lastPayment.paid_at);
  const lastPaidAt = new Date(
    lastPaidAtUtc.getUTCFullYear(),
    lastPaidAtUtc.getUTCMonth(),
    lastPaidAtUtc.getUTCDate()
  );

  let isPaidForCurrentCycle = false;

  switch (reminder.recurrence) {
    case 'monthly': {
      // For monthly reminders: check if paid after the previous due date
      const currentDueDate = new Date(today.getFullYear(), today.getMonth(), reminder.due_day);
      const lastDueDate = new Date(currentDueDate);
      lastDueDate.setMonth(lastDueDate.getMonth() - 1);

      // Payment made anytime strictly after the previous due date counts as paid for current cycle
      isPaidForCurrentCycle = lastPaidAt > lastDueDate;
      break;
    }

    case 'yearly': {
      // For yearly reminders: check if paid after the previous due date
      const currentYearDueDate = new Date(today.getFullYear(), 0, reminder.due_day);
      const lastYearDueDate = new Date(currentYearDueDate);
      lastYearDueDate.setFullYear(lastYearDueDate.getFullYear() - 1);

      // Payment made anytime strictly after the previous due date counts as paid for current cycle
      isPaidForCurrentCycle = lastPaidAt > lastYearDueDate;
      break;
    }

    case 'weekly': {
      // For weekly reminders: check if paid after the previous due date
      // Get the start of the current week (Sunday)
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      // Get the due date for this week
      const currentWeekDueDate = new Date(currentWeekStart);
      currentWeekDueDate.setDate(currentWeekStart.getDate() + reminder.due_day);

      const lastWeekDueDate = new Date(currentWeekDueDate);
      lastWeekDueDate.setDate(lastWeekDueDate.getDate() - 7);

      // Payment made anytime strictly after the previous due date counts as paid for current cycle
      isPaidForCurrentCycle = lastPaidAt > lastWeekDueDate;
      break;
    }
  }

  return {
    isPaidForCurrentCycle,
    lastPaidAt: lastPayment.paid_at
  };
}
