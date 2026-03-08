'use client';

import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuickActionsPanel } from './QuickActions';

interface BudgetStatsContainerProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export function BudgetStatsContainer({
  totalIncome,
  totalExpenses,
  balance,
  incomeCount,
  expenseCount,
}: BudgetStatsContainerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }

    // Listen for changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardStatsVisible') {
        setIsVisible(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem('dashboardStatsVisible', newValue.toString());
    // Dispatch storage event for same-window synchronization
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dashboardStatsVisible',
        newValue: newValue.toString(),
      }),
    );
  };

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const colorClasses = {
    success: 'from-success/20 via-success/10 to-success/5 border-success/30',
    error: 'from-error/20 via-error/10 to-error/5 border-error/30',
    neutral: 'from-info/20 via-info/10 to-info/5 border-info/30',
  };

  const iconColors = {
    success: 'text-success',
    error: 'text-error',
    neutral: 'text-info',
  };

  return (
    <div className="space-y-6">
      {/* Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={toggleVisibility}
          className="btn btn-sm btn-ghost gap-2"
          title={isVisible ? 'Ocultar montos' : 'Mostrar montos'}
        >
          {isVisible ? (
            <>
              <span className="inline">Ocultar montos</span>
              <EyeOff className="w-5 h-5" />
            </>
          ) : (
            <>
              <span className="inline">Mostrar montos</span>
              <Eye className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses.success} border p-6`}
        >
          <div className="absolute top-4 right-4 text-3xl">📈</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-xl bg-base-100/50 ${iconColors.success}`}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-base-content/70">
                Ingresos totales
              </span>
            </div>
            <p className="text-3xl font-bold text-base-content">
              {formatMoney(totalIncome)}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses.error} border p-6`}
        >
          <div className="absolute top-4 right-4 text-3xl">📉</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-xl bg-base-100/50 ${iconColors.error}`}
              >
                <TrendingDown className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-base-content/70">
                Gastos totales
              </span>
            </div>
            <p className="text-3xl font-bold text-base-content">
              {formatMoney(totalExpenses)}
            </p>
          </div>
        </div>

        {/* Balance */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${balance >= 0 ? colorClasses.success : colorClasses.error} border p-6`}
        >
          <div className="absolute top-4 right-4 text-3xl">
            {balance >= 0 ? '✨' : '⚠️'}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-xl bg-base-100/50 ${balance >= 0 ? iconColors.success : iconColors.error}`}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-base-content/70">
                {balance >= 0 ? 'Balance positivo' : 'Balance negativo'}
              </span>
            </div>
            <p className="text-3xl font-bold text-base-content">
              {formatMoney(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions with visibility */}
      <QuickActionsPanel
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        incomeCount={incomeCount}
        expenseCount={expenseCount}
        isVisible={isVisible}
      />
    </div>
  );
}
