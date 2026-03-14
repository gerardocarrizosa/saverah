'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBudget } from '@/hooks/useBudget';
import { IncomeList } from '@/components/budget/IncomeList';
import type { Income } from '@/types/budget.types';
import { Wallet, TrendingUp, Loader2, Plus, ArrowLeft } from 'lucide-react';

interface IncomeInsights {
  total: number;
  count: number;
  steadyCount: number;
  variableCount: number;
}

interface IncomePageClientProps {
  initialIncome: Income[];
  insights: IncomeInsights;
}

export function IncomePageClient({
  initialIncome,
  insights,
}: IncomePageClientProps) {
  const { income, loading, error, deleteIncome } = useBudget({
    income: initialIncome,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteIncome(id);
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
          <div className="p-2 rounded-xl bg-success/10">
            <Wallet className="w-6 h-6 text-success" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">Ingresos</h1>
            <p className="text-sm text-base-content/60">
              Registra y gestiona tus fuentes de ingreso
            </p>
          </div>
        </div>

        <Link
          href="/budget/income/new"
          className="btn btn-primary gap-2 shrink-0 rounded"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo ingreso</span>
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
                  Total de ingresos
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(insights.total)}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  {insights.count}{' '}
                  {insights.count === 1 ? 'registro' : 'registros'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Steady Income Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Ingresos fijos
                </p>
                <p className="text-2xl font-bold text-base-content">
                  {insights.steadyCount}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  Registros estables
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <span className="text-lg font-bold text-success">F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variable Income Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Ingresos variables
                </p>
                <p className="text-2xl font-bold text-base-content">
                  {insights.variableCount}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  Registros variables
                </p>
              </div>
              <div className="p-2 rounded-lg bg-warning/10">
                <span className="text-lg font-bold text-warning">V</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income List - Full Width */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-base flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Historial de ingresos
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
            <IncomeList
              income={income}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
