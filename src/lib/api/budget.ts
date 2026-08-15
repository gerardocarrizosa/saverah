import { createSupabaseServerClient } from '../supabase/server';
import type { Income, Expense, BudgetLimit, BudgetSummary, CategorySummary, DeleteExpenseResult, DeleteExpenseScope } from '@/types/budget.types';
import type { CreateIncomeInput, CreateExpenseInput, UpdateExpenseInput, UpdateIncomeInput } from '../validations/budget.schemas';
import { generateInstallmentExpenseDrafts } from '@/lib/utils/installments';

const MONTH_FORMAT_ERROR = 'El mes debe tener formato YYYY-MM';

export function getMonthRange(month?: string, timezone = 'America/Hermosillo'): { start: string; end: string; month: string } {
  let year: number;
  let monthNumber: number;

  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month);
    if (!match) throw new Error(MONTH_FORMAT_ERROR);

    year = Number(match[1]);
    monthNumber = Number(match[2]);
    if (monthNumber < 1 || monthNumber > 12) throw new Error(MONTH_FORMAT_ERROR);
  } else {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    year = Number(parts.find((p) => p.type === 'year')?.value || now.getFullYear());
    monthNumber = Number(parts.find((p) => p.type === 'month')?.value || now.getMonth() + 1);
  }

  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999));

  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
    month: `${year}-${String(monthNumber).padStart(2, '0')}`,
  };
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(`${input}T00:00:00.000Z`);
}

export function isMonthFormatError(error: unknown): boolean {
  return error instanceof Error && error.message === MONTH_FORMAT_ERROR;
}

export async function getIncome(userId: string, month?: string): Promise<Income[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getMonthRange(month);
  
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .gte('received_at', start)
    .lte('received_at', end)
    .order('received_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createIncome(userId: string, input: CreateIncomeInput): Promise<Income> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('income')
    .insert({
      ...input,
      user_id: userId,
      received_at: input.received_at.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create income');
  return data;
}

export async function updateIncome(
  userId: string,
  id: string,
  input: UpdateIncomeInput,
): Promise<Income> {
  const supabase = await createSupabaseServerClient();
  const updateData: Record<string, unknown> = { ...input };
  if (input.received_at) {
    updateData.received_at = input.received_at.toISOString();
  }

  const { data, error } = await supabase
    .from('income')
    .update(updateData)
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Income not found');
  return data;
}

export async function deleteIncome(userId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('income').delete().eq('user_id', userId).eq('id', id);

  if (error) throw error;
}

export async function getExpenses(userId: string, month?: string): Promise<Expense[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getMonthRange(month);
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('spent_at', start)
    .lte('spent_at', end)
    .order('spent_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<Expense | Expense[]> {
  const supabase = await createSupabaseServerClient();
  const installmentCount = input.is_installment ? input.installment_count : null;

  if (installmentCount && installmentCount >= 2) {
    const groupId = crypto.randomUUID();
    const rows = generateInstallmentExpenseDrafts({
      userId,
      groupId,
      description: input.description,
      amount: input.amount,
      category: input.category,
      spentAt: toDate(input.spent_at),
      notes: input.notes,
      installmentCount,
    });

    const { data, error } = await supabase
      .from('expenses')
      .insert(rows)
      .select()
      .order('installment_number', { ascending: true });

    if (error) throw error;
    if (!data) throw new Error('Failed to create installment expense');
    return data;
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      description: input.description,
      amount: input.amount,
      category: input.category,
      spent_at: toDate(input.spent_at).toISOString().slice(0, 10),
      notes: input.notes || null,
      installment_group_id: null,
      installment_number: null,
      installment_total: null,
      installment_total_amount: null,
      installment_start_date: null,
      installment_end_date: null,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create expense');
  return data;
}

export async function updateExpense(
  userId: string,
  id: string,
  input: UpdateExpenseInput,
): Promise<Expense> {
  const supabase = await createSupabaseServerClient();
  const updateData: Record<string, unknown> = { ...input };
  delete updateData.is_installment;
  delete updateData.installment_count;
  if (input.spent_at) {
    updateData.spent_at = toDate(input.spent_at).toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Expense not found');
  return data;
}

export async function deleteExpense(userId: string, id: string, scope: DeleteExpenseScope = 'single'): Promise<DeleteExpenseResult> {
  const supabase = await createSupabaseServerClient();

  if (scope === 'series') {
    const { data: target, error: targetError } = await supabase
      .from('expenses')
      .select('installment_group_id')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (targetError) throw targetError;
    if (!target?.installment_group_id) {
      throw new Error('Expense installment series not found');
    }

    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', userId)
      .eq('installment_group_id', target.installment_group_id)
      .select('id');

    if (error) throw error;
    return { success: true, deleted_count: data?.length ?? 0, scope };
  }

  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id');

  if (error) throw error;
  return { success: true, deleted_count: data?.length ?? 0, scope };
}

export async function getBudgetLimits(userId: string): Promise<BudgetLimit[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('budget_limits')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function setBudgetLimit(
  userId: string,
  category: string,
  limit: number,
): Promise<BudgetLimit> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('budget_limits')
    .upsert({ user_id: userId, category, monthly_limit: limit })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to set budget limit');
  return data;
}

export async function getBudgetSummary(userId: string, month?: string): Promise<BudgetSummary> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getMonthRange(month);
  
  const [income, expenses, limits] = await Promise.all([
    supabase.from('income').select('amount').eq('user_id', userId).gte('received_at', start).lte('received_at', end),
    supabase.from('expenses').select('*').eq('user_id', userId).gte('spent_at', start).lte('spent_at', end),
    supabase.from('budget_limits').select('*').eq('user_id', userId),
  ]);

  const totalIncome = (income.data || []).reduce((sum: number, i: { amount: number }) => sum + Number(i.amount), 0);
  const totalExpenses = (expenses.data || []).reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory: Record<string, number> = {};
  for (const expense of expenses.data || []) {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + Number(expense.amount);
  }

  const limitByCategory: Record<string, number> = {};
  for (const limit of limits.data || []) {
    limitByCategory[limit.category] = Number(limit.monthly_limit);
  }

  const allCategories = new Set([...Object.keys(expensesByCategory), ...Object.keys(limitByCategory)]);

  const categories: CategorySummary[] = Array.from(allCategories).map((category) => {
    const spent = expensesByCategory[category] || 0;
    const limit = limitByCategory[category] || null;
    const percentage = limit ? (spent / limit) * 100 : null;

    let status: 'ok' | 'warning' | 'exceeded' = 'ok';
    if (limit) {
      if (spent >= limit) {
        status = 'exceeded';
      } else if (spent >= limit * 0.8) {
        status = 'warning';
      }
    }

    return {
      category,
      spent,
      limit,
      percentage,
      status,
    };
  });

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    balance,
    categories,
  };
}
