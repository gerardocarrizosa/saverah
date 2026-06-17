'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface DashboardHeroProps {
  balance: number;
}

export function DashboardHero({ balance }: DashboardHeroProps) {
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
    <section className="space-y-2">
      <div className="flex items-center gap-3 ml-1">
        <p className="font-[family-name:var(--font-body)] text-base-content/60 text-[0.6875rem] uppercase tracking-[0.2em] font-medium">
          Balance total
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

      <h1 className="font-[family-name:var(--font-headline)] text-[3.5rem] font-extrabold leading-none tracking-tight text-base-content">
        {balanceWhole}
        <span className="text-secondary/40">.{balanceCents}</span>
      </h1>
    </section>
  );
}
