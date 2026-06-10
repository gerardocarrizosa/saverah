import Link from 'next/link';
import { PlusCircle, AlarmPlus } from 'lucide-react';

export function QuickActionsBanner() {
  return (
    <div className="md:col-span-12 relative overflow-hidden rounded-xl bg-base-200 flex flex-col md:flex-row items-center justify-between p-10 group min-h-[180px]">
      <div className="relative z-10 max-w-md text-center md:text-left mb-8 md:mb-0">
        <h3 className="font-[family-name:var(--font-headline)] text-2xl text-base-content mb-2">
          Diseña tu futuro
        </h3>
        <p className="font-[family-name:var(--font-body)] text-sm text-base-content/60 leading-relaxed">
          Registra un gasto al instante o crea un recordatorio estratégico para
          mantener tu precisión financiera.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/budget/expenses/new"
          className="action-gradient text-primary-content font-[family-name:var(--font-headline)] text-sm px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl"
        >
          <PlusCircle className="w-5 h-5" />
          Registrar gasto
        </Link>
        <Link
          href="/reminders/new"
          className="bg-base-300 text-base-content font-[family-name:var(--font-headline)] text-sm px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-base-content/10 transition-colors"
        >
          <AlarmPlus className="w-5 h-5" />
          Nuevo recordatorio
        </Link>
      </div>

      {/* Abstract Decor */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    </div>
  );
}
