'use client';

import { Calendar, Scissors, CheckCircle2 } from 'lucide-react';
import type { ReminderAnalytics } from '@/types/reminder.types';
// import { categoryEmojis, RECURRENCE_TYPES } from '@/config/constants';

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

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NextDueInfo({
  // name,
  category,
  // recurrence,
  dueDay,
  cutoffDay,
  analytics,
}: NextDueInfoProps) {
  const isCreditCard = category === CREDIT_CARD_CATEGORY;
  // const recurrenceLabel =
  //   RECURRENCE_TYPES.find((r) => r.value === recurrence)?.label || recurrence;

  // If paid for current cycle, show subtle paid state
  if (analytics.is_paid_for_current_cycle) {
    return (
      <div className="bg-base-100">
        <div>
          {/* Subtle paid status info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-base-300 text-base-content/60">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-base-content/70">
                    Al día para este período
                  </p>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Último pago: {formatDate(analytics.last_paid_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-base-200/50 border border-base-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-base-300 text-base-content/60">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-base-content/70">
                    Próximo período: día {dueDay}
                  </p>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Próximo pago disponible próximamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For credit cards with cutoff day
  if (isCreditCard && cutoffDay) {
    const daysUntilCutoff = getDaysUntilCutoffFromToday(cutoffDay);
    const daysToPayFromCutoff = getDaysToPayFromCutoff(cutoffDay, dueDay);
    const daysUntilDueFromToday = getDaysUntilDueFromToday(dueDay);

    // Determine urgency based on the most urgent metric
    // const mostUrgentDays = Math.min(
    //   daysUntilCutoff >= 0 ? daysUntilCutoff : Infinity,
    //   daysUntilDueFromToday >= 0 ? daysUntilDueFromToday : Infinity,
    // );
    // const urgency = getUrgencyColor(
    //   mostUrgentDays === Infinity ? -1 : mostUrgentDays,
    // );

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
      <div className="card">
        <div className="card-body p-0">
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
    <div>
      <div>
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
                <p className={`text-xl font-bold ${urgency.textColor}`}>
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
