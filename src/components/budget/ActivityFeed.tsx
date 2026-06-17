"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Calendar, Wallet } from "lucide-react";
import type { Income, Expense } from "@/types/budget.types";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

interface ActivityFeedProps {
  income: Income[];
  expenses: Expense[];
}

// const incomeTypeIcons: Record<string, React.ReactNode> = {
//   steady: <Briefcase className="w-5 h-5" />,
//   variable: <LineChart className="w-5 h-5" />,
//   other: <Banknote className="w-5 h-5" />,
// };

// const categoryIcons: Record<string, React.ReactNode> = {
//   Alimentación: <Utensils className="w-5 h-5" />,
//   Despensa: <Utensils className="w-5 h-5" />,
//   Transporte: <Car className="w-5 h-5" />,
//   Vivienda: <Home className="w-5 h-5" />,
//   Entretenimiento: <Gamepad2 className="w-5 h-5" />,
//   Salud: <Heart className="w-5 h-5" />,
//   Educación: <GraduationCap className="w-5 h-5" />,
//   Tecnología: <Laptop className="w-5 h-5" />,
//   Servicios: <Zap className="w-5 h-5" />,
//   Ropa: <Shirt className="w-5 h-5" />,
//   Ahorro: <PiggyBank className="w-5 h-5" />,
// };

type TransactionItem =
  | { type: "income"; data: Income }
  | { type: "expense"; data: Expense };

export function ActivityFeed({ income, expenses }: ActivityFeedProps) {
  // Combine and sort by date descending
  const allItems: TransactionItem[] = [
    ...income.map((i) => ({ type: "income" as const, data: i })),
    ...expenses.map((e) => ({ type: "expense" as const, data: e })),
  ].sort((a, b) => {
    const dateA = new Date(
      a.type === "income" ? a.data.received_at : a.data.spent_at,
    );
    const dateB = new Date(
      b.type === "income" ? b.data.received_at : b.data.spent_at,
    );
    return dateB.getTime() - dateA.getTime();
  });

  const recentItems = allItems.slice(0, 7);

  const hasTransactions = income.length > 0 || expenses.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end px-2">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight">
          Actividad reciente
        </h2>
        {hasTransactions && (
          <Link
            href="/budget/expenses"
            className="text-primary font-[family-name:var(--font-body)] text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
          >
            Ver todos
          </Link>
        )}
      </div>

      {!hasTransactions ? (
        <div className="bg-base-200 rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 font-[family-name:var(--font-headline)]">
            Sin movimientos aún
          </h3>
          <p className="text-base-content/60 max-w-md mx-auto mb-6">
            Registra tu primer ingreso o gasto para comenzar a llevar el control
            de tus finanzas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/budget/income/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-full text-sm font-bold hover:bg-secondary/20 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Registrar ingreso
            </Link>
            <Link
              href="/budget/expenses/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              Registrar gasto
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-base-200 rounded-2xl overflow-hidden">
          {recentItems.map((item) => {
            if (item.type === "income") {
              const income = item.data;
              return (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-6 hover:bg-base-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="font-bold text-base-content">
                        {income.source}
                      </p>
                      <p className="font-[family-name:var(--font-body)] text-xs text-base-content/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ingreso • {formatDate(income.received_at)}
                      </p>
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-headline)] font-bold text-lg text-secondary">
                    +{formatCurrency(income.amount, 0)}
                  </p>
                </div>
              );
            } else {
              const expense = item.data;
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-6 hover:bg-base-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="font-bold text-base-content">
                        {expense.description}
                      </p>
                      <p className="font-[family-name:var(--font-body)] text-xs text-base-content/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {expense.category} • {formatDate(expense.spent_at)}
                      </p>
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-headline)] font-bold text-lg text-base-content">
                    -{formatCurrency(expense.amount, 0)}
                  </p>
                </div>
              );
            }
          })}
        </div>
      )}
    </section>
  );
}
