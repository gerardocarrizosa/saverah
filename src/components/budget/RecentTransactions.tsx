'use client';

import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Briefcase,
  LineChart,
  Banknote,
  Utensils,
  Car,
  Home,
  Gamepad2,
  Heart,
  GraduationCap,
  Laptop,
  Zap,
  Shirt,
  PiggyBank,
  CreditCard,
} from 'lucide-react';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { Income, Expense } from '@/types/budget.types';

interface RecentTransactionsProps {
  income: Income[];
  expenses: Expense[];
}

const incomeTypeIcons: Record<string, React.ReactNode> = {
  steady: <Briefcase className="w-5 h-5" />,
  variable: <LineChart className="w-5 h-5" />,
  other: <Banknote className="w-5 h-5" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  Alimentación: <Utensils className="w-5 h-5" />,
  Transporte: <Car className="w-5 h-5" />,
  Vivienda: <Home className="w-5 h-5" />,
  Entretenimiento: <Gamepad2 className="w-5 h-5" />,
  Salud: <Heart className="w-5 h-5" />,
  Educación: <GraduationCap className="w-5 h-5" />,
  Tecnología: <Laptop className="w-5 h-5" />,
  Servicios: <Zap className="w-5 h-5" />,
  Ropa: <Shirt className="w-5 h-5" />,
  Ahorro: <PiggyBank className="w-5 h-5" />,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

export function RecentTransactions({
  income,
  expenses,
}: RecentTransactionsProps) {
  const recentIncome = income.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Income */}
      <div className="card bg-base-100 border border-base-300 rounded-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold">Últimos ingresos</h3>
            </div>
            <Link href="/budget/income" className="btn btn-ghost btn-sm gap-1">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentIncome.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-success/10">
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
              </div>
              <p className="text-base-content/60 mb-4">
                No hay ingresos registrados
              </p>
              <Link
                href="/budget/income"
                className="btn btn-success btn-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar ingreso
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentIncome.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10 text-success">
                      {incomeTypeIcons[item.type] || (
                        <Banknote className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.source}</p>
                      <p className="text-xs text-base-content/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.received_at)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card bg-base-100 border border-base-300 rounded-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-error/10">
                <TrendingDown className="w-5 h-5 text-error" />
              </div>
              <h3 className="font-semibold">Últimos gastos</h3>
            </div>
            <Link
              href="/budget/expenses"
              className="btn btn-ghost btn-sm gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-error/10">
                  <TrendingDown className="w-8 h-8 text-error" />
                </div>
              </div>
              <p className="text-base-content/60 mb-4">
                No hay gastos registrados
              </p>
              <Link
                href="/budget/expenses"
                className="btn btn-error btn-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar gasto
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-error/10 text-error">
                      {categoryIcons[item.category] || (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-base-content/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.spent_at)} • {item.category}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-error">
                    -{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
