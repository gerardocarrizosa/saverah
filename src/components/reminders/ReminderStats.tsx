'use client';

import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PauseCircle,
  Sparkles
} from 'lucide-react';

interface ReminderStatsProps {
  total: number;
  active: number;
  upcoming: number;
  overdue: number;
  inactive: number;
}

export function ReminderStats({ total, active, upcoming, overdue, inactive }: ReminderStatsProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Resumen de recordatorios</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="stat bg-base-200/50 rounded-xl p-3">
            <div className="stat-title text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Total
            </div>
            <div className="stat-value text-2xl">{total}</div>
          </div>

          <div className="stat bg-success/10 rounded-xl p-3">
            <div className="stat-title text-xs flex items-center gap-1 text-success">
              <CheckCircle className="w-3 h-3" />
              Activos
            </div>
            <div className="stat-value text-2xl text-success">{active}</div>
          </div>

          <div className="stat bg-warning/10 rounded-xl p-3">
            <div className="stat-title text-xs flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3" />
              Próximos
            </div>
            <div className="stat-value text-2xl text-warning">{upcoming}</div>
            <div className="stat-desc text-xs">Esta semana</div>
          </div>

          <div className="stat bg-error/10 rounded-xl p-3">
            <div className="stat-title text-xs flex items-center gap-1 text-error">
              <AlertCircle className="w-3 h-3" />
              Urgentes
            </div>
            <div className="stat-value text-2xl text-error">{overdue}</div>
            <div className="stat-desc text-xs">3 días o menos</div>
          </div>

          <div className="stat bg-base-300/50 rounded-xl p-3">
            <div className="stat-title text-xs flex items-center gap-1 text-base-content/50">
              <PauseCircle className="w-3 h-3" />
              Inactivos
            </div>
            <div className="stat-value text-2xl text-base-content/50">{inactive}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
