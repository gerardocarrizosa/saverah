import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

import type { ReminderWithStatus } from "@/lib/api/remindersWithPayments";

interface CriticalAlertsSummaryProps {
  reminders: ReminderWithStatus[];
}

export function CriticalAlertsSummary({
  reminders,
}: CriticalAlertsSummaryProps) {
  // Overdue + Urgent (not paid, not inactive)
  const critical = reminders.filter(
    (r) =>
      r.is_active &&
      !r.isPaidForCurrentCycle &&
      (r.isOverdue || r.daysUntilDue < 0 || r.daysUntilDue <= 3),
  );

  // Soon (not paid, not inactive, 4-7 days)
  const soon = reminders.filter(
    (r) =>
      r.is_active &&
      !r.isPaidForCurrentCycle &&
      r.daysUntilDue > 3 &&
      r.daysUntilDue <= 7,
  );

  const hasCritical = critical.length > 0;
  const hasSoon = soon.length > 0;

  // If everything is fine, show a single positive card
  if (!hasCritical && !hasSoon) {
    return (
      <div className="bg-base-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <p className="font-(family-name:--font-headline) font-bold text-base-content">
            Todo en orden
          </p>
          <p className="font-(family-name:--font-body) text-sm text-base-content/60">
            No hay pagos urgentes ni vencimientos próximos
          </p>
        </div>
      </div>
    );
  }

  // Determine grid columns based on which cards are visible
  const gridCols = hasCritical && hasSoon ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
      {/* Critical Card */}
      {hasCritical && (
        <div className="bg-base-300 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <AlertCircle className="w-6 h-6 text-accent" />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="font-(family-name:--font-body) text-accent text-xs font-bold uppercase tracking-widest mb-1">
                Urgente / Vencido
              </p>
              <h3 className="font-(family-name:--font-headline) text-xl font-bold text-base-content">
                {critical.length} {critical.length === 1 ? "pago" : "pagos"}
              </h3>
            </div>
            <div className="mt-8">
              <p className="font-(family-name:--font-body) text-xs text-base-content/60 mt-1">
                Revisa los vencimientos para evitar recargos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Soon Card */}
      {hasSoon && (
        <div className="bg-base-200 rounded-xl p-4">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div className="bg-secondary/10 px-3 py-1 rounded-full">
              <p className="text-secondary text-[10px] font-bold uppercase tracking-tighter">
                Próximos
              </p>
            </div>
          </div>
          <h3 className="font-(family-name:--font-headline) text-lg font-bold text-base-content">
            {soon.length} {soon.length === 1 ? "vencimiento" : "vencimientos"}{" "}
            esta semana
          </h3>
          <p className="font-(family-name:--font-body) text-[10px] text-base-content/60 mt-4 uppercase tracking-widest">
            Entre 4 y 7 días
          </p>
        </div>
      )}
    </div>
  );
}
