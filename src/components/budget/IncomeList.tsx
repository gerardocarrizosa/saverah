'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { Income } from '@/types/budget.types';
import { Calendar, Wallet, Pencil, Trash2 } from 'lucide-react';

interface IncomeListProps {
  income: Income[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
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

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'steady':
      return 'badge-success';
    case 'variable':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
}

function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    steady: 'Fijo',
    variable: 'Variable',
    other: 'Otro',
  };
  return typeMap[type] || type;
}

export function IncomeList({ income, onDelete, deletingId }: IncomeListProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (confirmingId === id) {
      onDelete(id);
      setConfirmingId(null);
    } else {
      setConfirmingId(id);
      setTimeout(() => setConfirmingId(null), 3000);
    }
  };

  if (income.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-base-200 mb-4">
          <Wallet className="w-7 h-7 text-base-content/40" />
        </div>
        <h3 className="text-lg font-medium text-base-content mb-2">
          No hay ingresos registrados
        </h3>
        <p className="text-sm text-base-content/60">
          Agrega tu primer ingreso para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {income.map((item) => (
        <div
          key={item.id}
          className="card bg-base-100 border border-base-300 shadow-sm rounded-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{item.source}</h3>
                  <span
                    className={`badge ${getTypeBadgeColor(item.type)} badge-sm rounded`}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-base-content/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.received_at)}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-sm text-base-content/60 mt-2 line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-success">
                  +{formatCurrency(item.amount)}
                </span>
              </div>
            </div>

            <div className="divider my-3"></div>

            <div className="flex gap-2">
              <Link
                href={`/budget/income/${item.id}/edit`}
                className="btn btn-sm btn-ghost flex-1 gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={() => handleDeleteClick(item.id)}
                className={`btn btn-sm flex-1 gap-2 ${
                  confirmingId === item.id
                    ? 'btn-error'
                    : 'btn-ghost text-error hover:bg-error/10'
                }`}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {confirmingId === item.id ? 'Confirmar' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
