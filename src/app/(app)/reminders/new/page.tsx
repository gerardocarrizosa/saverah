import { ReminderForm } from '@/components/reminders/ReminderForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nuevo Recordatorio | Saverah',
  description: 'Crea un nuevo recordatorio de pago',
};

export default function NewReminderPage() {
  return (
    <div className="p-4 space-y-6">
      {/* Header Section - Clean with back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/reminders"
          className="btn btn-ghost btn-circle btn-sm shrink-0"
          aria-label="Volver a recordatorios"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Nuevo recordatorio
            </h1>
            <p className="text-sm text-base-content/60">
              Agrega un nuevo pago recurrente
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl">
        <div className="card bg-base-100">
          <div className="card-body p-2">
            {/* Quick tip */}
            <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg mb-6">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-base-content/70 leading-relaxed">
                Completa los detalles de tu recordatorio. Te avisaremos antes de
                la fecha de vencimiento para que nunca pagues recargos.
              </p>
            </div>

            <ReminderForm />
          </div>
        </div>
      </div>
    </div>
  );
}
