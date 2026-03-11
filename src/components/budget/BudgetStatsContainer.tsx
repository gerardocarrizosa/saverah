'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardStatsVisible') {
        setIsVisible(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // const toggleVisibility = () => {
  //   const newValue = !isVisible;
  //   setIsVisible(newValue);
  //   localStorage.setItem('dashboardStatsVisible', newValue.toString());
  //   window.dispatchEvent(
  //     new StorageEvent('storage', {
  //       key: 'dashboardStatsVisible',
  //       newValue: newValue.toString(),
  //     }),
  //   );
  // };

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // const flowPercentage =
  //   totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  // const savingsRate =
  //   totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Flow Visualization - The Signature Element */}
      <div className="card bg-base-100 border border-base-300 rounded-xl">
        <div className="card-body p-6">
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-base-content">
              Flujo de efectivo
            </h2>
            <button
              onClick={toggleVisibility}
              className="btn btn-ghost btn-sm gap-2"
              title={isVisible ? 'Ocultar montos' : 'Mostrar montos'}
            >
              {isVisible ? (
                <>
                  <span className="hidden sm:inline text-sm">Ocultar</span>
                  <EyeOff className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline text-sm">Mostrar</span>
                  <Eye className="w-4 h-4" />
                </>
              )}
            </button>
          </div> */}

          {/* Flow Bar */}
          {/* <div className="relative">
            <div className="h-3 bg-base-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(flowPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-base-content/60">
              <span>Gastos: {Math.round(flowPercentage)}% de ingresos</span>
              <span>Tasa de ahorro: {Math.round(savingsRate)}%</span>
            </div>
          </div> */}

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-base-200"> */}
          <div className="grid grid-cols-3 gap-4 border-base-200">
            {/* Income */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="p-1.5 rounded-lg bg-success/10">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm text-base-content/70">Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-base-content">
                {formatMoney(totalIncome)}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                {incomeCount} {incomeCount === 1 ? 'registro' : 'registros'}
              </p>
            </div>

            {/* Flow Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center text-base-content/30">
                <div className="w-px h-4 bg-base-300" />
                <div className="flex items-center gap-1 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  <span>Gastos</span>
                </div>
                <div className="w-px h-4 bg-base-300" />
              </div>
            </div>

            {/* Balance */}
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-2 justify-center sm:justify-end mb-2">
                <span className="text-sm text-base-content/70">Balance</span>
                <div
                  className={`p-1.5 rounded-lg ${balance >= 0 ? 'bg-success/10' : 'bg-error/10'}`}
                >
                  <Scale
                    className={`w-4 h-4 ${balance >= 0 ? 'text-success' : 'text-error'}`}
                  />
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-error'}`}
              >
                {formatMoney(balance)}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                {balance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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
