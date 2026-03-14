'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBudget } from '@/hooks/useBudget';
import { ExpenseList } from '@/components/budget/ExpenseList';
import type { Expense } from '@/types/budget.types';
import {
  Receipt,
  TrendingDown,
  Loader2,
  PieChart,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowLeft,
} from 'lucide-react';

interface ExpenseInsights {
  total: number;
  count: number;
  topCategories: [string, number][];
  recentSpending: number;
  trend: number;
}

interface ExpensesPageClientProps {
  initialExpenses: Expense[];
  insights: ExpenseInsights;
}

export function ExpensesPageClient({
  initialExpenses,
  insights,
}: ExpensesPageClientProps) {
  const { expenses, loading, error, refresh, deleteExpense } = useBudget({
    expenses: initialExpenses,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
      await refresh();
    } catch {
      // Error is handled in the hook
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Back Navigation */}
      <Link
        href="/budget"
        className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a presupuesto
      </Link>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-error/10">
            <Receipt className="w-6 h-6 text-error" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">Gastos</h1>
            <p className="text-sm text-base-content/60">
              Registra y monitorea tus gastos por categoría
            </p>
          </div>
        </div>

        <Link
          href="/budget/expenses/new"
          className="btn btn-primary gap-2 shrink-0 rounded"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo gasto</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Total de gastos
                </p>
                <p className="text-2xl font-bold text-error">
                  {formatCurrency(insights.total)}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  {insights.count}{' '}
                  {insights.count === 1 ? 'registro' : 'registros'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-error/10">
                <TrendingDown className="w-5 h-5 text-error" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trend Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Últimos 7 días
                </p>
                <p className="text-2xl font-bold text-base-content">
                  {formatCurrency(insights.recentSpending)}
                </p>
                {insights.trend !== 0 && (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${insights.trend > 0 ? 'text-error' : 'text-success'}`}
                  >
                    <ArrowUpRight
                      className={`w-3 h-3 ${insights.trend > 0 ? '' : 'rotate-90'}`}
                    />
                    {Math.abs(insights.trend).toFixed(0)}% vs. semana anterior
                  </p>
                )}
              </div>
              <div className="p-2 rounded-lg bg-base-200">
                <Wallet className="w-5 h-5 text-base-content/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Category Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-base-content/60">
                Categoría principal
              </p>
              <div className="p-2 rounded-lg bg-base-200">
                <PieChart className="w-5 h-5 text-base-content/70" />
              </div>
            </div>
            {insights.topCategories.length > 0 ? (
              <div>
                <span className="badge badge-primary badge-sm mb-2">
                  {insights.topCategories[0][0]}
                </span>
                <p className="text-xl font-bold text-base-content">
                  {formatCurrency(insights.topCategories[0][1])}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  {(
                    (insights.topCategories[0][1] / insights.total) *
                    100
                  ).toFixed(0)}
                  % del total
                </p>
              </div>
            ) : (
              <p className="text-sm text-base-content/50">
                Sin gastos registrados
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {insights.topCategories.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="card-title text-base flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4" />
              Distribución por categoría
            </h2>
            <div className="space-y-3">
              {insights.topCategories.map(([category, amount]) => {
                const percentage =
                  insights.total > 0 ? (amount / insights.total) * 100 : 0;
                return (
                  <div key={category} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-base-content/80 shrink-0">
                      {category}
                    </span>
                    <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-medium text-base-content shrink-0">
                      {formatCurrency(amount)}
                    </span>
                    <span className="w-12 text-right text-xs text-base-content/50 shrink-0">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Expense List - Full Width */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Historial de gastos
            </h2>
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-base-content/50" />
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-base-content/30" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
