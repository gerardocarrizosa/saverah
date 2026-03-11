import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getBudgetSummary, getIncome, getExpenses } from '@/lib/api/budget';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { BudgetStatsContainer } from '@/components/budget/BudgetStatsContainer';
import { BudgetCategoryManager } from '@/components/budget/BudgetCategoryManager';
import { RecentTransactions } from '@/components/budget/RecentTransactions';
import {
  Wallet,
  PieChart,
  History,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// Server action to refresh the page after setting a limit
async function refreshPage() {
  'use server';
  // This is a no-op that forces a re-render
}

function BudgetLoading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded rounded-full animate-spin" />
        <p className="text-sm text-base-content/60">
          Cargando tu presupuesto...
        </p>
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
  const incomeCount = income.length;
  const expenseCount = expenses.length;

  const hasTransactions = income.length > 0 || expenses.length > 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-base-content">Presupuesto</h1>
      </div>

      {!hasTransactions ? (
        /* Empty State */
        <div className="card bg-base-100 border border-base-300 rounded">
          <div className="card-body text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-success/10 via-primary/10 to-error/10">
                <PieChart className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Comienza tu viaje financiero
            </h2>
            <p className="text-base-content/60 max-w-lg mx-auto mb-8">
              Para aprovechar al máximo tu presupuesto, comienza registrando tus
              ingresos y gastos. Podrás establecer límites, ver gráficos y
              mantener el control de tus finanzas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/budget/income" className="btn btn-success gap-2">
                <TrendingUp className="w-5 h-5" />
                Registrar ingreso
              </a>
              <a href="/budget/expenses" className="btn btn-error gap-2">
                <TrendingDown className="w-5 h-5" />
                Registrar gasto
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview with Flow Visualization */}
          <BudgetStatsContainer
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
            incomeCount={incomeCount}
            expenseCount={expenseCount}
          />

          {/* Budget Categories with Progress */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Tus categorías</h2>
            </div>
            <Suspense fallback={<BudgetLoading />}>
              <BudgetCategoryManager
                categories={summary.categories}
                onLimitSet={refreshPage}
              />
            </Suspense>
          </section>

          {/* Recent Transactions */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Movimientos recientes</h2>
            </div>
            <RecentTransactions income={income} expenses={expenses} />
          </section>
        </>
      )}
    </div>
  );
}
