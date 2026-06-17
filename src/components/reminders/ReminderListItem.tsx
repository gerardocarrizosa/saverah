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
} from 'lucide-react';
import type { Reminder } from '@/types/reminder.types';
import { RECURRENCE_TYPES } from '@/config/constants';


interface ReminderListItemProps {
  reminder: Reminder & {
    daysUntilDue: number;
    isOverdue: boolean;
    isPaidForCurrentCycle?: boolean;
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Tarjeta de Crédito': <CreditCard className="w-5 h-5" />,
  Servicios: <Zap className="w-5 h-5" />,
  Suscripción: <Tv className="w-5 h-5" />,
  Alquiler: <Home className="w-5 h-5" />,
  Préstamo: <Landmark className="w-5 h-5" />,
  Seguro: <Shield className="w-5 h-5" />,
  Impuestos: <FileText className="w-5 h-5" />,
  Otros: <Package className="w-5 h-5" />,
};

function getCountdownText(
  daysUntilDue: number,
  isOverdue: boolean,
  isPaidForCurrentCycle?: boolean
): string {
  if (isPaidForCurrentCycle) return 'Pagado';
  if (isOverdue || daysUntilDue < 0) return `Vencido hace ${Math.abs(daysUntilDue)} días`;
  if (daysUntilDue === 0) return 'Vence hoy';
  if (daysUntilDue === 1) return 'Vence mañana';
  return `En ${daysUntilDue} días`;
}

function getCountdownColor(
  daysUntilDue: number,
  isOverdue: boolean,
  isPaidForCurrentCycle?: boolean
): string {
  if (isPaidForCurrentCycle) return 'text-base-content/40';
  if (isOverdue || daysUntilDue < 0) return 'text-accent';
  if (daysUntilDue <= 3) return 'text-accent';
  if (daysUntilDue <= 7) return 'text-secondary';
  return 'text-base-content/60';
}

export function ReminderListItem({ reminder }: ReminderListItemProps) {
  const isPaid = reminder.isPaidForCurrentCycle;
  const isInactive = !reminder.is_active;
  const isOverdue = reminder.isOverdue;
  const countdownText = getCountdownText(
    reminder.daysUntilDue,
    reminder.isOverdue,
    reminder.isPaidForCurrentCycle
  );
  const countdownColor = getCountdownColor(
    reminder.daysUntilDue,
    reminder.isOverdue,
    reminder.isPaidForCurrentCycle
  );
  const recurrenceLabel =
    RECURRENCE_TYPES.find((r) => r.value === reminder.recurrence)?.label ||
    reminder.recurrence;

  const opacityClass = isPaid || isInactive ? 'opacity-60' : '';
  const borderClass = isOverdue && !isPaid ? 'border-l-2 border-accent' : '';

  return (
    <Link
      href={`/reminders/${reminder.id}`}
      className={`block bg-base-200 rounded-xl p-5 flex items-center justify-between group hover:bg-base-300 transition-all duration-300 ${opacityClass} ${borderClass}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center border border-base-content/10 shrink-0">
          <span className="text-base-content/60">
            {categoryIcons[reminder.category] || <Package className="w-5 h-5" />}
          </span>
        </div>
        <div>
          <h4 className="font-[family-name:var(--font-headline)] font-bold text-base-content">
            {reminder.name}
          </h4>
          <div className="flex flex-wrap gap-3 mt-1">
            <p className="font-[family-name:var(--font-body)] text-[10px] text-base-content/60 uppercase tracking-wider">
              {reminder.category} · {recurrenceLabel}
            </p>
            {reminder.cutoff_day && reminder.category === 'Tarjeta de Crédito' && (
              <p className="font-[family-name:var(--font-body)] text-[10px] text-primary uppercase tracking-wider flex items-center gap-1">
                <Scissors className="w-3 h-3" />
                Corte: día {reminder.cutoff_day}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-[family-name:var(--font-body)] text-[10px] ${countdownColor}`}>
          {countdownText}
        </p>
      </div>
    </Link>
  );
}
