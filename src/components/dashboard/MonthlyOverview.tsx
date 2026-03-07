'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingUp as TrendingSame,
  ArrowUp,
  ArrowDown,
  Loader2,
  Calendar
} from 'lucide-react';
import api from '@/lib/axios';
import type { BudgetSummary } from '@/types/budget.types';

interface MonthlyOverviewProps {
  currentBudget: BudgetSummary;
}

interface TrendData {
  direction: 'up' | 'down' | 'same';
  percentage: number;
  isPositive: boolean;
  message: string;
}

export function MonthlyOverview({ currentBudget }: MonthlyOverviewProps) {
  const [lastMonth, setLastMonth] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLastMonth = async () => {
      try {
        const response = await api.get('/dashboard/last-month');
        setLastMonth(response.data.data);
      } catch (error) {
        console.error('Error loading last month summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLastMonth();
  }, []);

  // Get current month name
  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const getLastMonthName = () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth.toLocaleDateString('es-MX', { month: 'long' });
  };

  const calculateTrend = (current: number, previous: number): TrendData => {
    if (previous === 0) {
      return {
        direction: 'same',
        percentage: 0,
        isPositive: true,
        message: 'Sin datos del mes anterior',
      };
    }

    const diff = ((current - previous) / previous) * 100;
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
    const isPositive = diff > 0;
    
    let message = '';
    if (Math.abs(diff) < 1) {
      message = 'Sin cambios significativos';
    } else if (isPositive) {
      message = diff > 10 ? '¡Excelente!' : 'Bien hecho';
    } else {
      message = diff < -10 ? 'Necesitas atención' : 'Cuidado';
    }

    return {
      direction,
      percentage: Math.abs(diff),
      isPositive,
      message,
    };
  };

  const incomeTrend = lastMonth ? calculateTrend(currentBudget.total_income, lastMonth.total_income) : null;
  const expenseTrend = lastMonth ? calculateTrend(currentBudget.total_expenses, lastMonth.total_expenses) : null;
  const balanceTrend = lastMonth ? calculateTrend(currentBudget.balance, lastMonth.balance) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lastMonth) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
        <p className="text-base-content/60">No hay datos del mes anterior</p>
        <p className="text-sm text-base-content/40 mt-1">
          Registra tus transacciones para ver comparativas
        </p>
      </div>
    );
  }

  const getTrendIcon = (trend: TrendData | null) => {
    if (!trend || trend.direction === 'same') return <TrendingSame className="w-4 h-4" />;
    return trend.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getTrendColor = (trend: TrendData | null, type: 'income' | 'expenses' | 'balance') => {
    if (!trend) return 'text-base-content/60';
    
    if (trend.direction === 'same') return 'text-base-content/60';
    
    if (type === 'expenses') {
      // For expenses, down is good
      return trend.direction === 'down' ? 'text-success' : 'text-error';
    }
    
    // For income and balance, up is good
    return trend.direction === 'up' ? 'text-success' : 'text-error';
  };

  const getTrendBg = (trend: TrendData | null, type: 'income' | 'expenses' | 'balance') => {
    if (!trend) return 'bg-base-200';
    
    if (trend.direction === 'same') return 'bg-base-200';
    
    if (type === 'expenses') {
      return trend.direction === 'down' ? 'bg-success/10' : 'bg-error/10';
    }
    
    return trend.direction === 'up' ? 'bg-success/10' : 'bg-error/10';
  };

  const savingsDifference = currentBudget.balance - lastMonth.balance;

  return (
    <div className="space-y-4">
      {/* Month comparison header */}
      <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          Comparando {getCurrentMonthName()} vs {getLastMonthName()}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income */}
        <div className={`p-4 rounded-xl ${getTrendBg(incomeTrend, 'income')} border border-base-300`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-success/20">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-base-content/70">Ingresos</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(currentBudget.total_income)}
          </p>
          {incomeTrend && incomeTrend.direction !== 'same' && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(incomeTrend, 'income')}`}>
              {getTrendIcon(incomeTrend)}
              <span>{Math.round(incomeTrend.percentage)}%</span>
            </div>
          )}
          <p className="text-xs text-base-content/50 mt-1">
            vs {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(lastMonth.total_income)} el mes pasado
          </p>
        </div>

        {/* Expenses */}
        <div className={`p-4 rounded-xl ${getTrendBg(expenseTrend, 'expenses')} border border-base-300`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-error/20">
              <TrendingDown className="w-5 h-5 text-error" />
            </div>
            <span className="text-sm text-base-content/70">Gastos</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(currentBudget.total_expenses)}
          </p>
          {expenseTrend && expenseTrend.direction !== 'same' && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(expenseTrend, 'expenses')}`}>
              {getTrendIcon(expenseTrend)}
              <span>{Math.round(expenseTrend.percentage)}%</span>
            </div>
          )}
          <p className="text-xs text-base-content/50 mt-1">
            vs {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(lastMonth.total_expenses)} el mes pasado
          </p>
        </div>

        {/* Balance */}
        <div className={`p-4 rounded-xl ${getTrendBg(balanceTrend, 'balance')} border border-base-300`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${currentBudget.balance >= 0 ? 'bg-success/20' : 'bg-error/20'}`}>
              <TrendingUp className={`w-5 h-5 ${currentBudget.balance >= 0 ? 'text-success' : 'text-error'}`} />
            </div>
            <span className="text-sm text-base-content/70">Balance</span>
          </div>
          <p className={`text-2xl font-bold ${currentBudget.balance >= 0 ? 'text-success' : 'text-error'}`}>
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(currentBudget.balance)}
          </p>
          {balanceTrend && balanceTrend.direction !== 'same' && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(balanceTrend, 'balance')}`}>
              {getTrendIcon(balanceTrend)}
              <span>{Math.round(balanceTrend.percentage)}%</span>
            </div>
          )}
          <p className="text-xs text-base-content/50 mt-1">
            vs {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              maximumFractionDigits: 0,
            }).format(lastMonth.balance)} el mes pasado
          </p>
        </div>
      </div>

      {/* Motivational message */}
      {savingsDifference !== 0 && (
        <div className={`alert ${savingsDifference > 0 ? 'alert-success' : 'alert-warning'} mt-4`}>
          <div className="flex-1">
            <p className="text-sm">
              {savingsDifference > 0 ? (
                <>
                  <strong>¡Has ahorrado {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    maximumFractionDigits: 0,
                  }).format(savingsDifference)} más que el mes pasado!</strong> 🎉
                </>
              ) : (
                <>
                  <strong>Este mes has gastado {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    maximumFractionDigits: 0,
                  }).format(Math.abs(savingsDifference))} más que el mes pasado.</strong> ¡Ánimo para el próximo! 💪
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
