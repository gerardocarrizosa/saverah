'use client';

import { useState } from 'react';
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
  AlertCircle,
  Eye,
  Pause,
  Play,
  Trash2,
  Loader2,
  Calendar,
  Repeat
} from 'lucide-react';
import type { Reminder } from '@/types/reminder.types';
import { RECURRENCE_TYPES } from '@/config/constants';

interface ReminderCardProps {
  reminder: Reminder & { daysUntilDue: number; isOverdue: boolean };
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Tarjeta de Crédito': <CreditCard className="w-5 h-5" />,
  'Servicios': <Zap className="w-5 h-5" />,
  'Suscripción': <Tv className="w-5 h-5" />,
  'Alquiler': <Home className="w-5 h-5" />,
  'Préstamo': <Landmark className="w-5 h-5" />,
  'Seguro': <Shield className="w-5 h-5" />,
  'Impuestos': <FileText className="w-5 h-5" />,
  'Otros': <Package className="w-5 h-5" />,
};

const categoryEmojis: Record<string, string> = {
  'Tarjeta de Crédito': '💳',
  'Servicios': '⚡',
  'Suscripción': '📱',
  'Alquiler': '🏠',
  'Préstamo': '📊',
  'Seguro': '🛡️',
  'Impuestos': '📄',
  'Otros': '📦',
};

function getUrgencyLevel(daysUntilDue: number, isOverdue: boolean): 'urgent' | 'soon' | 'future' | 'overdue' {
  if (isOverdue || daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'urgent';
  if (daysUntilDue <= 7) return 'soon';
  return 'future';
}

function getCountdownText(daysUntilDue: number, isOverdue: boolean): string {
  if (isOverdue || daysUntilDue < 0) return `Vencido hace ${Math.abs(daysUntilDue)} días`;
  if (daysUntilDue === 0) return '¡Vence hoy!';
  if (daysUntilDue === 1) return '¡Vence mañana!';
  return `En ${daysUntilDue} días`;
}

export function ReminderCard({ reminder, onToggleActive, onDelete, isDeleting }: ReminderCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const urgency = getUrgencyLevel(reminder.daysUntilDue, reminder.isOverdue);
  const countdownText = getCountdownText(reminder.daysUntilDue, reminder.isOverdue);
  
  const urgencyStyles = {
    urgent: {
      border: 'border-error/50',
      bg: 'bg-error/5',
      badge: 'badge-error',
      countdown: 'text-error font-bold',
      icon: 'text-error',
      pulse: true,
    },
    soon: {
      border: 'border-warning/50',
      bg: 'bg-warning/5',
      badge: 'badge-warning',
      countdown: 'text-warning font-semibold',
      icon: 'text-warning',
      pulse: false,
    },
    future: {
      border: 'border-success/50',
      bg: 'bg-success/5',
      badge: 'badge-success',
      countdown: 'text-success',
      icon: 'text-success',
      pulse: false,
    },
    overdue: {
      border: 'border-neutral/50',
      bg: 'bg-neutral/5',
      badge: 'badge-neutral',
      countdown: 'text-neutral',
      icon: 'text-neutral',
      pulse: false,
    },
  };
  
  const style = urgencyStyles[urgency];
  const recurrenceLabel = RECURRENCE_TYPES.find(r => r.value === reminder.recurrence)?.label || reminder.recurrence;

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggleActive(reminder.id, !reminder.is_active);
    setIsToggling(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(reminder.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className={`card bg-base-100 border-2 ${style.border} ${style.bg} hover:shadow-lg transition-all duration-300`}>
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl bg-base-100 ${style.icon} shrink-0`}>
            <span className="text-2xl">{categoryEmojis[reminder.category] || '📦'}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg leading-tight">{reminder.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${style.badge} badge-sm gap-1`}>
                    {categoryIcons[reminder.category] || <Package className="w-3 h-3" />}
                    {reminder.category}
                  </span>
                  <span className="badge badge-ghost badge-sm gap-1">
                    <Repeat className="w-3 h-3" />
                    {recurrenceLabel}
                  </span>
                </div>
              </div>
              
              {/* Countdown Badge */}
              <div className={`text-right shrink-0 ${style.pulse ? 'animate-pulse' : ''}`}>
                <div className={`text-sm ${style.countdown}`}>
                  {countdownText}
                </div>
                <div className="text-xs text-base-content/60 flex items-center gap-1 justify-end mt-1">
                  <Calendar className="w-3 h-3" />
                  Día {reminder.due_day}
                </div>
              </div>
            </div>

            {/* Cutoff info for credit cards */}
            {reminder.cutoff_day && reminder.category === 'Tarjeta de Crédito' && (
              <div className="mt-3 flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-lg">
                <Scissors className="w-4 h-4" />
                <span>
                  <strong>Corte:</strong> Día {reminder.cutoff_day} de cada mes
                </span>
              </div>
            )}

            {/* Notes */}
            {reminder.notes && (
              <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                {reminder.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="divider my-3"></div>
        
        <div className="flex items-center gap-2">
          <Link 
            href={`/reminders/${reminder.id}`}
            className="btn btn-sm btn-primary flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver detalle
          </Link>
          
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`btn btn-sm ${reminder.is_active ? 'btn-success' : 'btn-ghost'}`}
            title={reminder.is_active ? 'Pausar recordatorio' : 'Activar recordatorio'}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : reminder.is_active ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`btn btn-sm ${showDeleteConfirm ? 'btn-error' : 'btn-ghost text-error'}`}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="alert alert-warning alert-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Haz clic nuevamente para eliminar</span>
          </div>
        )}
      </div>
    </div>
  );
}
