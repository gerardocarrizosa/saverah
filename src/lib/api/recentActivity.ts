import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ActivityItem } from '@/types/dashboard.types';

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

export async function getRecentActivity(userId: string, limit: number = 5): Promise<ActivityItem[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getCurrentMonthRange();
  
  // Get recent income
  const { data: incomeData, error: incomeError } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .gte('received_at', start)
    .lte('received_at', end)
    .order('received_at', { ascending: false })
    .limit(limit);
  
  if (incomeError) throw incomeError;
  
  // Get recent expenses
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('spent_at', start)
    .lte('spent_at', end)
    .order('spent_at', { ascending: false })
    .limit(limit);
  
  if (expensesError) throw expensesError;
  
  // Get recent reminder payments
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('reminder_payments')
    .select(`
      *,
      reminders(name)
    `)
    .eq('user_id', userId)
    .order('paid_at', { ascending: false })
    .limit(limit);
  
  if (paymentsError) throw paymentsError;
  
  // Transform and combine
  const activities: ActivityItem[] = [
    ...(incomeData || []).map((income) => ({
      id: income.id,
      type: 'income' as const,
      description: income.source,
      amount: income.amount,
      date: income.received_at,
      category: 'Ingreso',
    })),
    ...(expensesData || []).map((expense) => ({
      id: expense.id,
      type: 'expense' as const,
      description: expense.description,
      amount: expense.amount,
      date: expense.spent_at,
      category: expense.category,
    })),
    ...(paymentsData || []).map((payment) => ({
      id: payment.id,
      type: 'payment' as const,
      description: `Pago: ${payment.reminders?.name || 'Recordatorio'}`,
      amount: payment.amount_paid,
      date: payment.paid_at,
      category: 'Pago de recordatorio',
    })),
  ];
  
  // Sort by date descending and limit
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
