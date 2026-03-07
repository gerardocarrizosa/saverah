'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardStatsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export function DashboardStats({ balance, totalIncome, totalExpenses }: DashboardStatsProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }
  }, []);

  // Save preference when changed
  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem('dashboardStatsVisible', newValue.toString());
  };

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex justify-end">
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-success/20' : 'bg-error/20'}`}>
                <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-success' : 'text-error'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content/70">Balance total</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-error'} truncate`}>
                  {formatMoney(balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Income */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content/70">Ingresos</p>
                <p className="text-2xl font-bold text-success truncate">
                  {formatMoney(totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expenses */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-error/20">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content/70">Gastos</p>
                <p className="text-2xl font-bold text-error truncate">
                  {formatMoney(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
