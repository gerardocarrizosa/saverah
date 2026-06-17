"use client";

import { useState } from "react";
import Link from "next/link";
import type { Expense } from "@/types/budget.types";
import { Calendar, Tag, Receipt, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  deletingId: string | null;
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

export function ExpenseList({
  expenses,
  onDelete,
  deletingId,
}: ExpenseListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(
        () => setConfirmDelete((current) => (current === id ? null : current)),
        3000,
      );
    }
  };

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

  return (
    <div className="bg-base-200 rounded-2xl overflow-hidden">
      {expenses.map((expense) => {
        const isConfirming = confirmDelete === expense.id;
        const isDeleting = deletingId === expense.id;

        return (
          <div
            key={expense.id}
            className="group flex items-center justify-between p-4 hover:bg-base-300 transition-colors border-b border-base-content/5 last:border-b-0"
          >
            <Link
              href={`/budget/expenses/${expense.id}/edit`}
              className="flex items-center gap-5 flex-1 min-w-0"
            >
              <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center border border-base-content/10 shrink-0">
                <Tag className="w-5 h-5 text-base-content/60" />
              </div>
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
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.spent_at)}
                  </span>
                  {expense.notes && (
                    <span className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-wider truncate max-w-50">
                      {expense.notes}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4 shrink-0 ml-4">
              <span className="font-(family-name:--font-headline) font-bold text-lg text-base-content">
                -{formatCurrency(expense.amount, 0)}
              </span>

              <button
                onClick={(e) => handleDeleteClick(e, expense.id)}
                disabled={isDeleting}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isConfirming
                    ? "bg-error/10 text-error opacity-100"
                    : "bg-base-300 text-base-content/60 opacity-100 sm:opacity-0 group-hover:sm:opacity-100"
                }`}
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isConfirming ? "Confirmar" : ""}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
