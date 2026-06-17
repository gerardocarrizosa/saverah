'use client';

import Link from 'next/link';
import type { ActivityItem } from '@/types/dashboard.types';
import { formatCurrency } from '@/lib/utils/currency';

interface WealthStreamProps {
  activities: ActivityItem[];
}

function formatActivityTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getActivityStatusLabel(type: ActivityItem['type']): string {
  switch (type) {
    case 'income':
      return 'Completado';
    case 'expense':
      return 'Registrado';
    case 'payment':
      return 'Pagado';
    default:
      return '';
  }
}

function getActivityColor(type: ActivityItem['type']): string {
  switch (type) {
    case 'income':
      return 'text-secondary';
    case 'expense':
      return 'text-base-content';
    case 'payment':
      return 'text-primary';
    default:
      return 'text-base-content';
  }
}

function getActivityAmountPrefix(type: ActivityItem['type']): string {
  switch (type) {
    case 'income':
      return '+';
    case 'expense':
    case 'payment':
      return '-';
    default:
      return '';
  }
}

export function WealthStream({ activities }: WealthStreamProps) {
  return (
    <section className="mt-16 pb-12">
      <div className="flex items-end justify-between mb-8 px-2">
        <div>
          <h2 className="font-[family-name:var(--font-headline)] text-2xl text-base-content">
            Flujo de actividad
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm text-base-content/60">
            Actualizaciones recientes
          </p>
        </div>
        <Link
          href="/budget/expenses"
          className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-widest text-primary border-b border-primary pb-1 hover:opacity-80 transition-opacity"
        >
          Ver historial completo
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-base-200 rounded-xl p-12 text-center">
            <p className="font-[family-name:var(--font-body)] text-sm text-base-content/60">
              No hay actividad reciente. Registra tu primer ingreso o gasto.
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const colorClass = getActivityColor(activity.type);
            const prefix = getActivityAmountPrefix(activity.type);
            const statusLabel = getActivityStatusLabel(activity.type);
            const isIncome = activity.type === 'income';

            return (
              <div
                key={`${activity.type}-${activity.id}`}
                className="bg-base-200 rounded-xl p-6 flex items-center justify-between hover:bg-base-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <p className="font-[family-name:var(--font-body)] text-[10px] text-base-content/60 w-16 shrink-0">
                    {formatActivityTime(activity.date)}
                  </p>
                  <div>
                    <p className="font-[family-name:var(--font-body)] text-sm font-semibold text-base-content">
                      {activity.description}
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-[10px] text-base-content/60 uppercase tracking-wider">
                      {activity.category || 'General'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-[family-name:var(--font-headline)] text-sm text-base-content">
                    <span className={colorClass}>
                      {prefix}
                      {formatCurrency(activity.amount, 0)}
                    </span>
                  </p>
                  <p
                    className={`font-[family-name:var(--font-body)] text-[10px] ${isIncome ? 'text-secondary' : 'text-base-content/60'}`}
                  >
                    {statusLabel}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
