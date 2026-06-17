import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";

interface BudgetOverviewCardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function BudgetOverviewCard({
  totalIncome,
  totalExpenses,
  balance,
}: BudgetOverviewCardProps) {
  const percentage =
    totalIncome > 0
      ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100))
      : 0;

  return (
    <div className="bg-base-200 rounded-xl p-8 flex flex-col justify-between min-h-[320px]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-[family-name:var(--font-headline)] text-xl text-base-content">
            Resumen de presupuesto
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm text-base-content/60 mt-1">
            Umbral de gasto mensual
          </p>
        </div>
        <div className="text-right">
          <span className="font-[family-name:var(--font-headline)] text-2xl text-base-content">
            {percentage}%
          </span>
          <p className="font-[family-name:var(--font-body)] text-[10px] uppercase text-base-content/60 tracking-widest">
            Gastado
          </p>
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="mt-8">
        <div className="relative h-6 bg-base-300 rounded-xl overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 kinetic-gradient rounded-xl transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
          {percentage < 100 && (
            <div
              className="absolute inset-y-0 bg-white/10 w-px"
              style={{ left: `${percentage}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-base-content/40">0%</span>
          <span className="text-xs text-base-content/40">100%</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-base-content/10">
        <div>
          <p className="font-[family-name:var(--font-body)] text-[10px] uppercase text-base-content/60 tracking-widest">
            Restante
          </p>
          <p className="font-[family-name:var(--font-headline)] text-lg text-primary">
            {formatCurrency(balance, 0)}
          </p>
        </div>
        <Link
          href="/budget"
          className="font-[family-name:var(--font-body)] text-sm text-primary hover:underline transition-all"
        >
          Ir a presupuesto
        </Link>
      </div>
    </div>
  );
}
