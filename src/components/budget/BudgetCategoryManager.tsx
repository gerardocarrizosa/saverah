'use client';

import { useState } from 'react';
import { 
  Home, 
  Utensils, 
  Car, 
  Zap, 
  Heart, 
  GraduationCap, 
  Gamepad2, 
  Shirt, 
  Laptop, 
  PiggyBank, 
  MoreHorizontal,
  CheckCircle2,
  Target,
  Loader2,
  X
} from 'lucide-react';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { CategorySummary } from '@/types/budget.types';
import api from '@/lib/axios';

interface BudgetCategoryManagerProps {
  categories: CategorySummary[];
  onLimitSet: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Vivienda': <Home className="w-5 h-5" />,
  'Alimentación': <Utensils className="w-5 h-5" />,
  'Transporte': <Car className="w-5 h-5" />,
  'Servicios': <Zap className="w-5 h-5" />,
  'Salud': <Heart className="w-5 h-5" />,
  'Educación': <GraduationCap className="w-5 h-5" />,
  'Entretenimiento': <Gamepad2 className="w-5 h-5" />,
  'Ropa': <Shirt className="w-5 h-5" />,
  'Tecnología': <Laptop className="w-5 h-5" />,
  'Ahorro': <PiggyBank className="w-5 h-5" />,
  'Otros': <MoreHorizontal className="w-5 h-5" />,
};

const categoryEmojis: Record<string, string> = {
  'Vivienda': '🏠',
  'Alimentación': '🍽️',
  'Transporte': '🚗',
  'Servicios': '⚡',
  'Salud': '❤️',
  'Educación': '📚',
  'Entretenimiento': '🎮',
  'Ropa': '👕',
  'Tecnología': '💻',
  'Ahorro': '🐷',
  'Otros': '📦',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

function BudgetLimitForm({ 
  currentLimit, 
  onSave, 
  onCancel 
}: { 
  currentLimit: number | null; 
  onSave: (limit: number) => void; 
  onCancel: () => void;
}) {
  const [limit, setLimit] = useState(currentLimit?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (numLimit > 0) {
      setSaving(true);
      await onSave(numLimit);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 text-sm">$</span>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="input input-sm input-bordered w-full pl-7"
          placeholder="Límite mensual"
          min="1"
          step="0.01"
          disabled={saving}
          autoFocus
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-sm btn-success"
        disabled={saving || !limit}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      </button>
      <button 
        type="button" 
        onClick={onCancel}
        className="btn btn-sm btn-ghost"
        disabled={saving}
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

export function BudgetCategoryManager({ categories, onLimitSet }: BudgetCategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const handleSetLimit = async (category: string, limit: number) => {
    setSavingCategory(category);
    try {
      await api.post('/budget/limits', { category, monthly_limit: limit });
      onLimitSet();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error setting limit:', error);
    } finally {
      setSavingCategory(null);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => b.spent - a.spent);

  if (categories.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Comienza a registrar tus gastos</h3>
          <p className="text-base-content/60 max-w-md mx-auto">
            Aún no tienes gastos registrados. Una vez que los agregues, podrás ver el desglose por categoría y establecer límites de presupuesto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedCategories.map((category) => {
        const percentage = category.percentage || 0;
        const isExceeded = category.status === 'exceeded';
        const isWarning = category.status === 'warning';
        
        let progressColor = 'bg-success';
        let statusEmoji = '✅';
        if (isExceeded) {
          progressColor = 'bg-error';
          statusEmoji = '⚠️';
        } else if (isWarning) {
          progressColor = 'bg-warning';
          statusEmoji = '⚡';
        }

        return (
          <div 
            key={category.category}
            className="card bg-base-100 border border-base-300 hover:border-base-content/20 transition-all"
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isExceeded ? 'bg-error/10 text-error' : isWarning ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    {categoryIcons[category.category] || <MoreHorizontal className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryEmojis[category.category] || '📦'}</span>
                      <h4 className="font-semibold">{category.category}</h4>
                    </div>
                    <p className="text-sm text-base-content/60">
                      Gastado: <span className="font-medium text-base-content">{formatCurrency(category.spent)}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {category.limit ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{statusEmoji}</span>
                      <div className="text-sm">
                        <p className="font-medium">{formatCurrency(category.limit)}</p>
                        <p className="text-xs text-base-content/50">límite</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingCategory(category.category)}
                      className="btn btn-sm btn-ghost gap-1"
                    >
                      <Target className="w-4 h-4" />
                      <span className="text-xs">Fijar límite</span>
                    </button>
                  )}
                </div>
              </div>

              {category.limit && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className={isExceeded ? 'text-error font-medium' : isWarning ? 'text-warning font-medium' : 'text-success'}>
                      {isExceeded ? '¡Límite excedido!' : isWarning ? 'Cerca del límite' : 'Dentro del presupuesto'}
                    </span>
                    <span className="text-base-content/60">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-base-content/50">
                    <span>$0</span>
                    <span>{formatCurrency(category.limit)}</span>
                  </div>
                </div>
              )}

              {editingCategory === category.category && !category.limit && (
                <div className="mt-3 pt-3 border-t border-base-300">
                  <p className="text-sm text-base-content/70 mb-2">
                    Establece un límite mensual para {category.category.toLowerCase()}
                  </p>
                  <BudgetLimitForm
                    currentLimit={category.limit}
                    onSave={(limit) => handleSetLimit(category.category, limit)}
                    onCancel={() => setEditingCategory(null)}
                  />
                </div>
              )}

              {savingCategory === category.category && (
                <div className="mt-3 flex items-center gap-2 text-sm text-info">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando límite...</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
