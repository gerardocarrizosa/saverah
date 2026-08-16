"use client";

import Link from "next/link";
import { useState } from "react";
import type { Expense } from "@/types/budget.types";
import { Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";
import {
  getInstallmentLabel,
  isInstallmentExpense,
} from "@/lib/utils/installments";
import { DeleteExpenseButton } from "@/components/budget/DeleteExpenseButton";

interface ExpenseListProps {
  expenses: Expense[];
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Vivienda: "text-primary",
    Alimentación: "text-secondary",
    Transporte: "text-accent",
    Servicios: "text-primary",
    Salud: "text-success",
    Educación: "text-warning",
    Entretenimiento: "text-error",
    Ropa: "text-base-content",
    Tecnología: "text-primary",
    Ahorro: "text-success",
    Otros: "text-base-content/60",
  };
  return colors[category] || "text-base-content/60";
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  if (expenses.length === 0) {
    return (
      <div className="bg-base-200 rounded-2xl p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-accent/10 via-primary/10 to-error/10">
            <Receipt className="w-12 h-12 text-accent" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 font-[family-name:var(--font-headline)]">
          No hay gastos registrados
        </h2>
        <p className="text-base-content/60 max-w-lg mx-auto mb-8">
          Agrega tu primer gasto para comenzar a monitorear tus movimientos por
          categoría.
        </p>
        <Link
          href="/budget/expenses/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
        >
          <Receipt className="w-5 h-5" />
          Registrar primer gasto
        </Link>
      </div>
    );
  }

  const categories = Array.from(
    new Set(expenses.map((expense) => expense.category)),
  ).sort((a, b) => a.localeCompare(b, "es"));
  const minAmountValue = Number(minAmount);
  const maxAmountValue = Number(maxAmount);
  const hasMinAmount =
    minAmount.trim() !== "" && Number.isFinite(minAmountValue);
  const hasMaxAmount =
    maxAmount.trim() !== "" && Number.isFinite(maxAmountValue);
  const hasActiveFilters = selectedCategory || hasMinAmount || hasMaxAmount;
  const filteredExpenses = expenses.filter((expense) => {
    if (selectedCategory && expense.category !== selectedCategory) {
      return false;
    }

    if (hasMinAmount && expense.amount < minAmountValue) {
      return false;
    }

    if (hasMaxAmount && expense.amount > maxAmountValue) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedCategory("");
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/40">
          Filtrar
        </span>
        <label>
          <span className="sr-only">Categoría</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-9 rounded-full border-none bg-base-200 px-3 text-xs font-semibold text-base-content/70 outline-none transition-all focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Categoría</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Monto mínimo</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            placeholder="Mín."
            className="h-9 w-24 rounded-full border-none bg-base-200 px-3 text-xs font-semibold text-base-content/70 outline-none transition-all placeholder:text-base-content/35 focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label>
          <span className="sr-only">Monto máximo</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            placeholder="Máx."
            className="h-9 w-24 rounded-full border-none bg-base-200 px-3 text-xs font-semibold text-base-content/70 outline-none transition-all placeholder:text-base-content/35 focus:ring-2 focus:ring-accent/20"
          />
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 rounded-full px-3 text-xs font-bold text-accent transition-colors hover:bg-accent/10"
          >
            Limpiar
          </button>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="rounded-2xl bg-base-200 p-8 text-center">
          <h3 className="font-(family-name:--font-headline) text-xl font-bold text-base-content">
            No hay gastos con estos filtros
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-base-content/60">
            Ajusta la categoría o el rango de monto para ver otros movimientos.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-full bg-accent/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent/20"
          >
            Ver todos los gastos
          </button>
        </div>
      ) : (
        <div className="bg-base-200 rounded-2xl overflow-hidden">
          {filteredExpenses.map((expense) => {
            const installmentExpense = isInstallmentExpense(expense);
            const installmentLabel = getInstallmentLabel(expense);
            const deleteScope = installmentExpense ? "series" : "single";

            return (
              <div
                key={expense.id}
                className="group flex items-center justify-between p-4 hover:bg-base-300 transition-colors border-b border-base-content/5 last:border-b-0"
              >
                <Link
                  href={`/budget/expenses/${expense.id}/edit`}
                  className="flex items-center gap-5 flex-1 min-w-0"
                >
                  <div className="min-w-0">
                    <h4 className="font-(family-name:--font-headline) font-bold text-base-content truncate">
                      {expense.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span
                        className={`font-(family-name:--font-body) text-[10px] uppercase tracking-widest font-bold ${getCategoryColor(expense.category)}`}
                      >
                        {expense.category}
                      </span>
                      <span className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-wider flex items-center gap-1">
                        {formatDate(expense.spent_at, { includeYear: false })}
                      </span>
                      {expense.notes && (
                        <span className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-wider truncate max-w-50">
                          {expense.notes}
                        </span>
                      )}
                      {installmentLabel && (
                        <span className="rounded-full bg-accent/10 px-2 py-1 font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-wider text-accent">
                          {installmentLabel}
                        </span>
                      )}
                    </div>
                    {installmentLabel && (
                      <p className="mt-2 text-xs text-base-content/50">
                        Compra total:{" "}
                        {formatCurrency(
                          expense.installment_total_amount ?? 0,
                          2,
                        )}{" "}
                        · Cargo del mes: {formatCurrency(expense.amount, 2)}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="font-(family-name:--font-headline) text-base-content">
                    -{formatCurrency(expense.amount)}
                  </span>

                  <DeleteExpenseButton
                    expenseId={expense.id}
                    scope={deleteScope}
                    className="inline-flex items-center gap-1.5 p-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
