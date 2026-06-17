import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRemindersWithPaymentStatus,
  searchRemindersWithPaymentStatus,
  type ReminderWithStatus,
} from "@/lib/api/remindersWithPayments";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ReminderList } from "@/components/reminders/ReminderList";
import { RemindersHero } from "@/components/reminders/RemindersHero";
import { CriticalAlertsSummary } from "@/components/reminders/CriticalAlertsSummary";
import { RemindersSearchFilter } from "@/components/reminders/RemindersSearchFilter";
import { Plus, Calendar, Search } from "lucide-react";

// Server action to search reminders
async function searchRemindersAction(query: string, category: string | null) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autorizado");

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

export default async function RemindersPage({
  searchParams,
}: RemindersPageProps) {
  const { q: searchQuery = "", category: selectedCategory = null } =
    await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch reminders with payment status
  let reminders: ReminderWithStatus[];

  if (searchQuery || selectedCategory) {
    reminders = await searchRemindersAction(searchQuery, selectedCategory);
  } else {
    reminders = await getRemindersWithPaymentStatus(user.id);
  }

  // Calculate stats for hero
  const total = reminders.length;
  const urgentCount = reminders.filter(
    (r) =>
      r.is_active &&
      !r.isPaidForCurrentCycle &&
      (r.isOverdue || r.daysUntilDue <= 3),
  ).length;

  return (
    <main className="space-y-10">
      {/* Header with Title + Add Button */}
      <div className="flex items-start justify-between gap-4">
        <RemindersHero totalReminders={total} urgentCount={urgentCount} />
        <Link
          href="/reminders/new"
          className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          aria-label="Nuevo recordatorio"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Critical Alerts Summary */}
      {total > 0 && <CriticalAlertsSummary reminders={reminders} />}

      {/* Search & Filter */}
      {total > 0 || searchQuery || selectedCategory ? (
        <div>
          <Suspense
            fallback={
              <div className="h-10 bg-base-200/50 animate-pulse rounded-lg" />
            }
          >
            <RemindersSearchFilter
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

      {/* Empty State - When no reminders at all */}
      {total === 0 && !searchQuery && !selectedCategory && (
        <div className="bg-base-200 rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <Calendar className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 font-[family-name:var(--font-headline)]">
            Comienza a organizar tus pagos
          </h2>
          <p className="text-base-content/60 max-w-lg mx-auto mb-8">
            Agrega tus tarjetas de crédito, servicios, suscripciones y otros
            pagos recurrentes. Te avisaremos antes de que venzan para que nunca
            pagues recargos.
          </p>
          <Link
            href="/reminders/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear primer recordatorio
          </Link>
        </div>
      )}

      {/* No Results - When searching/filtering */}
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
    </main>
  );
}
