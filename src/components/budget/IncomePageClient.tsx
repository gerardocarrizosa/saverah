"use client";

import { useState } from "react";
import Link from "next/link";
import { useBudget } from "@/hooks/useBudget";
import { IncomeList } from "@/components/budget/IncomeList";
import type { Income } from "@/types/budget.types";
import { formatCurrency } from "@/lib/utils/currency";
import {
  TrendingUp,
  Plus,
  ArrowLeft,
  Briefcase,
  LineChart,
} from "lucide-react";

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

  const totalStr = formatCurrency(insights.total, 0);
  const [totalWhole, totalCents] = totalStr.includes(".")
    ? totalStr.split(".")
    : [totalStr, "00"];

  return (
    <div className="space-y-10">
      {/* Back Navigation */}
      <Link
        href="/budget"
        className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content transition-colors -my-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a presupuesto
      </Link>

      {/* Header + CTA */}
      <div className="flex items-start justify-between gap-4">
        <section className="space-y-2">
          <span className="font-[family-name:var(--font-body)] text-success uppercase tracking-[0.2em] text-[0.6875rem] font-semibold">
            Registro de movimientos
          </span>
          <h1 className="font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-base-content">
            Ingresos
          </h1>
          <p className="font-[family-name:var(--font-body)] text-base-content/60 mt-2 max-w-[80%]">
            Registra y gestiona tus fuentes de ingreso. {insights.count}{" "}
            {insights.count === 1 ? "registro" : "registros"} en total.
          </p>
        </section>

        <Link
          href="/budget/income/new"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-success/10 text-success rounded-full text-sm font-bold hover:bg-success/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo ingreso</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Total Hero */}
        <div className="md:col-span-7 bg-base-200 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-bold uppercase tracking-wider">
              Total de ingresos
            </p>
            <div className="p-1.5 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-5xl md:text-6xl font-bold tracking-tighter text-base-content leading-none mb-4">
            {totalWhole}
            <span className="text-base-content/40">.{totalCents}</span>
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[10px] text-base-content/40 uppercase tracking-widest">
            {insights.count} {insights.count === 1 ? "registro" : "registros"}
          </p>
        </div>

        {/* Right Column: Steady + Variable */}
        <div className="md:col-span-5 space-y-4">
          {/* Steady Income */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Ingresos fijos
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <Briefcase className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-headline)] text-2xl font-bold text-base-content">
              {insights.steadyCount}
            </p>
            <p className="text-[10px] text-base-content/40 uppercase tracking-widest">
              Registros estables
            </p>
          </div>

          {/* Variable Income */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Ingresos variables
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <LineChart className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-headline)] text-2xl font-bold text-base-content">
              {insights.variableCount}
            </p>
            <p className="text-[10px] text-base-content/40 uppercase tracking-widest">
              Registros variables
            </p>
          </div>
        </div>
      </section>

      {/* Income List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight">
            Historial de ingresos
          </h2>
          {loading && (
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-base-content/60">
                Cargando ingresos...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error rounded-xl p-6 flex items-center gap-3">
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <IncomeList
            income={income}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>
    </div>
  );
}
