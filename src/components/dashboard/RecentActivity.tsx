import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
} from 'lucide-react';
import type { ActivityItem } from '@/types/dashboard.types';
import { formatCurrency } from '@/lib/utils/currency';

interface RecentActivityProps {
  initialData?: ActivityItem[];
}

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Hoy, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatActivityAmount(amount: number, type: ActivityItem['type']): string {
  const formatted = formatCurrency(amount, 0);
  if (type === 'income') return `+${formatted}`;
  if (type === 'expense' || type === 'payment') return `-${formatted}`;
  return formatted;
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'income':
      return <TrendingUp className="w-5 h-5 text-success" />;
    case 'expense':
      return <TrendingDown className="w-5 h-5 text-error" />;
    case 'payment':
      return <CreditCard className="w-5 h-5 text-primary" />;
    default:
      return <Calendar className="w-5 h-5 text-base-content" />;
  }
}

export function RecentActivity({ initialData = [] }: RecentActivityProps) {
  const activities = initialData;

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
        <p className="text-base-content/60">No hay actividad reciente</p>
        <p className="text-sm text-base-content/40 mt-1">
          Registra tus primeros ingresos y gastos
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Link href="/budget/income" className="btn btn-sm btn-success">
            <Plus className="w-4 h-4" />
            Agregar ingreso
          </Link>
          <Link href="/budget/expenses" className="btn btn-sm btn-error">
            <Plus className="w-4 h-4" />
            Agregar gasto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={`${activity.type}-${activity.id}`}
          className="flex items-center justify-between py-3 px-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="font-medium text-sm">{activity.description}</p>
              <p className="text-xs text-base-content/60 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatActivityDate(activity.date)}
                {activity.category &&
                  activity.category !== 'Ingreso' &&
                  activity.category !== 'Pago de recordatorio' && (
                    <span className="badge badge-ghost badge-xs ml-1">
                      {activity.category}
                    </span>
                  )}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`font-semibold ${
                activity.type === 'income' ? 'text-success' : 'text-error'
              }`}
            >
              {formatActivityAmount(activity.amount, activity.type)}
            </p>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <Link href="/budget" className="btn btn-ghost btn-sm gap-1">
          Ver historial
          <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="flex gap-2">
          <Link href="/budget/income" className="btn btn-success rounded-lg">
            <Plus className="w-4 h-4" />
            Ingreso
          </Link>
          <Link href="/budget/expenses" className="btn btn-error rounded-lg">
            <Plus className="w-4 h-4" />
            Gasto
          </Link>
        </div>
      </div>
    </div>
  );
}
