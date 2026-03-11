'use client';

import { useState, useEffect } from 'react';
import { Wallet, PiggyBank, CreditCard, Flame, Target } from 'lucide-react';
import api from '@/lib/axios';
import type { BudgetSummary } from '@/types/budget.types';
import type { SavingsGoal } from '@/types/dashboard.types';
import { formatCurrency } from '@/lib/utils/currency';

interface QuickStatsRowProps {
  budget: BudgetSummary;
}

export function QuickStatsRow({ budget }: QuickStatsRowProps) {
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [goalRes, streakRes, amountsRes] = await Promise.all([
          api
            .get('/dashboard/savings-goal')
            .catch(() => ({ data: { data: null } })),
          api
            .get('/dashboard/streak')
            .catch(() => ({ data: { data: { streak: 0 } } })),
          api
            .get('/dashboard/estimated-amounts')
            .catch(() => ({ data: { data: [] } })),
        ]);

        setSavingsGoal(goalRes.data.data);
        setStreak(streakRes.data.data.streak);

        // Calculate total due from estimated amounts
        const amounts = amountsRes.data.data || [];
        const total = amounts.reduce(
          (sum: number, a: { estimated_amount: number }) =>
            sum + (a.estimated_amount || 0),
          0,
        );
        setTotalDue(total);
      } catch (error) {
        console.error('Error loading quick stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate daily budget (remaining budget / remaining days)
  const calculateDailyBudget = (): number => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );
    const remainingDays = lastDayOfMonth.getDate() - today.getDate() + 1;

    if (remainingDays <= 0) return 0;
    return budget.balance / remainingDays;
  };

  // Calculate savings progress
  const calculateSavingsProgress = (): {
    percentage: number;
    remaining: number;
    target: number;
  } | null => {
    if (!savingsGoal) return null;

    if (savingsGoal.goal_type === 'fixed' && savingsGoal.target_amount) {
      const saved = Math.max(0, budget.balance);
      return {
        percentage: Math.min(100, (saved / savingsGoal.target_amount) * 100),
        remaining: Math.max(0, savingsGoal.target_amount - saved),
        target: savingsGoal.target_amount,
      };
    }

    if (
      savingsGoal.goal_type === 'percentage' &&
      savingsGoal.target_percentage
    ) {
      const target =
        (budget.total_income * savingsGoal.target_percentage) / 100;
      const saved = Math.max(0, budget.balance);
      return {
        percentage: Math.min(100, (saved / target) * 100),
        remaining: Math.max(0, target - saved),
        target,
      };
    }

    return null;
  };

  const dailyBudget = calculateDailyBudget();
  const savingsProgress = calculateSavingsProgress();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
            <div className="card-body p-2">
              <div className="h-16 bg-base-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Daily Budget */}
      <div className="card bg-base-100">
        <div className="card-body p-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-info/10">
              <Wallet className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">Puedes gastar hoy</p>
              <p className="text-2xl font-bold text-info">
                {formatCurrency(dailyBudget, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goal Progress */}
      <div className="card bg-base-100">
        <div className="card-body p-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-success/10">
              {savingsGoal ? (
                <Target className="w-6 h-6 text-success" />
              ) : (
                <PiggyBank className="w-6 h-6 text-success" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-base-content/60">
                {savingsGoal ? 'Meta mensual' : 'Sin meta definida'}
              </p>
              {savingsProgress ? (
                <div className="space-y-1">
                  <p className="text-xl font-bold text-success">
                    {Math.round(savingsProgress.percentage)}%
                  </p>
                  <div className="w-full bg-base-300 rounded-full h-1.5">
                    <div
                      className="bg-success h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(savingsProgress.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <button className="btn btn-sm btn-success mt-1 rounded">
                  <Target className="w-4 h-4 mr-1" />
                  Crear meta
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Due This Month */}
      <div className="card bg-base-100">
        <div className="card-body p-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-warning/10">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">Total vencimientos</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(totalDue, 0)}
              </p>
              <p className="text-xs text-base-content/50">Este mes estimado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="card bg-base-100">
        <div className="card-body p-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-error/10">
              <Flame className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">Racha de control</p>
              <p className="text-2xl font-bold text-error">
                {streak} {streak === 1 ? 'día' : 'días'}
              </p>
              <p className="text-xs text-base-content/50">
                {streak >= 7 ? '🔥 ¡Semana completa!' : '¡Sigue así!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
