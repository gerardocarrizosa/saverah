'use client';

import { ReminderCard } from './ReminderCard';
import type { Reminder } from '@/types/reminder.types';
import { AlertCircle, Clock, Calendar, CheckCircle2, PauseCircle } from 'lucide-react';

interface ReminderListProps {
  reminders: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
}

interface GroupedReminders {
  urgent: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  soon: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  future: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  overdue: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  inactive: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
}

function groupReminders(reminders: (Reminder & { daysUntilDue: number; isOverdue: boolean })[]): GroupedReminders {
  return reminders.reduce((acc, reminder) => {
    if (!reminder.is_active) {
      acc.inactive.push(reminder);
    } else if (reminder.isOverdue || reminder.daysUntilDue < 0) {
      acc.overdue.push(reminder);
    } else if (reminder.daysUntilDue <= 3) {
      acc.urgent.push(reminder);
    } else if (reminder.daysUntilDue <= 7) {
      acc.soon.push(reminder);
    } else {
      acc.future.push(reminder);
    }
    return acc;
  }, {
    urgent: [],
    soon: [],
    future: [],
    overdue: [],
    inactive: [],
  } as GroupedReminders);
}

function SectionHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  count, 
  variant 
}: { 
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count: number;
  variant: 'urgent' | 'warning' | 'success' | 'neutral' | 'muted';
}) {
  const variants = {
    urgent: {
      container: 'border-error/30',
      iconBg: 'bg-error/10',
      iconColor: 'text-error',
      badge: 'badge-error',
    },
    warning: {
      container: 'border-warning/30',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      badge: 'badge-warning',
    },
    success: {
      container: 'border-success/30',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      badge: 'badge-success',
    },
    neutral: {
      container: 'border-neutral/30',
      iconBg: 'bg-neutral/10',
      iconColor: 'text-neutral',
      badge: 'badge-neutral',
    },
    muted: {
      container: 'border-base-300',
      iconBg: 'bg-base-200',
      iconColor: 'text-base-content/50',
      badge: 'badge-ghost',
    },
  };

  const style = variants[variant];

  return (
    <div className={`flex items-center gap-3 pb-3 mb-3 border-b ${style.container}`}>
      <div className={`p-1.5 rounded-md ${style.iconBg}`}>
        <Icon className={`w-4 h-4 ${style.iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className={`badge badge-sm ${style.badge}`}>{count}</span>
        </div>
        <p className="text-xs text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
}

export function ReminderList({ reminders }: ReminderListProps) {
  const grouped = groupReminders(reminders);
  const hasActiveReminders = grouped.urgent.length > 0 || grouped.soon.length > 0 || 
                              grouped.future.length > 0 || grouped.overdue.length > 0;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-base-200 mb-4">
          <Calendar className="w-7 h-7 text-base-content/40" />
        </div>
        <h3 className="text-lg font-medium mb-2">No tienes recordatorios</h3>
        <p className="text-sm text-base-content/60 max-w-sm mx-auto">
          Comienza agregando tus pagos recurrentes, tarjetas de crédito, servicios y suscripciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overdue Section - Most critical */}
      {grouped.overdue.length > 0 && (
        <section>
          <SectionHeader
            icon={AlertCircle}
            title="Vencidos"
            subtitle="Ya pasó la fecha de vencimiento"
            count={grouped.overdue.length}
            variant="neutral"
          />
          <div className="space-y-3">
            {grouped.overdue.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* Urgent Section */}
      {grouped.urgent.length > 0 && (
        <section>
          <SectionHeader
            icon={AlertCircle}
            title="Urgentes"
            subtitle="Vencen en los próximos 3 días"
            count={grouped.urgent.length}
            variant="urgent"
          />
          <div className="space-y-3">
            {grouped.urgent.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* Soon Section */}
      {grouped.soon.length > 0 && (
        <section>
          <SectionHeader
            icon={Clock}
            title="Próximos"
            subtitle="Vencen esta semana"
            count={grouped.soon.length}
            variant="warning"
          />
          <div className="space-y-3">
            {grouped.soon.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* Future Section */}
      {grouped.future.length > 0 && (
        <section>
          <SectionHeader
            icon={CheckCircle2}
            title="Futuros"
            subtitle="Vencen en más de una semana"
            count={grouped.future.length}
            variant="success"
          />
          <div className="space-y-3">
            {grouped.future.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* Inactive Section */}
      {grouped.inactive.length > 0 && (
        <section>
          <SectionHeader
            icon={PauseCircle}
            title="Inactivos"
            subtitle="Recordatorios pausados"
            count={grouped.inactive.length}
            variant="muted"
          />
          <div className="space-y-3 opacity-60">
            {grouped.inactive.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* No Active Reminders Message */}
      {!hasActiveReminders && grouped.inactive.length > 0 && (
        <div className="alert alert-info bg-info/10 text-info border-info/20">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Todos tus recordatorios están pausados. Actívalos para ver las alertas de vencimiento.</span>
        </div>
      )}
    </div>
  );
}
