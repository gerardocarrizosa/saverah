import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminderById } from '@/lib/api/reminders';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ReminderEditFormClientEdit } from '@/components/reminders/ReminderEditFormClientEdit';
import { ArrowLeft, Edit3 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={`/reminders/${reminder.id}`}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-warning/10">
          <span className="text-3xl">✏️</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Editar recordatorio</h1>
          <p className="text-base-content/70">Modificando: {reminder.name}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-warning/10">
              <Edit3 className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-xl font-bold">Información del recordatorio</h2>
          </div>

          <ReminderEditFormClientEdit reminder={reminder} />
        </div>
      </div>
    </div>
  );
}
