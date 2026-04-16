import { createSupabaseServerClient } from '../supabase/server';
import type { Income, Expense, BudgetLimit, BudgetSummary, CategorySummary } from '@/types/budget.types';
import type { CreateIncomeInput, CreateExpenseInput, UpdateExpenseInput, UpdateIncomeInput } from '../validations/budget.schemas';

function getCurrentMonthRange(timezone = 'America/Hermosillo'): { start: string; end: string } {
  const now = new Date();
  
  // Get current date in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || now.getFullYear().toString());
  const month = parseInt(parts.find(p => p.type === 'month')?.value || (now.getMonth() + 1).toString());
  
  // Create start of month (day 1) in the target timezone
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  
  // Create end of month (last day) in the target timezone
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  return {
    start: startDate.toISOString(),
    end: lastDayOfMonth.toISOString(),
  };
}

export async function getIncome(userId: string): Promise<Income[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getCurrentMonthRange();
  
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

export async function getExpenses(userId: string): Promise<Expense[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getCurrentMonthRange();
  
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

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<Expense> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...input,
      user_id: userId,
      spent_at: input.spent_at.toISOString(),
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
  if (input.spent_at) {
    updateData.spent_at = input.spent_at.toISOString();
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

export async function deleteExpense(userId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('expenses').delete().eq('user_id', userId).eq('id', id);

  if (error) throw error;
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

export async function getBudgetSummary(userId: string): Promise<BudgetSummary> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getCurrentMonthRange();
  
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
