import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminderById, getReminderAnalytics } from '@/lib/api/reminders';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { NextDueInfo } from '@/components/reminders/NextDueInfo';
import { ReminderAnalytics } from '@/components/reminders/ReminderAnalytics';
import { PaymentFormClient } from '@/components/reminders/PaymentFormClient';
import { PaymentHistoryClient } from '@/components/reminders/PaymentHistoryClient';
import { ReminderActionsMenu } from '@/components/reminders/ReminderActionsMenu';
import { toggleReminderStatus, deleteReminder } from './actions';
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  Plus,
  ChevronRight,
} from 'lucide-react';

interface ReminderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReminderDetailPage({
  params,
}: ReminderDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="p-4 space-y-6">
      {/* Header Section - Breadcrumb & Title */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <Link
            href="/reminders"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            Recordatorios
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-base-content">Detalle</span>
        </div>

        {/* Title & Actions Row */}
        <div className="flex items-start gap-3">
          <Link
            href="/reminders"
            className="p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold text-base-content truncate">
                {reminder.name}
              </h1>
              <ReminderActionsMenu
                reminderId={reminder.id}
                reminderName={reminder.name}
                isActive={reminder.is_active}
              />
            </div>
            <p className="text-sm text-base-content/60">
              {reminder.is_active ? 'Activo' : 'Pausado'} • {reminder.category}
            </p>
          </div>
        </div>

        {/* Hidden forms for dropdown actions */}
        <form
          id="toggle-status-form"
          action={async () => {
            'use server';
            await toggleReminderStatus(reminder.id, !reminder.is_active);
          }}
          className="hidden"
        >
          <input type="hidden" name="id" value={reminder.id} />
        </form>

        <form
          id="delete-form"
          action={async () => {
            'use server';
            await deleteReminder(reminder.id);
          }}
          className="hidden"
        >
          <input type="hidden" name="id" value={reminder.id} />
        </form>
      </div>

      {/* Next Due Info - Full width hero card */}
      <NextDueInfo
        name={reminder.name}
        category={reminder.category}
        recurrence={reminder.recurrence}
        dueDay={reminder.due_day}
        cutoffDay={reminder.cutoff_day}
        analytics={analytics}
      />

      {/* Payment Registration & History - Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="card bg-base-100 border border-base-300 rounded-xl">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Plus className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-lg font-bold">Registrar pago</h2>
            </div>
            <Suspense
              fallback={<div className="loading loading-spinner"></div>}
            >
              <PaymentFormClient reminderId={reminder.id} />
            </Suspense>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="card bg-base-100 border border-base-300 rounded-xl">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Resumen financiero</h2>
            </div>
            <Suspense
              fallback={<div className="loading loading-spinner"></div>}
            >
              <ReminderAnalytics analytics={analytics} />
            </Suspense>
          </div>
        </div>

        {/* Payment History */}
        <div className="card bg-base-100 border border-base-300 rounded-xl">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-info/10">
                  <Receipt className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg font-bold">Historial de pagos</h2>
              </div>
              {analytics.payment_count > 0 && (
                <span className="badge badge-ghost badge-sm">
                  {analytics.payment_count}{' '}
                  {analytics.payment_count === 1 ? 'registro' : 'registros'}
                </span>
              )}
            </div>
            <Suspense
              fallback={<div className="loading loading-spinner"></div>}
            >
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
