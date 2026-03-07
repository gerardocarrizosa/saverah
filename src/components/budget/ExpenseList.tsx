'use client';

import { useState } from 'react';
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
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
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
    'Vivienda': 'badge-primary',
    'Alimentación': 'badge-secondary',
    'Transporte': 'badge-accent',
    'Servicios': 'badge-info',
    'Salud': 'badge-success',
    'Educación': 'badge-warning',
    'Entretenimiento': 'badge-error',
    'Ropa': 'badge-neutral',
    'Tecnología': 'badge-primary',
    'Ahorro': 'badge-success',
    'Otros': 'badge-neutral',
  };
  return colors[category] || 'badge-neutral';
}

export function ExpenseList({ expenses, onEdit, onDelete, deletingId }: ExpenseListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => setConfirmDelete((current) => current === id ? null : current), 3000);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <Receipt className="w-12 h-12 mx-auto mb-4 text-base-content/50" />
        <p className="text-base-content/70">
          No hay gastos registrados aún
        </p>
        <p className="text-sm text-base-content/50 mt-1">
          Agrega tu primer gasto usando el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="card bg-base-100 shadow-sm border border-base-300"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-base">
                    {expense.description}
                  </h3>
                  <span className={`badge ${getCategoryBadgeColor(expense.category)} badge-sm`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {expense.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-base-content/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.spent_at)}
                  </span>
                </div>

                {expense.notes && (
                  <p className="text-sm text-base-content/60 mt-2 line-clamp-2">
                    {expense.notes}
                  </p>
                )}
              </div>

              <div className="text-right ml-4">
                <span className="text-lg font-bold text-error">
                  -{formatCurrency(expense.amount)}
                </span>
              </div>
            </div>

            <div className="divider my-3"></div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(expense)}
                className="btn btn-sm btn-ghost flex-1"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDeleteClick(expense.id)}
                disabled={deletingId === expense.id}
                className={`btn btn-sm flex-1 ${
                  confirmDelete === expense.id
                    ? 'btn-error'
                    : 'btn-ghost btn-error text-error'
                }`}
              >
                {deletingId === expense.id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {confirmDelete === expense.id ? 'Confirmar' : 'Eliminar'}
              </button>
            </div>

            {confirmDelete === expense.id && (
              <div className="alert alert-warning alert-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Haz clic nuevamente para confirmar la eliminación</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
