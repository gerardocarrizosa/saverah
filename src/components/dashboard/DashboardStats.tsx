'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface DashboardStatsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  valueClass: string;
  formatMoney: (amount: number) => string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBgClass,
  iconClass,
  valueClass,
  formatMoney,
}: StatCardProps) {
  return (
    <div className="card bg-base-100">
      <div className="card-body p-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${iconBgClass}`}>
            <Icon className={`w-6 h-6 ${iconClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-content/70">{label}</p>
            <p className={`text-2xl font-bold ${valueClass} truncate`}>
              {formatMoney(value)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardStats({
  balance,
  totalIncome,
  totalExpenses,
}: DashboardStatsProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }

    // Listen for storage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardStatsVisible') {
        setIsVisible(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatMoney = (amount: number) => {
    if (!isVisible) return '****';
    return formatCurrency(amount);
  };

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Balance total"
          value={balance}
          icon={Wallet}
          iconBgClass={balance >= 0 ? 'bg-success/20' : 'bg-error/20'}
          iconClass={balance >= 0 ? 'text-success' : 'text-error'}
          valueClass={balance >= 0 ? 'text-success' : 'text-error'}
          formatMoney={formatMoney}
        />

        <StatCard
          label="Ingresos"
          value={totalIncome}
          icon={TrendingUp}
          iconBgClass="bg-success/20"
          iconClass="text-success"
          valueClass="text-success"
          formatMoney={formatMoney}
        />

        <StatCard
          label="Gastos"
          value={totalExpenses}
          icon={TrendingDown}
          iconBgClass="bg-error/20"
          iconClass="text-error"
          valueClass="text-error"
          formatMoney={formatMoney}
        />
      </div>
    </div>
  );
}
