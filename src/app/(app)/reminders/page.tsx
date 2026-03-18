import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getRemindersWithPaymentStatus,
  searchRemindersWithPaymentStatus,
  type ReminderWithStatus,
} from '@/lib/api/remindersWithPayments';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ReminderList } from '@/components/reminders/ReminderList';
import { CategoryFilterClient } from '@/components/reminders/CategoryFilterClient';
import {
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  PauseCircle,
  Search,
  CircleCheck,
} from 'lucide-react';

// Type for reminder with calculated fields
// Server action to search reminders
async function searchRemindersAction(query: string, category: string | null) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  return await searchRemindersWithPaymentStatus(user.id, query, category);
}

interface RemindersPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

function RemindersLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-base-content/60">
          Cargando recordatorios...
        </p>
      </div>
    </div>
  );
}

// Compact stat badge component
function StatBadge({
  count,
  label,
  icon: Icon,
  variant,
}: {
  count: number;
  label: string;
  icon: React.ElementType;
  variant: 'urgent' | 'warning' | 'success' | 'neutral' | 'default' | 'paid';
}) {
  const variants = {
    urgent: 'bg-error/10 text-error border-error/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
    neutral: 'bg-neutral/10 text-neutral border-neutral/20',
    default: 'bg-base-200 text-base-content border-base-300',
    paid: 'bg-info/10 text-info border-info/20',
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${variants[variant]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{count}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

export default async function RemindersPage({
  searchParams,
}: RemindersPageProps) {
  const { q: searchQuery = '', category: selectedCategory = null } =
    await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch reminders with payment status
  let reminders: ReminderWithStatus[];

  if (searchQuery || selectedCategory) {
    reminders = await searchRemindersAction(searchQuery, selectedCategory);
  } else {
    reminders = await getRemindersWithPaymentStatus(user.id);
  }

  // Calculate stats - excluding paid reminders from upcoming/critical counts
  const total = reminders.length;
  const paidCount = reminders.filter((r) => r.isPaidForCurrentCycle).length;
  const activeUnpaidCount = reminders.filter(
    (r) => r.is_active && !r.isPaidForCurrentCycle,
  ).length;
  const inactiveCount = reminders.filter((r) => !r.is_active).length;

  // Upcoming and critical only count unpaid, active reminders
  const upcoming = reminders.filter(
    (r) =>
      r.is_active &&
      !r.isPaidForCurrentCycle &&
      r.daysUntilDue > 0 &&
      r.daysUntilDue <= 7,
  ).length;
  const critical = reminders.filter(
    (r) =>
      r.is_active &&
      !r.isPaidForCurrentCycle &&
      (r.isOverdue || r.daysUntilDue <= 3),
  ).length;

  // Check if there are urgent items that need attention (not paid)
  const hasUrgentItems = critical > 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header Section - Clean and integrated */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-base-content">Recordatorios</h1>
        </div>
        <Link
          href="/reminders/new"
          className="btn btn-primary gap-2 self-start lg:self-auto shrink-0 rounded"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex justify-between">
        {/* Quick Stats - Inline and compact */}
        {total > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {hasUrgentItems ? (
              <StatBadge
                count={critical}
                label="urgentes"
                icon={AlertCircle}
                variant="urgent"
              />
            ) : null}
            {upcoming > 0 && !hasUrgentItems ? (
              <StatBadge
                count={upcoming}
                label="esta semana"
                icon={Clock}
                variant="warning"
              />
            ) : null}
            <StatBadge
              count={activeUnpaidCount}
              label="activos"
              icon={CheckCircle2}
              variant={hasUrgentItems ? 'default' : 'success'}
            />
            {paidCount > 0 && (
              <StatBadge
                count={paidCount}
                label="pagados"
                icon={CircleCheck}
                variant="paid"
              />
            )}
            {inactiveCount > 0 && (
              <StatBadge
                count={inactiveCount}
                label="pausados"
                icon={PauseCircle}
                variant="neutral"
              />
            )}
          </div>
        )}
      </div>

      {/* Urgency Alert Banner - Only when needed */}
      {hasUrgentItems && (
        <div className="alert alert-error bg-error/10 text-error border-error/20">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium">
              Tienes {critical}{' '}
              {critical === 1 ? 'pago urgente' : 'pagos urgentes'}
            </p>
            <p className="text-sm opacity-80">
              Revisa los vencimientos próximos para evitar recargos
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter - Integrated, not a separate card */}
      {total > 0 || searchQuery || selectedCategory ? (
        <div className="border-b border-base-300 pb-4">
          <Suspense
            fallback={
              <div className="h-10 bg-base-200/50 animate-pulse rounded-lg" />
            }
          >
            <CategoryFilterClient
              initialQuery={searchQuery}
              initialCategory={selectedCategory}
            />
          </Suspense>
        </div>
      ) : null}

      {/* Reminders List */}
      <Suspense fallback={<RemindersLoading />}>
        <ReminderList reminders={reminders} />
      </Suspense>

      {/* Empty State - Clean and focused */}
      {total === 0 && !searchQuery && !selectedCategory && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Comienza a organizar tus pagos
          </h3>
          <p className="text-base-content/60 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Agrega tus tarjetas de crédito, servicios, suscripciones y otros
            pagos recurrentes. Te avisaremos antes de que venzan para que nunca
            pagues recargos.
          </p>
          <Link href="/reminders/new" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Crear primer recordatorio
          </Link>
        </div>
      )}

      {/* No Results */}
      {total === 0 && (searchQuery || selectedCategory) && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-base-200 mb-4">
            <Search className="w-6 h-6 text-base-content/40" />
          </div>
          <h3 className="text-lg font-medium mb-1">
            No se encontraron resultados
          </h3>
          <p className="text-sm text-base-content/60">
            Intenta con otros términos de búsqueda o categorías
          </p>
        </div>
      )}
    </div>
  );
}
