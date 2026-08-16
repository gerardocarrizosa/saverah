"use client";

import { CheckCircle2 } from "lucide-react";
import type { ReminderAnalytics } from "@/types/reminder.types";

interface NextDueInfoProps {
  name: string;
  category: string;
  recurrence: string;
  dueDay: number;
  cutoffDay?: number | null;
  analytics: ReminderAnalytics;
}

const CREDIT_CARD_CATEGORY = "Tarjeta de Crédito";

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
  accentClass: string;
  textColor: string;
  iconBgClass: string;
} {
  if (days < 0) {
    return {
      accentClass: "bg-accent",
      textColor: "text-accent",
      iconBgClass: "bg-accent/10",
    };
  }
  if (days === 0) {
    return {
      accentClass: "bg-accent",
      textColor: "text-accent",
      iconBgClass: "bg-accent/10",
    };
  }
  if (days === 1) {
    return {
      accentClass: "bg-accent",
      textColor: "text-accent",
      iconBgClass: "bg-accent/10",
    };
  }
  if (days <= 3) {
    return {
      accentClass: "bg-accent",
      textColor: "text-accent",
      iconBgClass: "bg-accent/10",
    };
  }
  return {
    accentClass: "bg-secondary",
    textColor: "text-secondary",
    iconBgClass: "bg-secondary/10",
  };
}

function getCountdownText(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Sin pagos";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CycleMetric({
  value,
  label,
  detail,
  textColor,
}: {
  value: string;
  label: string;
  detail: string;
  textColor: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex items-start gap-4 pl-2">
        <div>
          <p
            className={`font-(family-name:--font-headline) text-2xl font-bold tracking-tight ${textColor}`}
          >
            {value}
          </p>
          <p className="font-(family-name:--font-body) text-sm text-base-content/70 mt-1">
            {label}
          </p>
          <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40 mt-2">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NextDueInfo({
  name,
  category,
  recurrence,
  dueDay,
  cutoffDay,
  analytics,
}: NextDueInfoProps) {
  const isCreditCard = category === CREDIT_CARD_CATEGORY;

  if (analytics.is_paid_for_current_cycle) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-base-300 p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight text-secondary">
                Al día
              </p>
              <p className="font-(family-name:--font-body) text-sm text-base-content/70 mt-1">
                {name} ya está cubierto para este período.
              </p>
              <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40 mt-2">
                Último pago: {formatDate(analytics.last_paid_at)}
              </p>
            </div>
          </div>
        </div>

        <CycleMetric
          value={`Día ${dueDay}`}
          label="Próximo vencimiento"
          detail="Nuevo período disponible próximamente"
          textColor="text-primary"
        />
      </div>
    );
  }

  if (isCreditCard && cutoffDay) {
    const daysUntilCutoff = getDaysUntilCutoffFromToday(cutoffDay);
    const daysToPayFromCutoff = getDaysToPayFromCutoff(cutoffDay, dueDay);
    const daysUntilDueFromToday = getDaysUntilDueFromToday(dueDay);
    const cutoffUrgency = getUrgencyColor(daysUntilCutoff);
    const payWindowUrgency =
      daysUntilDueFromToday < 0
        ? getUrgencyColor(-1)
        : {
            accentClass: "bg-primary",
            textColor: "text-primary",
            iconBgClass: "bg-primary/10",
          };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CycleMetric
            value={getCountdownText(daysUntilCutoff)}
            label={daysUntilCutoff >= 0 ? "Días para corte" : "Corte pasado"}
            detail={`Cierra el día ${cutoffDay}`}
            textColor={cutoffUrgency.textColor}
          />
          <CycleMetric
            value={
              daysUntilCutoff >= 0
                ? `${daysToPayFromCutoff} días`
                : getCountdownText(daysUntilDueFromToday)
            }
            label={
              daysUntilCutoff >= 0
                ? "Ventana para pagar sin intereses"
                : daysUntilDueFromToday >= 0
                  ? "Días para pagar"
                  : "Pago vencido"
            }
            detail={`Vence el día ${dueDay}`}
            textColor={payWindowUrgency.textColor}
          />
        </div>

        <div className="rounded-xl bg-base-300/60 p-2">
          <p className="font-(family-name:--font-body) text-sm text-base-content/70">
            El corte cierra el día {cutoffDay} y tienes {daysToPayFromCutoff}{" "}
            días para pagar sin intereses, hasta el día {dueDay}.
          </p>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyColor(analytics.days_until_due);

  return (
    <CycleMetric
      value={getCountdownText(analytics.days_until_due)}
      label="Próximo vencimiento"
      detail={`${category} · ${recurrence} · día ${dueDay}`}
      textColor={urgency.textColor}
    />
  );
}
