import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function QuickLogPanel() {
  return (
    <div className="space-y-6">
      <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight px-2">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Add Income */}
        <Link
          href="/budget/income/new"
          className="group flex flex-col bg-base-200 p-6 rounded-xl hover:bg-base-300 transition-colors"
        >
          <div className="flex flex-col flex-1">
            <h3 className="font-semibold text-base-content mb-1">
              Registrar ingreso
            </h3>
            <p className="text-xs text-base-content/50 mb-4">
              Salario, freelance, inversiones...
            </p>
          </div>
          <div className="flex items-center gap-2 text-secondary text-sm font-medium group-hover:gap-3 transition-all">
            <span>Agregar</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Add Expense */}
        <Link
          href="/budget/expenses/new"
          className="group flex flex-col bg-base-200 p-6 rounded-xl hover:bg-base-300 transition-colors"
        >
          <div className="flex flex-col flex-1">
            <h3 className="font-semibold text-base-content mb-1">
              Registrar gasto
            </h3>
            <p className="text-xs text-base-content/50 mb-4">
              Compras, servicios, suscripciones...
            </p>
          </div>
          <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
            <span>Agregar</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* View Details */}
        {/* <Link
          href="/budget/expenses"
          className="group flex bg-base-200/50 p-6 rounded-xl hover:bg-base-200 transition-colors border border-base-300/50"
        >
          <div className="flex flex-col flex-1">
            <h3 className="font-semibold text-base-content mb-1">
              Ver detalles
            </h3>
            <p className="text-xs text-base-content/50 mb-4">
              Revisa todos tus movimientos
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
            <span>Explorar</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link> */}
      </div>
    </div>
  );
}
