import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminderById } from '@/lib/api/reminders';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ReminderEditFormClientEdit } from '@/components/reminders/ReminderEditFormClientEdit';
import { ArrowLeft, Pencil, ChevronRight, Sparkles } from 'lucide-react';

interface ReminderEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReminderEditPage({
  params,
}: ReminderEditPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch reminder
  const reminder = await getReminderById(user.id, id);

  if (!reminder) {
    notFound();
  }

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-base-content/60">
        <Link
          href="/reminders"
          className="hover:text-primary transition-colors"
        >
          Recordatorios
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/reminders/${reminder.id}`}
          className="hover:text-primary transition-colors"
        >
          {reminder.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-base-content">Editar</span>
      </div>

      {/* Header Section - Clean with back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href={`/reminders/${reminder.id}`}
          className="btn btn-ghost btn-circle btn-sm shrink-0"
          aria-label="Volver al detalle"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning/10">
            <Pencil className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Editar recordatorio
            </h1>
            <p className="text-sm text-base-content/60">
              Modificando: {reminder.name}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl">
        <div className="card bg-base-100 rounded-xl">
          <div className="card-body p-2">
            {/* Quick tip */}
            <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg mb-6">
              <Sparkles className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-base-content/70 leading-relaxed">
                Actualiza los detalles de tu recordatorio. Los cambios se
                aplicarán inmediatamente a los próximos recordatorios.
              </p>
            </div>

            <ReminderEditFormClientEdit reminder={reminder} />
          </div>
        </div>
      </div>
    </div>
  );
}
