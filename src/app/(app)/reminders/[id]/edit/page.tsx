import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReminderById } from "@/lib/api/reminders";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ReminderEditFormClientEdit } from "@/components/reminders/ReminderEditFormClientEdit";
import { RECURRENCE_TYPES } from "@/config/constants";
import { formatNotificationTimings } from "@/lib/utils/reminders";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Repeat,
  Scissors,
  Tag,
} from "lucide-react";

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
    redirect("/login");
  }

  // Fetch reminder
  const reminder = await getReminderById(user.id, id);

  if (!reminder) {
    notFound();
  }

  const recurrenceLabel =
    RECURRENCE_TYPES.find((item) => item.value === reminder.recurrence)
      ?.label || reminder.recurrence;

  return (
    <main className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8 space-y-5">
          <Link
            href={`/reminders/${reminder.id}`}
            className="inline-flex items-center gap-2 font-(family-name:--font-body) text-xs text-base-content/50 hover:text-base-content transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Link>

          <div>
            <p className="font-(family-name:--font-body) text-secondary uppercase tracking-[0.2em] text-[0.6875rem] font-semibold mb-3">
              Edición de recordatorio
            </p>
            <h1 className="font-(family-name:--font-headline) text-5xl md:text-7xl font-extrabold tracking-tighter leading-none text-base-content">
              {reminder.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <span
                className={`rounded-full px-3 py-1 font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest ${
                  reminder.is_active
                    ? "bg-secondary/10 text-secondary"
                    : "bg-base-200 text-base-content/50"
                }`}
              >
                {reminder.is_active ? "Activo" : "Pausado"}
              </span>
              <span className="font-(family-name:--font-body) text-xs text-base-content/50">
                {reminder.category}
              </span>
              <span className="h-1 w-1 rounded-full bg-base-content/20" />
              <span className="font-(family-name:--font-body) text-xs text-base-content/50">
                {recurrenceLabel} · vence día {reminder.due_day}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex md:justify-end">
          <div className="bg-base-200 rounded-xl p-3 flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center text-primary shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 md:flex-none pr-2">
              <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                Ciclo de pago
              </p>
              <p className="font-(family-name:--font-body) text-sm text-base-content/70">
                Ajusta vencimiento, corte y avisos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-base-200 rounded-xl p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50">
                Ficha editable
              </p>
              <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight text-base-content mt-1">
                Datos del recordatorio
              </h2>
            </div>
          </div>

          <ReminderEditFormClientEdit reminder={reminder} />
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <section className="bg-base-200 rounded-xl p-6 space-y-6">
            <div>
              <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50">
                Resumen actual
              </p>
              <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight text-base-content mt-1">
                Ciclo configurado
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-base-300/60 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                    Vencimiento
                  </p>
                  <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content mt-1">
                    Día {reminder.due_day} · {recurrenceLabel}
                  </p>
                </div>
              </div>

              {reminder.cutoff_day && (
                <div className="rounded-xl bg-base-300/60 p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                      Fecha de corte
                    </p>
                    <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content mt-1">
                      Día {reminder.cutoff_day}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-base-300/60 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                    Categoría
                  </p>
                  <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content mt-1">
                    {reminder.category}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-base-300/60 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                    Avisos
                  </p>
                  <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content mt-1">
                    {reminder.email_notifications_enabled
                      ? formatNotificationTimings(
                          reminder.email_notification_timings,
                        )
                      : "Sin avisos por correo"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-base-200 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center text-base-content/70 shrink-0">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <p className="font-(family-name:--font-body) text-sm font-semibold text-base-content">
                  Los cambios aplican al próximo ciclo
                </p>
                <p className="font-(family-name:--font-body) text-sm text-base-content/60 mt-1">
                  Actualiza solo lo necesario para mantener limpio el historial
                  de pagos ya registrado.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
