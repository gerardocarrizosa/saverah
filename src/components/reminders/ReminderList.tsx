'use client';

import { useState } from 'react';
import { ReminderCard } from './ReminderCard';
import type { Reminder } from '@/types/reminder.types';
import { AlertCircle, Clock, Calendar, CheckCircle, PauseCircle } from 'lucide-react';

interface ReminderListProps {
  reminders: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
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

export function ReminderList({ reminders, onToggleActive, onDelete }: ReminderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const grouped = groupReminders(reminders);
  const hasActiveReminders = grouped.urgent.length > 0 || grouped.soon.length > 0 || 
                              grouped.future.length > 0 || grouped.overdue.length > 0;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🗓️</div>
        <h3 className="text-xl font-bold mb-2">No tienes recordatorios</h3>
        <p className="text-base-content/60 max-w-md mx-auto">
          Comienza agregando tus pagos recurrentes, tarjetas de crédito, servicios y suscripciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Urgent Section */}
      {grouped.urgent.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-error/10">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-error">🔴 URGENTE</h2>
              <p className="text-sm text-base-content/60">Vence en los próximos 3 días</p>
            </div>
            <span className="badge badge-error badge-sm ml-auto">{grouped.urgent.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.urgent.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleActive={onToggleActive}
                onDelete={handleDelete}
                isDeleting={deletingId === reminder.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Soon Section */}
      {grouped.soon.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warning">🟡 PRÓXIMOS</h2>
              <p className="text-sm text-base-content/60">Vence esta semana</p>
            </div>
            <span className="badge badge-warning badge-sm ml-auto">{grouped.soon.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.soon.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleActive={onToggleActive}
                onDelete={handleDelete}
                isDeleting={deletingId === reminder.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Future Section */}
      {grouped.future.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-success">🟢 FUTUROS</h2>
              <p className="text-sm text-base-content/60">Vence en más de una semana</p>
            </div>
            <span className="badge badge-success badge-sm ml-auto">{grouped.future.length}</span>
          </div>
          <div className="space-y-3">
            {grouped.future.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleActive={onToggleActive}
                onDelete={handleDelete}
                isDeleting={deletingId === reminder.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Overdue Section */}
      {grouped.overdue.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-neutral/10">
              <CheckCircle className="w-5 h-5 text-neutral" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral">⚫ VENCIDOS</h2>
              <p className="text-sm text-base-content/60">Ya pasó la fecha de vencimiento</p>
            </div>
            <span className="badge badge-neutral badge-sm ml-auto">{grouped.overdue.length}</span>
          </div>
          <div className="space-y-3 opacity-75">
            {grouped.overdue.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleActive={onToggleActive}
                onDelete={handleDelete}
                isDeleting={deletingId === reminder.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Inactive Section */}
      {grouped.inactive.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-base-300">
              <PauseCircle className="w-5 h-5 text-base-content/50" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content/50">⏸️ INACTIVOS</h2>
              <p className="text-sm text-base-content/60">Recordatorios pausados</p>
            </div>
            <span className="badge badge-ghost badge-sm ml-auto">{grouped.inactive.length}</span>
          </div>
          <div className="space-y-3 opacity-50">
            {grouped.inactive.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleActive={onToggleActive}
                onDelete={handleDelete}
                isDeleting={deletingId === reminder.id}
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
