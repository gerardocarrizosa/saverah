'use client';

import { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Check, 
  TrendingUp, 
  Loader2,
  PiggyBank,
  Percent,
  Edit2,
  X
} from 'lucide-react';
import api from '@/lib/axios';
import type { BudgetSummary } from '@/types/budget.types';

interface SavingsGoal {
  id: string;
  goal_type: 'fixed' | 'percentage';
  target_amount: number | null;
  target_percentage: number | null;
  month: number;
  year: number;
  is_active: boolean;
}

interface SavingsGoalsProps {
  budget: BudgetSummary;
}

export function SavingsGoals({ budget }: SavingsGoalsProps) {
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [goalType, setGoalType] = useState<'fixed' | 'percentage'>('percentage');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetPercentage, setTargetPercentage] = useState('20');

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    try {
      const response = await api.get('/dashboard/savings-goal');
      setGoal(response.data.data);
      if (response.data.data) {
        setGoalType(response.data.data.goal_type);
        if (response.data.data.target_amount) {
          setTargetAmount(response.data.data.target_amount.toString());
        }
        if (response.data.data.target_percentage) {
          setTargetPercentage(response.data.data.target_percentage.toString());
        }
      }
    } catch (error) {
      console.error('Error loading savings goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        goal_type: goalType,
        ...(goalType === 'fixed' 
          ? { target_amount: parseFloat(targetAmount) }
          : { target_percentage: parseFloat(targetPercentage) }
        ),
      };
      
      await api.post('/dashboard/savings-goal', payload);
      await loadGoal();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating savings goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!goal) return { percentage: 0, remaining: 0, target: 0 };
    
    const saved = Math.max(0, budget.balance);
    
    if (goal.goal_type === 'fixed' && goal.target_amount) {
      return {
        percentage: Math.min(100, (saved / goal.target_amount) * 100),
        remaining: Math.max(0, goal.target_amount - saved),
        target: goal.target_amount,
      };
    }
    
    if (goal.goal_type === 'percentage' && goal.target_percentage) {
      const target = (budget.total_income * goal.target_percentage) / 100;
      return {
        percentage: Math.min(100, (saved / target) * 100),
        remaining: Math.max(0, target - saved),
        target,
      };
    }
    
    return { percentage: 0, remaining: 0, target: 0 };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No goal set - Show creation form or prompt
  if (!goal) {
    if (showForm) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setGoalType('percentage')}
              className={`flex-1 btn btn-sm ${goalType === 'percentage' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Percent className="w-4 h-4 mr-1" />
              Porcentaje
            </button>
            <button
              type="button"
              onClick={() => setGoalType('fixed')}
              className={`flex-1 btn btn-sm ${goalType === 'fixed' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <PiggyBank className="w-4 h-4 mr-1" />
              Monto fijo
            </button>
          </div>

          {goalType === 'percentage' ? (
            <div className="form-control">
              <label className="label">
                <span className="label-text">¿Qué porcentaje de tus ingresos quieres ahorrar?</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(e.target.value)}
                  className="input input-bordered flex-1"
                  min="1"
                  max="100"
                  required
                />
                <span className="text-lg font-bold">%</span>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Meta estimada: {formatCurrency((budget.total_income * parseFloat(targetPercentage || '0')) / 100)}
                </span>
              </label>
            </div>
          ) : (
            <div className="form-control">
              <label className="label">
                <span className="label-text">¿Cuánto quieres ahorrar este mes?</span>
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="input input-bordered"
                min="1"
                step="0.01"
                placeholder="Ej: 5000"
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-ghost flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Guardar meta
                </>
              )}
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <p className="text-base-content/70 mb-2">No tienes una meta de ahorro para este mes</p>
        <p className="text-sm text-base-content/50 mb-4">
          Establece una meta y mantente motivado para alcanzarla
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Crear meta de ahorro
        </button>
      </div>
    );
  }

  // Goal exists - Show progress
  const progress = calculateProgress();
  const isCompleted = progress.percentage >= 100;

  return (
    <div className="space-y-4">
      {/* Goal header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20' : 'bg-primary/10'}`}>
            {isCompleted ? (
              <Check className={`w-5 h-5 ${isCompleted ? 'text-success' : 'text-primary'}`} />
            ) : (
              <Target className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">Meta de ahorro</p>
            <p className="text-xs text-base-content/60">
              {goal.goal_type === 'percentage' 
                ? `${goal.target_percentage}% de ingresos`
                : 'Monto fijo'
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-base-content/70">Progreso</span>
          <span className="font-medium">{Math.round(progress.percentage)}%</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isCompleted 
                ? 'bg-success' 
                : progress.percentage >= 75 
                  ? 'bg-warning' 
                  : 'bg-primary'
            }`}
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-base-200 rounded-xl">
          <p className="text-xs text-base-content/60 mb-1">Ahorrado</p>
          <p className="font-bold text-success">{formatCurrency(Math.max(0, budget.balance))}</p>
        </div>
        <div className="p-3 bg-base-200 rounded-xl">
          <p className="text-xs text-base-content/60 mb-1">Meta</p>
          <p className="font-bold">{formatCurrency(progress.target)}</p>
        </div>
      </div>

      {/* Status message */}
      {isCompleted ? (
        <div className="alert alert-success">
          <Check className="w-5 h-5" />
          <span>¡Felicitaciones! Has alcanzado tu meta de ahorro este mes 🎉</span>
        </div>
      ) : progress.remaining > 0 && (
        <div className="alert alert-info">
          <TrendingUp className="w-5 h-5" />
          <span>
            Te falta {formatCurrency(progress.remaining)} para alcanzar tu meta. 
            ¡Tú puedes! 💪
          </span>
        </div>
      )}

      {/* Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar meta de ahorro</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setGoalType('percentage')}
                  className={`flex-1 btn btn-sm ${goalType === 'percentage' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Percent className="w-4 h-4 mr-1" />
                  Porcentaje
                </button>
                <button
                  type="button"
                  onClick={() => setGoalType('fixed')}
                  className={`flex-1 btn btn-sm ${goalType === 'fixed' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <PiggyBank className="w-4 h-4 mr-1" />
                  Monto fijo
                </button>
              </div>

              {goalType === 'percentage' ? (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Porcentaje de ingresos</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetPercentage}
                      onChange={(e) => setTargetPercentage(e.target.value)}
                      className="input input-bordered flex-1"
                      min="1"
                      max="100"
                      required
                    />
                    <span className="text-lg font-bold">%</span>
                  </div>
                </div>
              ) : (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monto objetivo</span>
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="input input-bordered"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Actualizar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
