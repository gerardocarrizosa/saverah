'use client';

import Link from 'next/link';
import { 
  AlertTriangle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import type { CategorySummary } from '@/types/budget.types';

interface BudgetAlertsProps {
  categories: CategorySummary[];
}

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

export function BudgetAlerts({ categories }: BudgetAlertsProps) {
  // Filter categories with limit >= 80%
  const alertCategories = categories
    .filter((cat) => cat.limit !== null && (cat.percentage || 0) >= 80)
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 5);

  if (alertCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌟</div>
        <p className="text-base-content/60">¡Excelente control de presupuesto!</p>
        <p className="text-sm text-base-content/40 mt-1">
          Ninguna categoría excede el 80% del límite
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alertCategories.map((category) => {
        const percentage = category.percentage || 0;
        const isExceeded = percentage >= 100;
        const isWarning = percentage >= 80 && percentage < 100;

        let progressColor = 'bg-success';
        let badgeClass = 'badge-success';
        let alertIcon = null;

        if (isExceeded) {
          progressColor = 'bg-error';
          badgeClass = 'badge-error';
          alertIcon = <AlertCircle className="w-4 h-4" />;
        } else if (isWarning) {
          progressColor = 'bg-warning';
          badgeClass = 'badge-warning';
          alertIcon = <AlertTriangle className="w-4 h-4" />;
        }

        const excessAmount = isExceeded && category.limit
          ? category.spent - category.limit
          : 0;

        return (
          <div key={category.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryEmojis[category.category] || '📦'}</span>
                <span className="font-medium">{category.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${badgeClass} badge-sm gap-1`}>
                  {alertIcon}
                  {Math.round(percentage)}%
                </span>
                {isExceeded && (
                  <span className="text-xs text-error font-medium">
                    +{new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      maximumFractionDigits: 0,
                    }).format(excessAmount)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                }).format(category.spent)}
              </span>
              <span>/</span>
              <span>
                {category.limit && new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                }).format(category.limit)}
              </span>
            </div>

            <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {isExceeded && (
              <p className="text-xs text-error">
                ¡Has excedido el límite de esta categoría!
              </p>
            )}
            {isWarning && !isExceeded && (
              <p className="text-xs text-warning">
                Estás cerca del límite. ¡Ten cuidado!
              </p>
            )}
          </div>
        );
      })}

      {categories.filter((cat) => cat.limit && (cat.percentage || 0) >= 80).length > 5 && (
        <div className="flex justify-center mt-4">
          <Link
            href="/budget"
            className="btn btn-ghost btn-sm gap-1"
          >
            Ver todas las categorías
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
