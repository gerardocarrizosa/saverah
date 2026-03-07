'use client';

import { DEFAULT_CURRENCY } from '@/config/constants';
import type { Income } from '@/types/budget.types';
import {
  Calendar,
  Wallet,
} from 'lucide-react';

interface IncomeListProps {
  income: Income[];
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

export function IncomeList({ income }: IncomeListProps) {
  if (income.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-base-content/50" />
        <p className="text-base-content/70">
          No hay ingresos registrados aún
        </p>
        <p className="text-sm text-base-content/50 mt-1">
          Agrega tu primer ingreso usando el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {income.map((item) => (
        <div
          key={item.id}
          className="card bg-base-100 shadow-sm border border-base-300"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">
                    {item.source}
                  </h3>
                  <span className={`badge ${getTypeBadgeColor(item.type)} badge-sm`}>
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
          </div>
        </div>
      ))}
    </div>
  );
}
