'use client';

import { Calendar, Scissors, AlertCircle } from 'lucide-react';
import type { ReminderAnalytics } from '@/types/reminder.types';
import { categoryEmojis, RECURRENCE_TYPES } from '@/config/constants';

interface NextDueInfoProps {
  name: string;
  category: string;
  recurrence: string;
  dueDay: number;
  cutoffDay?: number | null;
  analytics: ReminderAnalytics;
}

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';

// Calculate days between today and cutoff date
function getDaysUntilCutoffFromToday(cutoffDay: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextCutoffDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    cutoffDay,
  );
  if (nextCutoffDate < today) {
    nextCutoffDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      cutoffDay,
    );
  }

  const diffTime = nextCutoffDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate days from cutoff to due date (the interest-free payment window)
function getDaysToPayFromCutoff(cutoffDay: number, dueDay: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the next occurrence of cutoff
  let cutoffDate = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
  if (cutoffDate < today) {
    cutoffDate = new Date(today.getFullYear(), today.getMonth() + 1, cutoffDay);
  }

  // Get the next occurrence of due date after cutoff
  let dueDate = new Date(
    cutoffDate.getFullYear(),
    cutoffDate.getMonth(),
    dueDay,
  );
  if (dueDate < cutoffDate) {
    dueDate = new Date(
      cutoffDate.getFullYear(),
      cutoffDate.getMonth() + 1,
      dueDay,
    );
  }

  const diffTime = dueDate.getTime() - cutoffDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate days from today to due date
function getDaysUntilDueFromToday(dueDay: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (nextDueDate < today) {
    nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  const diffTime = nextDueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getUrgencyColor(days: number): {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  if (days < 0) {
    return {
      color: 'neutral',
      bgColor: 'bg-neutral/10',
      textColor: 'text-neutral',
      borderColor: 'border-neutral',
    };
  }
  if (days === 0) {
    return {
      color: 'error',
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error',
    };
  }
  if (days === 1) {
    return {
      color: 'error',
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error',
    };
  }
  if (days <= 3) {
    return {
      color: 'warning',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning',
    };
  }
  return {
    color: 'success',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    borderColor: 'border-success',
  };
}

function getCountdownText(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return '¡Hoy!';
  if (days === 1) return '¡Mañana!';
  return `En ${days} días`;
}

export function NextDueInfo({
  name,
  category,
  recurrence,
  dueDay,
  cutoffDay,
  analytics,
}: NextDueInfoProps) {
  const isCreditCard = category === CREDIT_CARD_CATEGORY;
  const recurrenceLabel =
    RECURRENCE_TYPES.find((r) => r.value === recurrence)?.label || recurrence;

  // For credit cards with cutoff day
  if (isCreditCard && cutoffDay) {
    const daysUntilCutoff = getDaysUntilCutoffFromToday(cutoffDay);
    const daysToPayFromCutoff = getDaysToPayFromCutoff(cutoffDay, dueDay);
    const daysUntilDueFromToday = getDaysUntilDueFromToday(dueDay);

    // Determine urgency based on the most urgent metric
    const mostUrgentDays = Math.min(
      daysUntilCutoff >= 0 ? daysUntilCutoff : Infinity,
      daysUntilDueFromToday >= 0 ? daysUntilDueFromToday : Infinity,
    );
    const urgency = getUrgencyColor(
      mostUrgentDays === Infinity ? -1 : mostUrgentDays,
    );

    // Cutoff colors
    const cutoffUrgency = getUrgencyColor(daysUntilCutoff);
    // Payment window colors (always show as info/primary since it's the interest-free period)
    const payWindowUrgency =
      daysUntilDueFromToday < 0
        ? getUrgencyColor(-1) // Overdue
        : {
            color: 'primary',
            bgColor: 'bg-primary/10',
            textColor: 'text-primary',
            borderColor: 'border-primary',
          };

    return (
      <div
        className={`card border-2 ${urgency.borderColor} ${urgency.bgColor}`}
      >
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl bg-base-100 ${urgency.textColor}`}
              >
                <span className="text-3xl">
                  {categoryEmojis[category] || '📦'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`badge badge-${urgency.color} badge-sm gap-1`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {daysUntilDueFromToday < 0
                      ? 'VENCIDO'
                      : daysUntilDueFromToday <= 3
                        ? 'URGENTE'
                        : 'A TIEMPO'}
                  </span>
                  <span className="badge badge-ghost badge-sm">
                    Día {dueDay} • {recurrenceLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Credit Card Specific Display - Two Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days until Cutoff */}
            <div
              className={`p-4 rounded-xl bg-base-100 border ${cutoffUrgency.borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${cutoffUrgency.bgColor} ${cutoffUrgency.textColor}`}
                >
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${cutoffUrgency.textColor}`}
                  >
                    {getCountdownText(daysUntilCutoff)}
                  </p>
                  <p className="text-sm text-base-content/60">
                    {daysUntilCutoff >= 0 ? 'Días para corte' : 'Corte pasado'}
                  </p>
                  {cutoffDay && (
                    <p className="text-xs text-base-content/40 mt-1">
                      Cierra el día {cutoffDay}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Days to Pay (from cutoff or from today if cutoff passed) */}
            <div
              className={`p-4 rounded-xl bg-base-100 border ${payWindowUrgency.borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${payWindowUrgency.bgColor} ${payWindowUrgency.textColor}`}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${payWindowUrgency.textColor}`}
                  >
                    {daysUntilCutoff >= 0
                      ? `${daysToPayFromCutoff} días`
                      : getCountdownText(daysUntilDueFromToday)}
                  </p>
                  <p className="text-sm text-base-content/60">
                    {daysUntilCutoff >= 0
                      ? 'Días para pagar (sin intereses)'
                      : daysUntilDueFromToday >= 0
                        ? 'Días para pagar'
                        : 'Pago vencido'}
                  </p>
                  {dueDay && (
                    <p className="text-xs text-base-content/40 mt-1">
                      Vence el día {dueDay}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation for credit cards */}
          <div className="alert alert-sm bg-base-200 mt-4">
            <div className="flex-1">
              <p className="text-sm">
                <strong>💡 Ciclo de tu tarjeta:</strong> El corte cierra el día{' '}
                {cutoffDay} y tienes {daysToPayFromCutoff} días para pagar sin
                intereses (hasta el día {dueDay}).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For non-credit cards, use the original display
  const urgency = getUrgencyColor(analytics.days_until_due);

  return (
    <div className={`card border-2 ${urgency.borderColor} ${urgency.bgColor}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-base-100 ${urgency.textColor}`}>
              <span className="text-3xl">
                {categoryEmojis[category] || '📦'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge badge-${urgency.color} badge-sm gap-1`}>
                  <AlertCircle className="w-3 h-3" />
                  {analytics.days_until_due < 0
                    ? 'VENCIDO'
                    : analytics.days_until_due <= 3
                      ? 'URGENTE'
                      : 'A TIEMPO'}
                </span>
                <span className="badge badge-ghost badge-sm">
                  Día {dueDay} • {recurrenceLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="divider"></div>

        <div className="grid grid-cols-1 gap-4">
          {/* Due Date */}
          <div
            className={`p-4 rounded-xl bg-base-100 border ${urgency.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${urgency.bgColor} ${urgency.textColor}`}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-3xl font-bold ${urgency.textColor}`}>
                  {getCountdownText(analytics.days_until_due)}
                </p>
                <p className="text-sm text-base-content/60">
                  Próximo vencimiento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
