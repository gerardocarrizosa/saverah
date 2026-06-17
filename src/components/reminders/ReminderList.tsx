import { ReminderListItem } from "./ReminderListItem";
import { RemindersSection } from "./RemindersSection";
import type { Reminder } from "@/types/reminder.types";
import { AlertCircle, Calendar } from "lucide-react";

interface ReminderListProps {
  reminders: (Reminder & {
    daysUntilDue: number;
    isOverdue: boolean;
    isPaidForCurrentCycle?: boolean;
  })[];
}

interface GroupedReminders {
  paid: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  urgent: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  soon: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  future: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  overdue: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
  inactive: (Reminder & { daysUntilDue: number; isOverdue: boolean })[];
}

function groupReminders(
  reminders: (Reminder & {
    daysUntilDue: number;
    isOverdue: boolean;
    isPaidForCurrentCycle?: boolean;
  })[],
): GroupedReminders {
  return reminders.reduce(
    (acc, reminder) => {
      if (!reminder.is_active) {
        acc.inactive.push(reminder);
      } else if (reminder.isPaidForCurrentCycle) {
        acc.paid.push(reminder);
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
    },
    {
      paid: [],
      urgent: [],
      soon: [],
      future: [],
      overdue: [],
      inactive: [],
    } as GroupedReminders,
  );
}

export function ReminderList({ reminders }: ReminderListProps) {
  const grouped = groupReminders(reminders);
  const hasActiveReminders =
    grouped.urgent.length > 0 ||
    grouped.soon.length > 0 ||
    grouped.future.length > 0 ||
    grouped.overdue.length > 0 ||
    grouped.paid.length > 0;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-base-200 mb-4">
          <Calendar className="w-7 h-7 text-base-content/40" />
        </div>
        <h3 className="text-lg font-medium mb-2">No tienes recordatorios</h3>
        <p className="text-sm text-base-content/60 max-w-sm mx-auto">
          Comienza agregando tus pagos recurrentes, tarjetas de crédito,
          servicios y suscripciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overdue Section - Most critical */}
      {grouped.overdue.length > 0 && (
        <RemindersSection title="Vencidos" count={grouped.overdue.length}>
          {grouped.overdue.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* Urgent Section */}
      {grouped.urgent.length > 0 && (
        <RemindersSection title="Urgentes" count={grouped.urgent.length}>
          {grouped.urgent.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* Soon Section */}
      {grouped.soon.length > 0 && (
        <RemindersSection title="Próximos" count={grouped.soon.length}>
          {grouped.soon.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* Future Section */}
      {grouped.future.length > 0 && (
        <RemindersSection title="Futuros" count={grouped.future.length}>
          {grouped.future.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* Paid Section */}
      {grouped.paid.length > 0 && (
        <RemindersSection title="Pagados" count={grouped.paid.length}>
          {grouped.paid.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* Inactive Section */}
      {grouped.inactive.length > 0 && (
        <RemindersSection title="Inactivos" count={grouped.inactive.length}>
          {grouped.inactive.map((reminder) => (
            <ReminderListItem key={reminder.id} reminder={reminder} />
          ))}
        </RemindersSection>
      )}

      {/* No Active Reminders Message */}
      {!hasActiveReminders && grouped.inactive.length > 0 && (
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">
            Todos tus recordatorios están pausados. Actívalos para ver las
            alertas de vencimiento.
          </span>
        </div>
      )}
    </div>
  );
}
