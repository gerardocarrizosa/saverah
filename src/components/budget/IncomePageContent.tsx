import Link from "next/link";
import { IncomeList } from "@/components/budget/IncomeList";
import type { Income } from "@/types/budget.types";
import { formatCurrency } from "@/lib/utils/currency";
import {
  TrendingUp,
  Plus,
  ArrowLeft,
  Briefcase,
  LineChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface IncomeInsights {
  total: number;
  count: number;
  steadyCount: number;
  variableCount: number;
}

interface IncomePageContentProps {
  income: Income[];
  insights: IncomeInsights;
  selectedMonth: string;
}

export function IncomePageContent({
  income,
  insights,
  selectedMonth,
}: IncomePageContentProps) {
  const totalStr = formatCurrency(insights.total, 0);
  const [totalWhole, totalCents] = totalStr.includes(".")
    ? totalStr.split(".")
    : [totalStr, "00"];
  const [year, monthNumber] = selectedMonth.split("-").map(Number);
  const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const previousMonthDate = new Date(Date.UTC(year, monthNumber - 2, 1));
  const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1));
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthDate);
  const toMonthParam = (date: Date) =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

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
      <div className="flex items-start justify-between gap-4 mb-4!">
        <section className="space-y-2">
          <span className="font-(family-name:--font-body) text-success uppercase tracking-[0.2em] text-[0.6875rem] font-semibold">
            Registro de movimientos
          </span>
          <h1 className="font-(family-name:--font-headline) text-4xl font-extrabold tracking-tight text-base-content">
            Ingresos del mes
          </h1>
          <p className="font-(family-name:--font-body) text-base-content/60 mt-2 max-w-[80%]">
            {monthLabel}
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

      <nav className="my-4! flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Link
            href={`/budget/income?month=${toMonthParam(previousMonthDate)}`}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-base-300 px-3 py-2 text-xs font-bold text-base-content/60 transition-colors hover:text-base-content"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Link>
          <Link
            href={`/budget/income?month=${currentMonth}`}
            className="inline-flex items-center justify-center rounded-full bg-success/10 px-3 py-2 text-xs font-bold text-success transition-colors hover:bg-success/20"
          >
            Actual
          </Link>
          <Link
            href={`/budget/income?month=${toMonthParam(nextMonthDate)}`}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-base-300 px-3 py-2 text-xs font-bold text-base-content/60 transition-colors hover:text-base-content"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Total Hero */}
        <div className="md:col-span-7 bg-base-200 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <p className="font-(family-name:--font-body) text-base-content/60 text-xs font-bold uppercase tracking-wider">
              Total de ingresos
            </p>
            <div className="p-1.5 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <h2 className="font-(family-name:--font-headline) text-5xl md:text-6xl font-bold tracking-tighter text-base-content leading-none mb-4">
            {totalWhole}
            <span className="text-base-content/40">.{totalCents}</span>
          </h2>
          <p className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-widest">
            {insights.count} {insights.count === 1 ? "registro" : "registros"}
          </p>
        </div>

        {/* Right Column: Steady + Variable */}
        <div className="md:col-span-5 space-y-4">
          {/* Steady Income */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-(family-name:--font-body) text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Ingresos fijos
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <Briefcase className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            <p className="font-(family-name:--font-headline) text-2xl font-bold text-base-content">
              {insights.steadyCount}
            </p>
            <p className="text-[10px] text-base-content/40 uppercase tracking-widest">
              Registros estables
            </p>
          </div>

          {/* Variable Income */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-(family-name:--font-body) text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Ingresos variables
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <LineChart className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            <p className="font-(family-name:--font-headline) text-2xl font-bold text-base-content">
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
          <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight">
            Historial de ingresos
          </h2>
        </div>

        <IncomeList income={income} />
      </section>
    </div>
  );
}
