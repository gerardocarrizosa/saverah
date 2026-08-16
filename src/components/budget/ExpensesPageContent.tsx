import Link from "next/link";
import { ExpenseList } from "@/components/budget/ExpenseList";
import type { Expense } from "@/types/budget.types";
import { formatCurrency } from "@/lib/utils/currency";
import {
  TrendingDown,
  PieChart,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowLeft,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ExpenseInsights {
  total: number;
  count: number;
  topCategories: [string, number][];
  recentSpending: number;
  trend: number;
}

interface ExpensesPageContentProps {
  expenses: Expense[];
  insights: ExpenseInsights;
  selectedMonth: string;
}

export function ExpensesPageContent({
  expenses,
  insights,
  selectedMonth,
}: ExpensesPageContentProps) {
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
          <span className="font-(family-name:--font-body) text-accent uppercase tracking-[0.2em] text-[0.6875rem] font-semibold">
            Registro de movimientos
          </span>
          <h1 className="font-(family-name:--font-headline) text-4xl font-extrabold tracking-tight text-base-content">
            Gastos del mes
          </h1>
          <p className="font-(family-name:--font-body) text-base-content/60 mt-2 max-w-[80%]">
            {monthLabel}
          </p>
        </section>

        <Link
          href="/budget/expenses/new"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo gasto</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <nav className="my-4! flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Link
            href={`/budget/expenses?month=${toMonthParam(previousMonthDate)}`}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-base-300 px-3 py-2 text-xs font-bold text-base-content/60 transition-colors hover:text-base-content"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Link>
          <Link
            href={`/budget/expenses?month=${currentMonth}`}
            className="inline-flex items-center justify-center rounded-full bg-accent/10 px-3 py-2 text-xs font-bold text-accent transition-colors hover:bg-accent/20"
          >
            Actual
          </Link>
          <Link
            href={`/budget/expenses?month=${toMonthParam(nextMonthDate)}`}
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
              Total de gastos
            </p>
            <div className="p-1.5 rounded-lg bg-accent/10">
              <TrendingDown className="w-4 h-4 text-accent" />
            </div>
          </div>
          <h2 className="font-(family-name:--font-headline) text-5xl md:text-6xl font-bold tracking-tighter text-base-content leading-none mb-4">
            {totalWhole}
            <span className="text-base-content/40">.{totalCents}</span>
          </h2>
          <p className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-widest">
            {insights.count} {insights.count === 1 ? "cargo" : "cargos"}
          </p>
        </div>

        {/* Right Column: Recent + Top Category */}
        <div className="md:col-span-5 space-y-4">
          {/* Recent Trend */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-(family-name:--font-body) text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Últimos 7 días
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <Wallet className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            <p className="font-(family-name:--font-headline) text-2xl font-bold text-base-content">
              {formatCurrency(insights.recentSpending, 0)}
            </p>
            {insights.trend !== 0 && (
              <p
                className={`text-xs flex items-center gap-1 font-(family-name:--font-body) ${
                  insights.trend > 0 ? "text-accent" : "text-secondary"
                }`}
              >
                {insights.trend > 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(insights.trend).toFixed(0)}% vs. semana anterior
              </p>
            )}
          </div>

          {/* Top Category */}
          <div className="bg-base-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-(family-name:--font-body) text-base-content/60 text-xs font-bold uppercase tracking-wider">
                Categoría principal
              </p>
              <div className="p-1.5 rounded-lg bg-base-300">
                <PieChart className="w-4 h-4 text-base-content/70" />
              </div>
            </div>
            {insights.topCategories.length > 0 ? (
              <>
                <p className="font-(family-name:--font-headline) text-2xl font-bold text-base-content">
                  {formatCurrency(insights.topCategories[0][1], 0)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                    {insights.topCategories[0][0]}
                  </span>
                  <span className="text-[10px] text-base-content/40">
                    {(
                      (insights.topCategories[0][1] / insights.total) *
                      100
                    ).toFixed(0)}
                    % del total
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-base-content/50">
                Sin gastos registrados
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      {insights.topCategories.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight px-2">
            Distribución por categoría
          </h2>
          <div className="bg-base-200 rounded-xl p-6 md:p-8 space-y-6">
            {insights.topCategories.map(([category, amount]) => {
              const percentage =
                insights.total > 0 ? (amount / insights.total) * 100 : 0;
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                      {category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-(family-name:--font-headline) font-bold text-sm text-base-content">
                        {formatCurrency(amount, 0)}
                      </span>
                      <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-base-300 rounded-xl overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-xl transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Expense List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight">
            Historial de gastos
          </h2>
        </div>

        <ExpenseList expenses={expenses} />
      </section>
    </div>
  );
}
