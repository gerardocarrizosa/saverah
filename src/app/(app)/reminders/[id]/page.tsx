import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminderById, getReminderAnalytics } from '@/lib/api/reminders';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { NextDueInfo } from '@/components/reminders/NextDueInfo';
import { ReminderAnalytics } from '@/components/reminders/ReminderAnalytics';
import { PaymentFormClient } from '@/components/reminders/PaymentFormClient';
import { PaymentHistoryClient } from '@/components/reminders/PaymentHistoryClient';
import { 
  ArrowLeft, 
  Pause,
  Play,
  Trash2,
  CreditCard,
  Receipt,
  Plus,
  Edit3
} from 'lucide-react';

interface ReminderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server actions for reminder management
async function toggleReminderStatus(id: string, isActive: boolean) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autorizado');
  
  const { error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

async function deleteReminder(id: string) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autorizado');
  
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  redirect('/reminders');
}

export default async function ReminderDetailPage({ params }: ReminderDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch reminder and analytics in parallel
  const [reminder, analytics] = await Promise.all([
    getReminderById(user.id, id),
    getReminderAnalytics(user.id, id),
  ]);

  if (!reminder) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/reminders" 
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a recordatorios
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/reminders/${reminder.id}/edit`}
            className="btn btn-sm btn-ghost gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Link>
          
          <form action={async () => {
            'use server';
            await toggleReminderStatus(reminder.id, !reminder.is_active);
          }}>
            <button 
              type="submit"
              className={`btn btn-sm gap-2 ${reminder.is_active ? 'btn-ghost' : 'btn-success'}`}
            >
              {reminder.is_active ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Activar
                </>
              )}
            </button>
          </form>
          
          <form action={async () => {
            'use server';
            await deleteReminder(reminder.id);
          }}>
            <button 
              type="submit"
              className="btn btn-sm btn-ghost text-error gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </form>
        </div>
      </div>

      {/* Next Due Info */}
      <NextDueInfo
        name={reminder.name}
        category={reminder.category}
        recurrence={reminder.recurrence}
        dueDay={reminder.due_day}
        cutoffDay={reminder.cutoff_day}
        analytics={analytics}
      />

      {/* Analytics Summary */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Resumen financiero</h2>
          </div>
          <Suspense fallback={<div className="loading loading-spinner"></div>}>
            <ReminderAnalytics analytics={analytics} />
          </Suspense>
        </div>
      </div>

      {/* Payment Registration & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Plus className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-xl font-bold">Registrar pago</h2>
            </div>
            <Suspense fallback={<div className="loading loading-spinner"></div>}>
              <PaymentFormClient reminderId={reminder.id} />
            </Suspense>
          </div>
        </div>

        {/* Payment History */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-info/10">
                <Receipt className="w-5 h-5 text-info" />
              </div>
              <h2 className="text-xl font-bold">Historial de pagos</h2>
              <span className="badge badge-ghost badge-sm ml-auto">
                {analytics.payment_count} registros
              </span>
            </div>
            <Suspense fallback={<div className="loading loading-spinner"></div>}>
              <PaymentHistoryClient 
                reminderId={reminder.id} 
                initialPayments={analytics.payment_history}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
