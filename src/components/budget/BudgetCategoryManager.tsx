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
  AlertCircle,
  AlertTriangle,
  Target,
  Loader2,
  X,
  Shield,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  ESSENTIAL_CATEGORIES,
  DISCRETIONARY_CATEGORIES,
} from '@/config/constants';
import type { CategorySummary } from '@/types/budget.types';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils/currency';

interface BudgetCategoryManagerProps {
  categories: CategorySummary[];
  onLimitSet: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Vivienda: <Home className="w-5 h-5" />,
  Alimentación: <Utensils className="w-5 h-5" />,
  Transporte: <Car className="w-5 h-5" />,
  Servicios: <Zap className="w-5 h-5" />,
  Salud: <Heart className="w-5 h-5" />,
  Educación: <GraduationCap className="w-5 h-5" />,
  Entretenimiento: <Gamepad2 className="w-5 h-5" />,
  Ropa: <Shirt className="w-5 h-5" />,
  Tecnología: <Laptop className="w-5 h-5" />,
  Ahorro: <PiggyBank className="w-5 h-5" />,
  Otros: <MoreHorizontal className="w-5 h-5" />,
};


function BudgetLimitForm({
  currentLimit,
  onSave,
  onCancel,
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 text-sm">
          $
        </span>
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
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
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

function CategoryCard({
  category,
  editingCategory,
  savingCategory,
  onSetEditing,
  onSetLimit,
}: {
  category: CategorySummary;
  editingCategory: string | null;
  savingCategory: string | null;
  onSetEditing: (c: string | null) => void;
  onSetLimit: (category: string, limit: number) => void;
}) {
  const percentage = category.percentage || 0;
  const isExceeded = category.status === 'exceeded';
  const isWarning = category.status === 'warning';

  let progressColor = 'bg-success';
  let statusIcon = <CheckCircle2 className="w-4 h-4" />;
  if (isExceeded) {
    progressColor = 'bg-error';
    statusIcon = <AlertCircle className="w-4 h-4" />;
  } else if (isWarning) {
    progressColor = 'bg-warning';
    statusIcon = <AlertTriangle className="w-4 h-4" />;
  }

  return (
    <div
      className="card bg-base-100 border border-base-300 hover:border-base-content/20 transition-all rounded-xl"
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${isExceeded ? 'bg-error/10 text-error' : isWarning ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}
            >
              {categoryIcons[category.category] || (
                <MoreHorizontal className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{category.category}</h4>
              </div>
              <p className="text-sm text-base-content/60">
                Gastado:{' '}
                <span className="font-medium text-base-content">
                  {formatCurrency(category.spent)}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            {category.limit ? (
              <div className="flex items-center gap-2">
                <div
                  className={
                    isExceeded
                      ? 'text-error'
                      : isWarning
                        ? 'text-warning'
                        : 'text-success'
                  }
                >
                  {statusIcon}
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {formatCurrency(category.limit)}
                  </p>
                  <p className="text-xs text-base-content/50">límite</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSetEditing(category.category)}
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
              <span
                className={
                  isExceeded
                    ? 'text-error font-medium'
                    : isWarning
                      ? 'text-warning font-medium'
                      : 'text-success'
                }
              >
                {isExceeded
                  ? '¡Límite excedido!'
                  : isWarning
                    ? 'Cerca del límite'
                    : 'Dentro del presupuesto'}
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
              Establece un límite mensual para{' '}
              {category.category.toLowerCase()}
            </p>
            <BudgetLimitForm
              currentLimit={category.limit}
              onSave={(limit) => onSetLimit(category.category, limit)}
              onCancel={() => onSetEditing(null)}
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
}

function CategoryGroup({
  title,
  icon,
  items,
  editingCategory,
  savingCategory,
  onSetEditing,
  onSetLimit,
}: {
  title: string;
  icon: React.ReactNode;
  items: CategorySummary[];
  editingCategory: string | null;
  savingCategory: string | null;
  onSetEditing: (c: string | null) => void;
  onSetLimit: (category: string, limit: number) => void;
}) {
  const subtotal = items.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-base-content/80">{title}</h3>
        </div>
        <span className="text-sm font-medium text-base-content/70">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-base-content/40 italic pl-1">
          Sin gastos registrados este mes
        </p>
      ) : (
        items.map((category) => (
          <CategoryCard
            key={category.category}
            category={category}
            editingCategory={editingCategory}
            savingCategory={savingCategory}
            onSetEditing={onSetEditing}
            onSetLimit={onSetLimit}
          />
        ))
      )}
    </div>
  );
}

export function BudgetCategoryManager({
  categories,
  onLimitSet,
}: BudgetCategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const handleSetLimit = async (category: string, limit: number) => {
    setSavingCategory(category);
    try {
      await api.post('/budget/limits', { category, monthly_limit: limit });
      onLimitSet();
      setEditingCategory(null);
    } catch {
      // Silently ignore; error state is handled by UI
    } finally {
      setSavingCategory(null);
    }
  };

  const sortBySpent = (a: CategorySummary, b: CategorySummary) => b.spent - a.spent;

  const essentialSet = new Set<string>(ESSENTIAL_CATEGORIES);
  const discretionarySet = new Set<string>(DISCRETIONARY_CATEGORIES);

  const essentials = categories
    .filter((c) => essentialSet.has(c.category))
    .sort(sortBySpent);

  const discretionary = categories
    .filter((c) => discretionarySet.has(c.category))
    .sort(sortBySpent);

  const uncategorized = categories
    .filter(
      (c) =>
        !essentialSet.has(c.category) &&
        !discretionarySet.has(c.category)
    )
    .sort(sortBySpent);

  if (categories.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Target className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Comienza a registrar tus gastos
          </h3>
          <p className="text-base-content/60 max-w-md mx-auto">
            Aún no tienes gastos registrados. Una vez que los agregues, podrás
            ver el desglose por categoría y establecer límites de presupuesto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CategoryGroup
        title="Gastos Esenciales"
        icon={<Shield className="w-5 h-5 text-primary" />}
        items={essentials}
        editingCategory={editingCategory}
        savingCategory={savingCategory}
        onSetEditing={setEditingCategory}
        onSetLimit={handleSetLimit}
      />

      <div className="divider" />

      <CategoryGroup
        title="Gastos Discrecionales"
        icon={<Sparkles className="w-5 h-5 text-secondary" />}
        items={discretionary}
        editingCategory={editingCategory}
        savingCategory={savingCategory}
        onSetEditing={setEditingCategory}
        onSetLimit={handleSetLimit}
      />

      {uncategorized.length > 0 && (
        <>
          <div className="divider" />
          <CategoryGroup
            title="Otras Categorías"
            icon={<HelpCircle className="w-5 h-5 text-base-content/50" />}
            items={uncategorized}
            editingCategory={editingCategory}
            savingCategory={savingCategory}
            onSetEditing={setEditingCategory}
            onSetLimit={handleSetLimit}
          />
        </>
      )}
    </div>
  );
}
