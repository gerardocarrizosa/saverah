import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getIncome } from '@/lib/api/budget';
import { IncomePageClient } from '@/components/budget/IncomePageClient';
import { redirect } from 'next/navigation';
import type { Income } from '@/types/budget.types';

interface IncomeInsights {
  total: number;
  count: number;
  steadyCount: number;
  variableCount: number;
}

function calculateInsights(income: Income[]): IncomeInsights {
  const total = income.reduce((sum, item) => sum + item.amount, 0);
  const count = income.length;
  const steadyCount = income.filter((item) => item.type === 'steady').length;
  const variableCount = income.filter((item) => item.type === 'variable').length;

  return {
    total,
    count,
    steadyCount,
    variableCount,
  };
}

export default async function IncomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Direct DB call for SSR - no HTTP round-trip
  const income = await getIncome(user.id);

  // Calculate insights server-side
  const insights = calculateInsights(income);

  return (
    <IncomePageClient
      initialIncome={income}
      insights={insights}
    />
  );
}
