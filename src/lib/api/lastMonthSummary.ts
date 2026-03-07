import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BudgetSummary } from '@/types/budget.types';

export async function getLastMonthBudgetSummary(userId: string): Promise<BudgetSummary | null> {
  const supabase = await createSupabaseServerClient();
  
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  const startDate = lastMonth.toISOString().split('T')[0];
  const endDate = lastMonthEnd.toISOString().split('T')[0];
  
  // Get income for last month
  const { data: incomeData, error: incomeError } = await supabase
    .from('income')
    .select('amount')
    .eq('user_id', userId)
    .gte('received_at', startDate)
    .lte('received_at', endDate);
  
  if (incomeError) throw incomeError;
  
  // Get expenses for last month
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', userId)
    .gte('spent_at', startDate)
    .lte('spent_at', endDate);
  
  if (expensesError) throw expensesError;
  
  // Calculate totals
  const totalIncome = (incomeData || []).reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpenses;
  
  // Get budget limits for category calculation
  const { data: limitsData } = await supabase
    .from('budget_limits')
    .select('*')
    .eq('user_id', userId);
  
  // Calculate categories (simplified for last month)
  const expensesByCategory: Record<string, number> = {};
  for (const expense of expensesData || []) {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + Number(expense.amount);
  }
  
  const limitsByCategory: Record<string, number> = {};
  for (const limit of limitsData || []) {
    limitsByCategory[limit.category] = Number(limit.monthly_limit);
  }
  
  const allCategories = new Set([...Object.keys(expensesByCategory), ...Object.keys(limitsByCategory)]);
  
  const categories = Array.from(allCategories).map((category) => {
    const spent = expensesByCategory[category] || 0;
    const limit = limitsByCategory[category] || null;
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
