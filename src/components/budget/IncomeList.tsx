import Link from "next/link";
import type { Income } from "@/types/budget.types";
import { Calendar, Wallet } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";
import { DeleteIncomeButton } from "@/components/budget/DeleteIncomeButton";

interface IncomeListProps {
  income: Income[];
}

function getTypeColor(type: string): string {
  switch (type) {
    case "steady":
      return "text-success";
    case "variable":
      return "text-secondary";
    default:
      return "text-base-content/60";
  }
}

function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    steady: "Fijo",
    variable: "Variable",
    other: "Otro",
  };
  return typeMap[type] || type;
}

export function IncomeList({ income }: IncomeListProps) {
  if (income.length === 0) {
    return (
      <div className="bg-base-200 rounded-2xl p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-3xl bg-linear-to-br from-success/10 via-primary/10 to-secondary/10">
            <Wallet className="w-12 h-12 text-success" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 font-(family-name:--font-headline)">
          No hay ingresos registrados
        </h2>
        <p className="text-base-content/60 max-w-lg mx-auto mb-8">
          Agrega tu primer ingreso para comenzar a monitorear tus fuentes de
          ingreso.
        </p>
        <Link
          href="/budget/income/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-success/10 text-success rounded-full text-sm font-bold hover:bg-success/20 transition-colors"
        >
          <Wallet className="w-5 h-5" />
          Registrar primer ingreso
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-2xl overflow-hidden">
      {income.map((item) => {
        return (
          <div
            key={item.id}
            className="group flex items-center justify-between p-4 hover:bg-base-300 transition-colors border-b border-base-content/5 last:border-b-0"
          >
            <Link
              href={`/budget/income/${item.id}/edit`}
              className="flex items-center gap-5 flex-1 min-w-0"
            >
              {/* <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center border border-base-content/10 shrink-0">
                <Wallet className="w-5 h-5 text-base-content/60" />
              </div> */}
              <div className="min-w-0">
                <h4 className="font-(family-name:--font-headline) font-bold text-base-content truncate">
                  {item.source}
                </h4>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span
                    className={`font-(family-name:--font-body) text-[10px] uppercase tracking-widest font-bold ${getTypeColor(item.type)}`}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.received_at, { includeYear: false })}
                  </span>
                  {item.notes && (
                    <span className="font-(family-name:--font-body) text-[10px] text-base-content/40 uppercase tracking-wider truncate max-w-50">
                      {item.notes}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4 shrink-0 ml-4">
              <span className="font-(family-name:--font-headline) text-base-content">
                +{formatCurrency(item.amount)}
              </span>

              <DeleteIncomeButton
                incomeId={item.id}
                className="inline-flex items-center gap-1.5 p-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
