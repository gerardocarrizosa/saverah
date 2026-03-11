'use client';

import { useState, useRef } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { IncomeForm } from '@/components/budget/IncomeForm';
import { IncomeList } from '@/components/budget/IncomeList';
import { Wallet, TrendingUp, Loader2, TrendingDown } from 'lucide-react';
import type { Income } from '@/types/budget.types';

export default function IncomePage() {
  const { income, loading, error, refresh, deleteIncome } = useBudget();
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSuccess = () => {
    refresh();
    if (editingIncome) {
      setEditingIncome(null);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteIncome(id);
    } catch (err) {
      console.error('Error deleting income:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Ingresos
          </h1>
          <p className="text-gray-600 mt-1">
            Registra y gestiona tus fuentes de ingreso
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4" ref={formRef}>
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                {editingIncome ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-warning" />
                    Editar ingreso
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-success" />
                    Registrar nuevo ingreso
                  </>
                )}
              </h2>
              <div className="divider my-2"></div>
              <IncomeForm 
                onSuccess={handleSuccess} 
                onCancel={handleCancelEdit}
                editIncome={editingIncome}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="stats shadow w-full">
            <div className="stat bg-success/10">
              <div className="stat-title">Total de ingresos</div>
              <div className="stat-value text-success">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(totalIncome)}
              </div>
              <div className="stat-desc">
                {income.length} {income.length === 1 ? 'registro' : 'registros'}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Historial de ingresos</h2>
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
                <IncomeList 
                  income={income} 
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
