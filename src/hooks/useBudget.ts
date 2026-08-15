'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type {
  Income,
  Expense,
  BudgetSummary,
  BudgetLimit,
  CreateExpensePayload,
  CreateExpenseResponse,
  DeleteExpenseScope,
  DeleteExpenseResult,
} from '@/types/budget.types';

export function useBudget(initialData?: { income?: Income[]; expenses?: Expense[]; summary?: BudgetSummary }) {
  const [income, setIncome] = useState<Income[]>(initialData?.income || []);
  const [expenses, setExpenses] = useState<Expense[]>(initialData?.expenses || []);
  const [summary, setSummary] = useState<BudgetSummary | null>(initialData?.summary || null);
  const [loading, setLoading] = useState(!initialData?.income?.length);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (month?: string) => {
    setLoading(true);
    setError(null);
    try {
      const config = month ? { params: { month } } : undefined;
      const [incomeRes, expensesRes, summaryRes] = await Promise.all([
        api.get<{ data: Income[] }>('/budget/income', config),
        api.get<{ data: Expense[] }>('/budget/expenses', config),
        api.get<{ data: BudgetSummary }>('/budget/summary', config),
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

  const addExpense = async (data: CreateExpensePayload) => {
    const res = await api.post<{ data: CreateExpenseResponse }>('/budget/expenses', data);
    const createdExpenses = Array.isArray(res.data.data)
      ? res.data.data
      : [res.data.data];
    setExpenses((prev) => [...createdExpenses, ...prev]);
    return res.data.data;
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    const res = await api.patch<{ data: Expense }>(`/budget/expenses/${id}`, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data.data : e)));
    return res.data.data;
  };

  const deleteExpense = async (id: string, scope: DeleteExpenseScope = 'single') => {
    const res = await api.delete<{ data: DeleteExpenseResult }>(
      `/budget/expenses/${id}`,
      { params: { scope } },
    );

    if (scope === 'series') {
      const deleted = expenses.find((expense) => expense.id === id);
      const groupId = deleted?.installment_group_id;
      setExpenses((prev) =>
        groupId
          ? prev.filter((expense) => expense.installment_group_id !== groupId)
          : prev.filter((expense) => expense.id !== id),
      );
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }

    return res.data.data;
  };

  const updateIncome = async (id: string, data: Partial<Income>) => {
    const res = await api.patch<{ data: Income }>(`/budget/income/${id}`, data);
    setIncome((prev) => prev.map((i) => (i.id === id ? res.data.data : i)));
    return res.data.data;
  };

  const deleteIncome = async (id: string) => {
    await api.delete(`/budget/income/${id}`);
    setIncome((prev) => prev.filter((i) => i.id !== id));
  };

  const setBudgetLimit = async (category: string, monthly_limit: number) => {
    const res = await api.post<{ data: BudgetLimit }>('/budget/limits', { category, monthly_limit });
    return res.data.data;
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
    updateIncome,
    deleteIncome,
    setBudgetLimit,
  };
}
