import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReminderById, getReminderAnalytics } from "@/lib/api/reminders";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { NextDueInfo } from "@/components/reminders/NextDueInfo";
import { ReminderAnalytics } from "@/components/reminders/ReminderAnalytics";
import { PaymentFormClient } from "@/components/reminders/PaymentFormClient";
import { PaymentHistory } from "@/components/reminders/PaymentHistory";
import { ReminderActionsMenu } from "@/components/reminders/ReminderActionsMenu";
import { RECURRENCE_TYPES } from "@/config/constants";
import {
  deleteReminderFromForm,
  toggleReminderStatusFromForm,
} from "./actions";
import {
  ArrowLeft,
  Plus,
} from "lucide-react";

interface ReminderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function SectionPanel({
  title,
  eyebrow,
  icon,
  children,
  action,
}: {
  title: string;
  eyebrow: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="bg-base-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center text-primary shrink-0">
              {icon}
            </div>
          )}
          <div>
            <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50">
              {eyebrow}
            </p>
            <h2 className="font-(family-name:--font-headline) text-2xl font-bold tracking-tight text-base-content">
              {title}
            </h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
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
    redirect("/login");
  }

  // Fetch reminder and analytics in parallel
  const [reminder, analytics] = await Promise.all([
    getReminderById(user.id, id),
    getReminderAnalytics(user.id, id),
  ]);

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
            href="/reminders"
            className="inline-flex items-center gap-2 font-(family-name:--font-body) text-xs text-base-content/50 hover:text-base-content transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a recordatorios
          </Link>

          <div>
            <p className="font-(family-name:--font-body) text-secondary uppercase tracking-[0.2em] text-[0.6875rem] font-semibold mb-3">
              Detalle de recordatorio
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
            <div className="flex-1 md:flex-none px-3">
              <p className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest text-base-content/40">
                Acciones
              </p>
              <p className="font-(family-name:--font-body) text-sm text-base-content/70">
                Edita, pausa o elimina
              </p>
            </div>
            <ReminderActionsMenu
              reminderId={reminder.id}
              reminderName={reminder.name}
              isActive={reminder.is_active}
            />
          </div>
        </div>

        <form
          id="toggle-status-form"
          action={toggleReminderStatusFromForm}
          className="hidden"
        >
          <input type="hidden" name="id" value={reminder.id} />
          <input
            type="hidden"
            name="isActive"
            value={String(!reminder.is_active)}
          />
        </form>

        <form
          id="delete-form"
          action={deleteReminderFromForm}
          className="hidden"
        >
          <input type="hidden" name="id" value={reminder.id} />
        </form>
      </section>

      <SectionPanel title="Ciclo de pago" eyebrow="Próximo movimiento">
        <NextDueInfo
          name={reminder.name}
          category={reminder.category}
          recurrence={reminder.recurrence}
          dueDay={reminder.due_day}
          cutoffDay={reminder.cutoff_day}
          analytics={analytics}
        />
      </SectionPanel>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <SectionPanel
            title="Registrar pago"
            eyebrow="Cerrar período"
            icon={<Plus className="w-5 h-5" />}
          >
            <Suspense
              fallback={
                <div className="h-36 bg-base-300/50 animate-pulse rounded-xl" />
              }
            >
              <PaymentFormClient reminderId={reminder.id} />
            </Suspense>
          </SectionPanel>
        </div>

        <div className="lg:col-span-7">
          <SectionPanel title="Resumen financiero" eyebrow="Histórico">
            <Suspense
              fallback={
                <div className="h-36 bg-base-300/50 animate-pulse rounded-xl" />
              }
            >
              <ReminderAnalytics analytics={analytics} />
            </Suspense>
          </SectionPanel>
        </div>
      </div>

      <SectionPanel
        title="Historial de pagos"
        eyebrow="Registro"
        action={
          analytics.payment_count > 0 ? (
            <span className="rounded-full bg-base-300 px-3 py-1 font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/50">
              {analytics.payment_count}
              {/* {analytics.payment_count === 1 ? "registro" : "registros"} */}
            </span>
          ) : null
        }
      >
        <Suspense
          fallback={
            <div className="h-40 bg-base-300/50 animate-pulse rounded-xl" />
          }
        >
          <PaymentHistory
            reminderId={reminder.id}
            payments={analytics.payment_history}
          />
        </Suspense>
      </SectionPanel>
    </main>
  );
}
