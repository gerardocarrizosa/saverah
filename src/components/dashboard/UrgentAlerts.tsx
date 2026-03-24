'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Clock,
  Calendar,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import type { Reminder } from '@/types/reminder.types';
import { getDaysUntilDue } from '@/lib/utils/dates';
import { categoryEmojis } from '@/config/constants';

interface ReminderWithStatus extends Reminder {
  isPaidForCurrentCycle?: boolean;
}

interface UrgentAlertsProps {
  reminders: ReminderWithStatus[];
  isLoading?: boolean;
}

export function UrgentAlerts({ reminders, isLoading }: UrgentAlertsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center p-3 bg-base-200 rounded-lg animate-pulse"
          >
            <div className="h-12 bg-base-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Filter and sort urgent reminders (excluding already paid)
  const urgentReminders = reminders
    .filter((r) => r.is_active && !r.isPaidForCurrentCycle)
    .map((r) => ({
      ...r,
      daysUntilDue: getDaysUntilDue(r.due_day, r.recurrence),
    }))
    .filter((r) => r.daysUntilDue <= 3)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  if (urgentReminders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-base-content/60">No hay pagos urgentes</p>
        <p className="text-sm text-base-content/40 mt-1">
          Todos tus recordatorios están al día
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {urgentReminders.map((reminder) => {
        const isOverdue = reminder.daysUntilDue < 0;
        const isToday = reminder.daysUntilDue === 0;
        const isTomorrow = reminder.daysUntilDue === 1;
        const isSoon =
          reminder.daysUntilDue === 2 || reminder.daysUntilDue === 3;

        let urgencyClass = '';
        let badgeClass = '';
        let badgeText = '';
        let icon = <Clock className="w-4 h-4" />;

        if (isOverdue) {
          urgencyClass = 'border-l-4 border-error bg-error/5';
          badgeClass = 'badge-error';
          badgeText = `Vencido hace ${Math.abs(reminder.daysUntilDue)} días`;
          icon = <AlertCircle className="w-4 h-4" />;
        } else if (isToday) {
          urgencyClass = 'border-l-4 border-error bg-error/10';
          badgeClass = 'badge-error';
          badgeText = '¡Vence hoy!';
          icon = <AlertCircle className="w-4 h-4" />;
        } else if (isTomorrow) {
          urgencyClass = 'border-l-4 border-warning bg-warning/5';
          badgeClass = 'badge-warning';
          badgeText = 'Vence mañana';
          icon = <Clock className="w-4 h-4" />;
        } else if (isSoon) {
          urgencyClass = 'border-l-4 border-warning bg-warning/5';
          badgeClass = 'badge-warning';
          badgeText = `En ${reminder.daysUntilDue} días`;
          icon = <Calendar className="w-4 h-4" />;
        }

        return (
          <div
            key={reminder.id}
            className={`flex items-center justify-between p-3 bg-base-200 rounded-lg ${urgencyClass} hover:bg-base-300/50 transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {categoryEmojis[reminder.category] || '📦'}
              </div>
              <div>
                <p className="font-medium text-base-content">{reminder.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${badgeClass} badge-sm gap-1`}>
                    {icon}
                    {badgeText}
                  </span>
                  <span className="badge badge-ghost badge-sm">
                    Día {reminder.due_day}
                  </span>
                </div>
                {reminder.cutoff_day && (
                  <p className="text-xs text-base-content/50 mt-1">
                    ✂️ Corte: día {reminder.cutoff_day}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/reminders/${reminder.id}`}
                className="btn btn-sm btn-ghost"
              >
                Ver
              </Link>
              {reminder.category === 'Tarjeta de Crédito' && (
                <Link
                  href={`/reminders/${reminder.id}`}
                  className="btn btn-sm btn-primary gap-1"
                >
                  <CreditCard className="w-4 h-4" />
                  Pagar
                </Link>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex justify-center mt-4">
        <Link href="/reminders" className="btn btn-ghost btn-sm gap-1">
          Ver todos los recordatorios
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
