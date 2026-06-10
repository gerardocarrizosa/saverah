'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface BudgetHeroProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export function BudgetHero({
  totalIncome,
  totalExpenses,
  balance,
  incomeCount,
  expenseCount,
}: BudgetHeroProps) {
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

  const toggleVisibility = () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem('dashboardStatsVisible', String(next));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dashboardStatsVisible',
        newValue: String(next),
      }),
    );
  };

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return formatCurrency(amount, 0);
  };

  const balanceStr = formatMoney(balance);
  const [balanceWhole, balanceCents] = balanceStr.includes('.')
    ? balanceStr.split('.')
    : [balanceStr, '00'];

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
      {/* Left: Main Balance */}
      <div className="md:col-span-7">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">
            Rendimiento mensual
          </p>
          <button
            onClick={toggleVisibility}
            className="text-base-content/40 hover:text-base-content transition-colors p-1 rounded-full"
            aria-label={isVisible ? 'Ocultar montos' : 'Mostrar montos'}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <h1 className="font-[family-name:var(--font-headline)] font-bold text-5xl md:text-7xl tracking-tighter text-base-content leading-none mb-6">
          {balanceWhole}
          <span className="text-base-content/40">.{balanceCents}</span>
        </h1>
        <div className="flex gap-4 items-center">
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-[family-name:var(--font-body)] text-xs font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {balance >= 0 ? 'Superávit' : 'Déficit'} este mes
          </span>
          <span className="text-xs text-base-content/50">
            {incomeCount + expenseCount}{' '}
            {incomeCount + expenseCount === 1 ? 'transacción' : 'transacciones'}
          </span>
        </div>
      </div>

      {/* Right: Income & Spent Cards */}
      <div className="md:col-span-5 grid grid-cols-2 gap-4">
        <div className="bg-base-200 p-6 rounded-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex flex-1 justify-between">
              <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-medium uppercase tracking-wider">
                Ingresos
              </p>
              <p className="text-[10px] text-base-content/40">
                {incomeCount} {incomeCount === 1 ? 'registro' : 'registros'}
              </p>
            </div>
          </div>
          <p className="font-[family-name:var(--font-headline)] text-2xl font-bold text-secondary">
            {formatMoney(totalIncome)}
          </p>
        </div>

        <div className="bg-base-200 p-6 rounded-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex flex-1 justify-between">
              <p className="font-[family-name:var(--font-body)] text-base-content/60 text-xs font-medium uppercase tracking-wider">
                Gastos
              </p>
              <p className="text-[10px] text-base-content/40">
                {expenseCount} {expenseCount === 1 ? 'registro' : 'registros'}
              </p>
            </div>
          </div>
          <p className="font-[family-name:var(--font-headline)] text-2xl font-bold text-accent">
            {formatMoney(totalExpenses)}
          </p>
        </div>
      </div>
    </section>
  );
}
