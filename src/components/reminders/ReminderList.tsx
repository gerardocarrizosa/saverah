'use client';

import { ReminderCard } from './ReminderCard';
import type { Reminder } from '@/types/reminder.types';
import { AlertCircle, Clock, Calendar, CheckCircle, PauseCircle } from 'lucide-react';

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

export function ReminderList({ reminders }: ReminderListProps) {
  const grouped = groupReminders(reminders);
  const hasActiveReminders = grouped.urgent.length > 0 || grouped.soon.length > 0 || 
                              grouped.future.length > 0 || grouped.overdue.length > 0;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="text-5xl sm:text-6xl mb-4">🗓️</div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">No tienes recordatorios</h3>
        <p className="text-base-content/60 max-w-md mx-auto text-sm sm:text-base">
          Comienza agregando tus pagos recurrentes, tarjetas de crédito, servicios y suscripciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Urgent Section */}
      {grouped.urgent.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 rounded-lg bg-error/10 w-fit">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-error">🔴 URGENTE</h2>
              <p className="text-xs sm:text-sm text-base-content/60">Vence en los próximos 3 días</p>
            </div>
            <span className="badge badge-error badge-sm mt-1 sm:mt-0 w-fit">{grouped.urgent.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.urgent.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Soon Section */}
      {grouped.soon.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 rounded-lg bg-warning/10 w-fit">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-warning">🟡 PRÓXIMOS</h2>
              <p className="text-xs sm:text-sm text-base-content/60">Vence esta semana</p>
            </div>
            <span className="badge badge-warning badge-sm mt-1 sm:mt-0 w-fit">{grouped.soon.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.soon.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Future Section */}
      {grouped.future.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10 w-fit">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-success">🟢 FUTUROS</h2>
              <p className="text-xs sm:text-sm text-base-content/60">Vence en más de una semana</p>
            </div>
            <span className="badge badge-success badge-sm mt-1 sm:mt-0 w-fit">{grouped.future.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.future.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Overdue Section */}
      {grouped.overdue.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 rounded-lg bg-neutral/10 w-fit">
              <CheckCircle className="w-5 h-5 text-neutral" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-neutral">⚫ VENCIDOS</h2>
              <p className="text-xs sm:text-sm text-base-content/60">Ya pasó la fecha de vencimiento</p>
            </div>
            <span className="badge badge-neutral badge-sm mt-1 sm:mt-0 w-fit">{grouped.overdue.length}</span>
          </div>
          <div className="space-y-3 opacity-75">
            {grouped.overdue.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Inactive Section */}
      {grouped.inactive.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 rounded-lg bg-base-300 w-fit">
              <PauseCircle className="w-5 h-5 text-base-content/50" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-base-content/50">⏸️ INACTIVOS</h2>
              <p className="text-xs sm:text-sm text-base-content/60">Recordatorios pausados</p>
            </div>
            <span className="badge badge-ghost badge-sm mt-1 sm:mt-0 w-fit">{grouped.inactive.length}</span>
          </div>
          <div className="space-y-3 opacity-50">
            {grouped.inactive.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Active Reminders Message */}
      {!hasActiveReminders && grouped.inactive.length > 0 && (
        <div className="alert alert-info">
          <AlertCircle className="w-5 h-5" />
          <span>Todos tus recordatorios están pausados. Actívalos para ver las alertas de vencimiento.</span>
        </div>
      )}
    </div>
  );
}
