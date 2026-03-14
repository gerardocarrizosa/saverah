import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getExpenses } from '@/lib/api/budget';
import { ExpensesPageClient } from '@/components/budget/ExpensesPageClient';
import { redirect } from 'next/navigation';
import type { Expense } from '@/types/budget.types';

interface ExpenseInsights {
  total: number;
  count: number;
  topCategories: [string, number][];
  recentSpending: number;
  trend: number;
}

function calculateInsights(expenses: Expense[]): ExpenseInsights {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Group by category
  const byCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Sort categories by amount
  const sortedCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4); // Top 4 categories

  // Calculate recent trend (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentSpending = expenses
    .filter((e) => new Date(e.spent_at) >= sevenDaysAgo)
    .reduce((sum, e) => sum + e.amount, 0);

  const previousSpending = expenses
    .filter((e) => {
      const date = new Date(e.spent_at);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const trend =
    previousSpending > 0
      ? ((recentSpending - previousSpending) / previousSpending) * 100
      : 0;

  return {
    total,
    count: expenses.length,
    topCategories: sortedCategories,
    recentSpending,
    trend,
  };
}

export default async function ExpensesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Direct DB call for SSR - no HTTP round-trip
  const expenses = await getExpenses(user.id);

  // Calculate insights server-side
  const insights = calculateInsights(expenses);

  return <ExpensesPageClient initialExpenses={expenses} insights={insights} />;
}
