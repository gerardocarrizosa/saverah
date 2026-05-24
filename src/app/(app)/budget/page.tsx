import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getBudgetSummary, getIncome, getExpenses } from '@/lib/api/budget';
import { redirect } from 'next/navigation';
import { BudgetHero } from '@/components/budget/BudgetHero';
import { CategoryGrid } from '@/components/budget/CategoryGrid';
import { QuickLogPanel } from '@/components/budget/QuickLogPanel';
import { ActivityFeed } from '@/components/budget/ActivityFeed';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

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
    <main className="space-y-10">
      {!hasTransactions ? (
        /* Empty State */
        <div className="bg-base-200 rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-success/10 via-primary/10 to-error/10">
              <PieChart className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 font-[family-name:var(--font-headline)]">
            Comienza tu viaje financiero
          </h2>
          <p className="text-base-content/60 max-w-lg mx-auto mb-8">
            Para aprovechar al máximo tu presupuesto, comienza registrando tus
            ingresos y gastos. Podrás establecer límites, ver gráficos y
            mantener el control de tus finanzas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/budget/income/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-full text-sm font-bold hover:bg-secondary/20 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Registrar ingreso
            </a>
            <a
              href="/budget/expenses/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
            >
              <TrendingDown className="w-5 h-5" />
              Registrar gasto
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Hero: Asymmetric Wealth Summary */}
          <BudgetHero
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
            incomeCount={incomeCount}
            expenseCount={expenseCount}
          />

          {/* Bento Grid: Categories & Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CategoryGrid categories={summary.categories} />
            </div>
            <div className="md:col-span-1">
              <QuickLogPanel />
            </div>
          </section>

          {/* Recent Transactions: Editorial Style */}
          <ActivityFeed income={income} expenses={expenses} />
        </>
      )}
    </main>
  );
}
