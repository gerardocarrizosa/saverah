import type { Expense } from '@/types/budget.types';

type InstallmentDraftInput = {
  userId: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  spentAt: Date;
  notes?: string | null;
  installmentCount: number;
};

export type InstallmentExpenseDraft = {
  user_id: string;
  description: string;
  amount: number;
  category: string;
  spent_at: string;
  notes: string | null;
  installment_group_id: string;
  installment_number: number;
  installment_total: number;
  installment_total_amount: number;
  installment_start_date: string;
  installment_end_date: string;
};

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function splitAmountIntoInstallments(
  totalAmount: number,
  installmentCount: number,
): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / installmentCount);
  let remainderCents = totalCents % installmentCount;

  return Array.from({ length: installmentCount }, () => {
    const cents = baseCents + (remainderCents > 0 ? 1 : 0);
    remainderCents = Math.max(0, remainderCents - 1);
    return cents / 100;
  });
}

export function addMonthsClamped(startDate: Date, monthOffset: number): Date {
  const year = startDate.getUTCFullYear();
  const month = startDate.getUTCMonth() + monthOffset;
  const day = startDate.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

export function generateMonthlyInstallmentDates(
  startDate: Date,
  installmentCount: number,
): Date[] {
  return Array.from({ length: installmentCount }, (_, index) =>
    addMonthsClamped(startDate, index),
  );
}

export function generateInstallmentExpenseDrafts({
  userId,
  groupId,
  description,
  amount,
  category,
  spentAt,
  notes,
  installmentCount,
}: InstallmentDraftInput): InstallmentExpenseDraft[] {
  const amounts = splitAmountIntoInstallments(amount, installmentCount);
  const dates = generateMonthlyInstallmentDates(spentAt, installmentCount);
  const startDate = toDateOnly(dates[0]);
  const endDate = toDateOnly(dates[dates.length - 1]);

  return dates.map((date, index) => ({
    user_id: userId,
    description,
    amount: amounts[index],
    category,
    spent_at: toDateOnly(date),
    notes: notes || null,
    installment_group_id: groupId,
    installment_number: index + 1,
    installment_total: installmentCount,
    installment_total_amount: amount,
    installment_start_date: startDate,
    installment_end_date: endDate,
  }));
}

export function isInstallmentExpense(expense: Expense): boolean {
  return Boolean(expense.installment_group_id);
}

export function getInstallmentLabel(expense: Expense): string | null {
  if (!isInstallmentExpense(expense)) return null;
  return `Cuota ${expense.installment_number ?? '-'} de ${expense.installment_total ?? '-'}`;
}

export function getInstallmentSeriesDetails(expense: Expense) {
  if (!isInstallmentExpense(expense)) return null;

  return {
    label: getInstallmentLabel(expense),
    currentAmount: expense.amount,
    totalAmount: expense.installment_total_amount,
    totalInstallments: expense.installment_total,
    startDate: expense.installment_start_date,
    endDate: expense.installment_end_date,
  };
}
