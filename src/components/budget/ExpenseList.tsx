'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { Expense } from '@/types/budget.types';
import {
  Calendar,
  Tag,
  Receipt,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    Vivienda: 'badge-primary',
    Alimentación: 'badge-secondary',
    Transporte: 'badge-accent',
    Servicios: 'badge-info',
    Salud: 'badge-success',
    Educación: 'badge-warning',
    Entretenimiento: 'badge-error',
    Ropa: 'badge-neutral',
    Tecnología: 'badge-primary',
    Ahorro: 'badge-success',
    Otros: 'badge-ghost',
  };
  return colors[category] || 'badge-ghost';
}

export function ExpenseList({
  expenses,
  onDelete,
  deletingId,
}: ExpenseListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-base-200 mb-4">
          <Receipt className="w-7 h-7 text-base-content/40" />
        </div>
        <h3 className="text-lg font-medium text-base-content mb-2">
          No hay gastos registrados
        </h3>
        <p className="text-sm text-base-content/60">
          Agrega tu primer gasto para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="card bg-base-100 border border-base-300 shadow-sm rounded-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-base-content">
                    {expense.description}
                  </h3>
                  <span
                    className={`badge ${getCategoryBadgeColor(expense.category)} badge-sm rounded`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {expense.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-base-content/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.spent_at)}
                  </span>
                </div>

                {expense.notes && (
                  <p className="text-sm text-base-content/50 mt-2 line-clamp-2">
                    {expense.notes}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-error">
                  -{formatCurrency(expense.amount)}
                </span>
              </div>
            </div>

            <div className="divider my-3"></div>

            <div className="flex gap-2">
              <Link
                href={`/budget/expenses/${expense.id}/edit`}
                className="btn btn-sm btn-ghost flex-1 gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={() => handleDeleteClick(expense.id)}
                disabled={deletingId === expense.id}
                className={`btn btn-sm flex-1 gap-2 ${
                  confirmDelete === expense.id
                    ? 'btn-error'
                    : 'btn-ghost text-error hover:bg-error/10'
                }`}
              >
                {deletingId === expense.id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {confirmDelete === expense.id ? 'Confirmar' : 'Eliminar'}
              </button>
            </div>

            {confirmDelete === expense.id && (
              <div className="alert alert-warning alert-sm mt-3">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Haz clic nuevamente para confirmar la eliminación
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
