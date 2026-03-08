import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getBudgetSummary, getIncome, getExpenses } from '@/lib/api/budget';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { BudgetStatsContainer } from '@/components/budget/BudgetStatsContainer';
import { BudgetCategoryManager } from '@/components/budget/BudgetCategoryManager';
import { RecentTransactions } from '@/components/budget/RecentTransactions';
import { Target } from 'lucide-react';

// Server action to refresh the page after setting a limit
async function refreshPage() {
  'use server';
  // This is a no-op that forces a re-render
}

function BudgetLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            💰
          </div>
        </div>
        <p className="text-base-content/60">Cargando tu presupuesto...</p>
      </div>
    </div>
  );
}

export default async function BudgetPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all budget data in parallel
  const [summary, income, expenses] = await Promise.all([
    getBudgetSummary(user.id),
    getIncome(user.id),
    getExpenses(user.id),
  ]);

  const totalIncome = summary.total_income;
  const totalExpenses = summary.total_expenses;
  const balance = summary.balance;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between gap-4">
        <h1 className="font-bold text-base-content flex items-center gap-3">
          <span className="text-3xl">💰</span>
          Presupuesto
        </h1>
      </div>

      {/* Stats Overview with Visibility Toggle - Client Component */}
      <BudgetStatsContainer
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        incomeCount={income.length}
        expenseCount={expenses.length}
      />

      {/* Budget Categories with Progress */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Tus categorías</h2>
        </div>
        <Suspense fallback={<BudgetLoading />}>
          <BudgetCategoryManager
            categories={summary.categories}
            onLimitSet={refreshPage}
          />
        </Suspense>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <RecentTransactions income={income} expenses={expenses} />
      </div>

      {/* Empty State Helper */}
      {income.length === 0 && expenses.length === 0 && (
        <div className="card bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/20">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-xl font-bold mb-2">
              ¡Comienza tu viaje financiero!
            </h3>
            <p className="text-base-content/60 max-w-lg mx-auto mb-6">
              Para aprovechar al máximo tu presupuesto, comienza registrando tus
              ingresos y gastos. Podrás establecer límites, ver gráficos y
              mantener el control de tus finanzas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/budget/income" className="btn btn-success gap-2">
                <span>💰</span>
                Registrar ingreso
              </a>
              <a href="/budget/expenses" className="btn btn-error gap-2">
                <span>💸</span>
                Registrar gasto
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
