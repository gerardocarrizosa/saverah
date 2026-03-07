'use client';

import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { ExpenseForm } from '@/components/budget/ExpenseForm';
import { ExpenseList } from '@/components/budget/ExpenseList';
import { Receipt, TrendingDown, Loader2 } from 'lucide-react';
import type { Expense } from '@/types/budget.types';

export default function ExpensesPage() {
  const { expenses, loading, error, refresh, deleteExpense } = useBudget();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSuccess = () => {
    refresh();
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
      await refresh();
    } catch {
      // Error is handled in the hook
    } finally {
      setDeletingId(null);
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Gastos
          </h1>
          <p className="text-gray-600 mt-1">
            Registra y gestiona tus gastos por categoría
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-error" />
                {editingExpense ? 'Editar gasto' : 'Registrar nuevo gasto'}
              </h2>
              <div className="divider my-2"></div>
              <ExpenseForm
                onSuccess={handleSuccess}
                onCancel={editingExpense ? handleCancelEdit : undefined}
                editExpense={editingExpense}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="stats shadow w-full">
            <div className="stat bg-error/10">
              <div className="stat-title">Total de gastos</div>
              <div className="stat-value text-error">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(totalExpenses)}
              </div>
              <div className="stat-desc">
                {expenses.length} {expenses.length === 1 ? 'registro' : 'registros'}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Historial de gastos</h2>
              <div className="divider my-2"></div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
