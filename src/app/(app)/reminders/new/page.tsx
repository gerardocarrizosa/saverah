import { ReminderForm } from '@/components/reminders/ReminderForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuevo Recordatorio | Saverah',
  description: 'Crea un nuevo recordatorio de pago',
};

export default function NewReminderPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Nuevo recordatorio
        </h1>
        <p className="text-base-content/70 mt-2">
          Crea un nuevo recordatorio de pago para mantener el control de tus finanzas
        </p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <ReminderForm />
        </div>
      </div>
    </div>
  );
}
