"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Target,
  Loader2,
  X,
  CircleCheck,
} from "lucide-react";
import type { CategorySummary } from "@/types/budget.types";
import api from "@/lib/axios";
import { formatCurrency } from "@/lib/utils/currency";
import { useRouter } from "next/navigation";

interface CategoryGridProps {
  categories: CategorySummary[];
}

function BudgetLimitForm({
  currentLimit,
  onSave,
  onCancel,
  categoryName,
}: {
  currentLimit: number | null;
  onSave: (limit: number) => void;
  onCancel: () => void;
  categoryName: string;
}) {
  const [limit, setLimit] = useState(currentLimit?.toString() || "");
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
    <form
      onSubmit={handleSubmit}
      className="space-y-3 mt-4 pt-4 border-t border-base-300"
    >
      <p className="text-sm text-base-content/70">
        Establece un límite mensual para {categoryName.toLowerCase()}
      </p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 text-sm">
            $
          </span>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full bg-base-300 border-none text-sm font-medium px-4 py-3 rounded-xl pl-7 focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Límite mensual"
            min="1"
            step="0.01"
            disabled={saving}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="p-3 bg-success/10 text-success rounded-xl hover:bg-success/20 transition-colors disabled:opacity-50"
          disabled={saving || !limit}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CircleCheck className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-3 bg-base-300 text-base-content/60 rounded-xl hover:bg-base-300/80 transition-colors disabled:opacity-50"
          disabled={saving}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
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
  const isExceeded = category.status === "exceeded";
  const isWarning = category.status === "warning";

  let progressColor = "bg-primary";
  if (isExceeded) progressColor = "bg-error";
  else if (isWarning) progressColor = "bg-secondary";

  const statusConfig = {
    exceeded: {
      icon: <AlertCircle className="w-4 h-4" />,
      label: "¡Límite excedido!",
      textColor: "text-error",
      bgColor: "bg-error/10",
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: "Cerca del límite",
      textColor: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    ok: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Dentro del presupuesto",
      textColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  };

  const status = statusConfig[category.status];

  return (
    <div className="bg-base-200 p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-start">
        {/* <div className="bg-base-300 p-3 rounded-lg">
          <span
            className={
              isExceeded
                ? 'text-error'
                : isWarning
                  ? 'text-secondary'
                  : 'text-primary'
            }
          >
            {categoryIcons[category.category] || (
              <MoreHorizontal className="w-5 h-5" />
            )}
          </span>
        </div> */}
        {/* <div className="flex flex-col items-end gap-1"> */}
        <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-bold uppercase tracking-wider">
          {category.category}
        </p>
        {category.limit && (
          <span
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${status.textColor}`}
          >
            {status.icon}
            {status.label}
          </span>
        )}
        {/* </div> */}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className={isExceeded ? "text-error" : "text-base-content"}>
            {formatCurrency(category.spent, 0)}
          </span>
          {category.limit ? (
            <span className="text-base-content/50">
              Límite {formatCurrency(category.limit, 0)}
            </span>
          ) : (
            <button
              onClick={() => onSetEditing(category.category)}
              className="text-xs text-base-content/50 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Target className="w-3 h-3" />
              Fijar límite
            </button>
          )}
        </div>

        {category.limit && (
          <>
            <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-base-content/40">
              <span>0%</span>
              <span>{Math.round(percentage)}%</span>
            </div>
          </>
        )}
      </div>

      {editingCategory === category.category && !category.limit && (
        <BudgetLimitForm
          currentLimit={category.limit}
          categoryName={category.category}
          onSave={(limit) => onSetLimit(category.category, limit)}
          onCancel={() => onSetEditing(null)}
        />
      )}

      {savingCategory === category.category && (
        <div className="flex items-center gap-2 text-sm text-info">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Guardando límite...</span>
        </div>
      )}
    </div>
  );
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleSetLimit = async (category: string, limit: number) => {
    setSavingCategory(category);
    try {
      await api.post("/budget/limits", { category, monthly_limit: limit });
      setEditingCategory(null);
      router.refresh();
    } catch {
      // Error handled silently; UI will reset
    } finally {
      setSavingCategory(null);
    }
  };

  const sortBySpent = (a: CategorySummary, b: CategorySummary) =>
    b.spent - a.spent;
  const sortedCategories = [...categories].sort(sortBySpent);

  if (categories.length === 0) {
    return (
      <div className="bg-base-200 rounded-xl p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Target className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 font-[family-name:var(--font-headline)]">
          Comienza a registrar tus gastos
        </h3>
        <p className="text-base-content/60 max-w-md mx-auto">
          Aún no tienes gastos registrados. Una vez que los agregues, podrás ver
          el desglose por categoría y establecer límites de presupuesto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight px-2">
        Desglose por categoría
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.category}
            category={category}
            editingCategory={editingCategory}
            savingCategory={savingCategory}
            onSetEditing={setEditingCategory}
            onSetLimit={handleSetLimit}
          />
        ))}

        {/* New Category CTA */}
        {/* <div className="bg-base-200/50 border-2 border-dashed border-base-content/10 p-6 rounded-xl flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-primary/30 transition-colors">
          <CirclePlus className="w-8 h-8 text-base-content/30 group-hover:text-primary transition-colors" />
          <p className="font-[family-name:var(--font-body)] text-xs font-bold tracking-widest text-base-content/40 uppercase">
            Nueva categoría
          </p>
        </div> */}
      </div>
    </div>
  );
}
