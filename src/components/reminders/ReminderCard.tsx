'use client';

import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Tv,
  Home,
  Landmark,
  Shield,
  FileText,
  Package,
  Scissors,
  Calendar,
  Repeat,
  AlertCircle,
  Clock,
  CheckCircle2,
  PauseCircle,
} from 'lucide-react';
import type { Reminder } from '@/types/reminder.types';
import { RECURRENCE_TYPES } from '@/config/constants';

interface ReminderCardProps {
  reminder: Reminder & { daysUntilDue: number; isOverdue: boolean };
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Tarjeta de Crédito': <CreditCard className="w-4 h-4" />,
  Servicios: <Zap className="w-4 h-4" />,
  Suscripción: <Tv className="w-4 h-4" />,
  Alquiler: <Home className="w-4 h-4" />,
  Préstamo: <Landmark className="w-4 h-4" />,
  Seguro: <Shield className="w-4 h-4" />,
  Impuestos: <FileText className="w-4 h-4" />,
  Otros: <Package className="w-4 h-4" />,
};

function getUrgencyLevel(
  daysUntilDue: number,
  isOverdue: boolean,
): 'urgent' | 'soon' | 'future' | 'overdue' | 'inactive' {
  if (!isOverdue && daysUntilDue > 0) return 'inactive';
  if (isOverdue || daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'urgent';
  if (daysUntilDue <= 7) return 'soon';
  return 'future';
}

function getCountdownText(daysUntilDue: number, isOverdue: boolean): string {
  if (isOverdue || daysUntilDue < 0)
    return `Vencido hace ${Math.abs(daysUntilDue)} días`;
  if (daysUntilDue === 0) return 'Vence hoy';
  if (daysUntilDue === 1) return 'Vence mañana';
  return `En ${daysUntilDue} días`;
}

function getCountdownIcon(urgency: string) {
  switch (urgency) {
    case 'urgent':
    case 'overdue':
      return AlertCircle;
    case 'soon':
      return Clock;
    case 'inactive':
      return PauseCircle;
    default:
      return CheckCircle2;
  }
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const urgency = getUrgencyLevel(reminder.daysUntilDue, reminder.isOverdue);
  const countdownText = getCountdownText(
    reminder.daysUntilDue,
    reminder.isOverdue,
  );
  const CountdownIcon = getCountdownIcon(urgency);

  const urgencyStyles = {
    urgent: {
      border: 'border-error/40',
      bg: 'bg-error/5',
      countdown: 'text-error',
      icon: 'text-error',
    },
    soon: {
      border: 'border-warning/40',
      bg: 'bg-warning/5',
      countdown: 'text-warning',
      icon: 'text-warning',
    },
    future: {
      border: 'border-base-300',
      bg: 'bg-base-100',
      countdown: 'text-success',
      icon: 'text-success',
    },
    overdue: {
      border: 'border-neutral/40',
      bg: 'bg-neutral/5',
      countdown: 'text-neutral',
      icon: 'text-neutral',
    },
    inactive: {
      border: 'border-base-300',
      bg: 'bg-base-200/50',
      countdown: 'text-base-content/50',
      icon: 'text-base-content/50',
    },
  };

  const style = urgencyStyles[urgency];
  const recurrenceLabel =
    RECURRENCE_TYPES.find((r) => r.value === reminder.recurrence)?.label ||
    reminder.recurrence;

  return (
    <Link
      href={`/reminders/${reminder.id}`}
      className={`block card border rounded-lg ${style.border} ${style.bg} hover:shadow-md transition-all duration-200`}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {reminder.name}
                </h3>

                {/* Category & Recurrence Row */}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="badge badge-ghost badge-sm gap-1">
                    {categoryIcons[reminder.category] || (
                      <Package className="w-3 h-3" />
                    )}
                    {reminder.category}
                  </span>
                  <span className="text-xs text-base-content/50 flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    {recurrenceLabel}
                  </span>
                </div>

                {/* Credit Card Cutoff Info */}
                {reminder.cutoff_day &&
                  reminder.category === 'Tarjeta de Crédito' && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                      <Scissors className="w-3 h-3" />
                      <span>Corte: día {reminder.cutoff_day}</span>
                    </div>
                  )}

                {/* Notes */}
                {reminder.notes && (
                  <p className="text-xs text-base-content/60 mt-2 line-clamp-1">
                    {reminder.notes}
                  </p>
                )}
              </div>

              {/* Right Side - Countdown */}
              <div className="text-right shrink-0">
                {/* Countdown */}
                <div
                  className={`flex items-center gap-1 text-sm ${style.countdown}`}
                >
                  <CountdownIcon className="w-4 h-4" />
                  <span className="font-medium">{countdownText}</span>
                </div>

                {/* Due Day */}
                <div className="text-xs text-base-content/40 flex items-center gap-1 justify-end mt-1">
                  <Calendar className="w-3 h-3" />
                  Día {reminder.due_day}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
