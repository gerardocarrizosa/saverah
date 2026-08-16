import {
  Calendar,
  DollarSign,
  Receipt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DEFAULT_CURRENCY } from "@/config/constants";
import type { ReminderAnalytics } from "@/types/reminder.types";

interface ReminderAnalyticsProps {
  analytics: ReminderAnalytics;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: DEFAULT_CURRENCY,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Nunca";
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  colorClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/50">
          {label}
        </p>
        <div className={`${colorClass} opacity-80`}>{icon}</div>
      </div>
      <div>
        <p
          className={`font-(family-name:--font-headline) text-2xl font-bold tracking-tight ${colorClass}`}
        >
          {value}
        </p>
        <p className="font-(family-name:--font-body) text-xs text-base-content/40 mt-1">
          {detail}
        </p>
      </div>
    </div>
  );
}

export function ReminderAnalytics({ analytics }: ReminderAnalyticsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total pagado"
          value={formatCurrency(analytics.total_paid)}
          detail="Histórico registrado"
          icon={<DollarSign className="w-5 h-5" />}
          colorClass="text-secondary"
        />
        <MetricCard
          label="Promedio"
          value={formatCurrency(analytics.average_payment)}
          detail="Por pago realizado"
          icon={<TrendingUp className="w-5 h-5" />}
          colorClass="text-primary"
        />
        <MetricCard
          label="Total pagos"
          value={String(analytics.payment_count)}
          detail="Registros guardados"
          icon={<Receipt className="w-5 h-5" />}
          colorClass="text-base-content"
        />
      </div>

      {analytics.last_paid_at && (
        <div className="flex items-center gap-4 p-5 bg-base-300/60 rounded-xl">
          <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/40">
              Último pago
            </p>
            <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content mt-1">
              {formatDate(analytics.last_paid_at)}
            </p>
          </div>
        </div>
      )}

      {analytics.payment_count === 0 && (
        <div className="rounded-xl bg-primary/10 p-5 flex items-start gap-3 text-primary">
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="font-(family-name:--font-body) text-sm">
            Aún no hay pagos registrados. Registra el primero para construir el
            historial de este recordatorio.
          </p>
        </div>
      )}
    </div>
  );
}
