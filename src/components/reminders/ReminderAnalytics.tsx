'use client';

import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { ReminderAnalytics } from '@/types/reminder.types';

interface ReminderAnalyticsProps {
  analytics: ReminderAnalytics;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Nunca';
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ReminderAnalytics({ analytics }: ReminderAnalyticsProps) {
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-success/10 rounded-2xl p-4">
          <div className="stat-figure text-success">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs text-success">Total pagado</div>
          <div className="stat-value text-2xl text-success">
            {formatCurrency(analytics.total_paid)}
          </div>
          <div className="stat-desc text-xs">Histórico</div>
        </div>

        <div className="stat bg-info/10 rounded-2xl p-4">
          <div className="stat-figure text-info">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs text-info">Promedio</div>
          <div className="stat-value text-2xl text-info">
            {formatCurrency(analytics.average_payment)}
          </div>
          <div className="stat-desc text-xs">Por pago</div>
        </div>

        <div className="stat bg-primary/10 rounded-2xl p-4">
          <div className="stat-figure text-primary">
            <Receipt className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs text-primary">Total pagos</div>
          <div className="stat-value text-2xl text-primary">
            {analytics.payment_count}
          </div>
          <div className="stat-desc text-xs">Registros</div>
        </div>
      </div>

      {/* Last Payment */}
      {analytics.last_paid_at && (
        <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-xl">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-base-content/60">Último pago</p>
            <p className="font-medium">{formatDate(analytics.last_paid_at)}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics.payment_count === 0 && (
        <div className="alert alert-info">
          <Sparkles className="w-5 h-5" />
          <span>Aún no hay pagos registrados. ¡Comienza registrando tu primer pago!</span>
        </div>
      )}
    </div>
  );
}
