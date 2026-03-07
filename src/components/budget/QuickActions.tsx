'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  isVisible = true
}: QuickActionsPanelProps) {
  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Income Card */}
      <Link 
        href="/budget/income"
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/20 via-success/10 to-success/5 border border-success/30 p-6 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-success/20"
      >
        <div className="absolute top-4 right-4 text-4xl">💰</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-success/20">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <span className="text-sm font-medium text-success">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-base-content mb-1">
            {formatMoney(totalIncome)}
          </p>
          <p className="text-sm text-base-content/60 mb-4">
            {incomeCount} {incomeCount === 1 ? 'registro' : 'registros'}
          </p>
          <div className="flex items-center gap-2 text-success font-medium group-hover:gap-3 transition-all">
            <Plus className="w-4 h-4" />
            <span>Agregar ingreso</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all" />
      </Link>

      {/* Expenses Card */}
      <Link 
        href="/budget/expenses"
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-error/20 via-error/10 to-error/5 border border-error/30 p-6 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-error/20"
      >
        <div className="absolute top-4 right-4 text-4xl">💸</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-error/20">
              <TrendingDown className="w-6 h-6 text-error" />
            </div>
            <span className="text-sm font-medium text-error">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-base-content mb-1">
            {formatMoney(totalExpenses)}
          </p>
          <p className="text-sm text-base-content/60 mb-4">
            {expenseCount} {expenseCount === 1 ? 'registro' : 'registros'}
          </p>
          <div className="flex items-center gap-2 text-error font-medium group-hover:gap-3 transition-all">
            <Plus className="w-4 h-4" />
            <span>Agregar gasto</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-all" />
      </Link>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'success' | 'error' | 'neutral';
  emoji: string;
  isVisible?: boolean;
}

export function StatCard({ title, value, icon, color, emoji, isVisible = true }: StatCardProps) {
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

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6`}>
      <div className="absolute top-4 right-4 text-3xl">{emoji}</div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl bg-base-100/50 ${iconColors[color]}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-base-content/70">{title}</span>
        </div>
        <p className="text-3xl font-bold text-base-content">
          {formatMoney(value)}
        </p>
      </div>
    </div>
  );
}

export function AmountVisibilityToggle() {
  const [isVisible, setIsVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }
  }, []);

  // Save preference when changed and dispatch event for other components
  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem('dashboardStatsVisible', newValue.toString());
    // Dispatch custom event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dashboardStatsVisible',
      newValue: newValue.toString(),
    }));
  };

  return (
    <button
      onClick={toggleVisibility}
      className="btn btn-sm btn-ghost gap-2"
      title={isVisible ? 'Ocultar montos' : 'Mostrar montos'}
    >
      {isVisible ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="hidden sm:inline">Ocultar montos</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Mostrar montos</span>
        </>
      )}
    </button>
  );
}

// Hook to share visibility state across components
export function useAmountVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }

    // Listen for changes from other components
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
