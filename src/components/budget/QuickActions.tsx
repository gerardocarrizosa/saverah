'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/currency';

interface QuickActionsPanelProps {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  isVisible?: boolean;
}

export function QuickActionsPanel({
  totalIncome,
  totalExpenses,
  incomeCount,
  expenseCount,
  isVisible = true,
}: QuickActionsPanelProps) {
  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return formatCurrency(amount, 0);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Income Card */}
      <Link
        href="/budget/income"
        className="group card bg-base-100 border border-base-300 hover:border-success/40 transition-all rounded-xl"
      >
        <div className="card-body p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10 text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-base-content/70">Ingresos</p>
                <p className="text-xl font-bold text-base-content">
                  {formatMoney(totalIncome)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-base-content/50">
                {incomeCount} registros
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200 text-success text-sm font-medium group-hover:gap-3 transition-all">
            <Plus className="w-4 h-4" />
            <span>Agregar ingreso</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Expenses Card */}
      <Link
        href="/budget/expenses"
        className="group card bg-base-100 border border-base-300 hover:border-error/40 transition-all rounded-xl"
      >
        <div className="card-body p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-error/10 text-error">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-base-content/70">Gastos</p>
                <p className="text-xl font-bold text-base-content">
                  {formatMoney(totalExpenses)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-base-content/50">
                {expenseCount} registros
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200 text-error text-sm font-medium group-hover:gap-3 transition-all">
            <Plus className="w-4 h-4" />
            <span>Agregar gasto</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'success' | 'error' | 'neutral';
  isVisible?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  color,
  isVisible = true,
}: StatCardProps) {
  const colorClasses = {
    success: 'bg-success/10 text-success border-success/30',
    error: 'bg-error/10 text-error border-error/30',
    neutral: 'bg-info/10 text-info border-info/30',
  };

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`card border ${colorClasses[color]}`}>
      <div className="card-body p-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${color === 'success' ? 'bg-success/20' : color === 'error' ? 'bg-error/20' : 'bg-info/20'}`}
          >
            {icon}
          </div>
          <span className="text-sm text-base-content/70">{title}</span>
        </div>
        <p className="text-2xl font-bold text-base-content mt-3">
          {formatMoney(value)}
        </p>
      </div>
    </div>
  );
}

// Hook to share visibility state across components
export function useAmountVisibility() {
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

  return isVisible;
}
