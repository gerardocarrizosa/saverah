'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type { Income, Expense, BudgetSummary } from '@/types/budget.types';

export function useBudget(initialData?: { income?: Income[]; expenses?: Expense[]; summary?: BudgetSummary }) {
  const [income, setIncome] = useState<Income[]>(initialData?.income || []);
  const [expenses, setExpenses] = useState<Expense[]>(initialData?.expenses || []);
  const [summary, setSummary] = useState<BudgetSummary | null>(initialData?.summary || null);
  const [loading, setLoading] = useState(!initialData?.income?.length);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeRes, expensesRes, summaryRes] = await Promise.all([
        api.get<{ data: Income[] }>('/budget/income'),
        api.get<{ data: Expense[] }>('/budget/expenses'),
        api.get<{ data: BudgetSummary }>('/budget/summary'),
      ]);
      setIncome(incomeRes.data.data);
      setExpenses(expensesRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData?.income?.length) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addIncome = async (data: Omit<Income, 'id' | 'user_id' | 'created_at'>) => {
    const res = await api.post<{ data: Income }>('/budget/income', data);
    setIncome((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const addExpense = async (data: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    const res = await api.post<{ data: Expense }>('/budget/expenses', data);
    setExpenses((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    const res = await api.patch<{ data: Expense }>(`/budget/expenses/${id}`, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data.data : e)));
    return res.data.data;
  };

  const deleteExpense = async (id: string) => {
    await api.delete(`/budget/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    income,
    expenses,
    summary,
    loading,
    error,
    refresh,
    addIncome,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
