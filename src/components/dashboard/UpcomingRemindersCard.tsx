import Link from "next/link";
import { Bell, Home, Zap, Receipt, ArrowRight } from "lucide-react";
import type { Reminder } from "@/types/reminder.types";
import { getDaysUntilDue } from "@/lib/utils/dates";

interface ReminderWithStatus extends Reminder {
  isPaidForCurrentCycle?: boolean;
}

interface UpcomingRemindersCardProps {
  reminders: ReminderWithStatus[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Tarjeta de Crédito": <Zap className="w-5 h-5" />,
  Servicios: <Zap className="w-5 h-5" />,
  Suscripción: <Receipt className="w-5 h-5" />,
  Alquiler: <Home className="w-5 h-5" />,
  Préstamo: <Zap className="w-5 h-5" />,
  Seguro: <Zap className="w-5 h-5" />,
  Impuestos: <Zap className="w-5 h-5" />,
  Otros: <Zap className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  "Tarjeta de Crédito": "text-primary",
  Servicios: "text-accent",
  Suscripción: "text-secondary",
  Alquiler: "text-primary",
  Préstamo: "text-accent",
  Seguro: "text-secondary",
  Impuestos: "text-primary",
  Otros: "text-base-content",
};

export function UpcomingRemindersCard({
  reminders,
}: UpcomingRemindersCardProps) {
  const upcoming = reminders
    .filter((r) => r.is_active && !r.isPaidForCurrentCycle)
    .map((r) => ({
      ...r,
      daysUntilDue: getDaysUntilDue(r.due_day, r.recurrence),
    }))
    .filter((r) => r.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 3);

  const upcomingCount = reminders.filter(
    (r) => r.is_active && !r.isPaidForCurrentCycle,
  ).length;

  return (
    <div className="bg-base-300 rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-(family-name:--font-headline) text-xl text-base-content">
          Recordatorios
        </h2>
        <Bell
          className="w-5 h-5 text-accent fill-accent"
          strokeWidth={0}
          fill="currentColor"
        />
      </div>

      <div className="space-y-6">
        {upcoming.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/50">
              No hay recordatorios próximos
            </p>
          </div>
        ) : (
          upcoming.map((reminder) => {
            const isOverdue = reminder.daysUntilDue < 0;
            const colorClass =
              categoryColors[reminder.category] || "text-base-content";

            return (
              <div key={reminder.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                  <span className={colorClass}>
                    {categoryIcons[reminder.category] || (
                      <Zap className="w-5 h-5" />
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content truncate">
                    {reminder.name}
                  </p>
                  <p className="font-(family-name:--font-body) text-[10px] text-base-content/60 uppercase tracking-wider">
                    {isOverdue
                      ? `VENCIDO HACE ${Math.abs(reminder.daysUntilDue)} DÍAS`
                      : reminder.daysUntilDue === 0
                        ? "VENCE HOY"
                        : `VENCE EN ${reminder.daysUntilDue} DÍAS`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-auto pt-8">
        <Link
          href="/reminders"
          className="bg-base-100 rounded-lg p-4 flex items-center justify-between hover:bg-base-200 transition-colors"
        >
          <span className="font-(family-name:--font-body) text-xs text-base-content/60">
            {upcomingCount} Recordatorios próximos
          </span>
          <ArrowRight className="w-4 h-4 text-base-content/60" />
        </Link>
      </div>
    </div>
  );
}
