"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  Repeat,
  StickyNote,
  Scissors,
  Loader2,
  Save,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { updateReminderSchema } from "@/lib/validations/reminder.schemas";
import api from "@/lib/axios";
import {
  EMAIL_NOTIFICATION_TIMINGS,
  REMINDER_CATEGORIES,
  RECURRENCE_TYPES,
} from "@/config/constants";
import type {
  Reminder,
  ReminderNotificationTiming,
} from "@/types/reminder.types";

interface ReminderEditFormProps {
  reminder: Reminder;
  onSuccess: () => void;
}

interface ReminderFormValues {
  name: string;
  category: string;
  due_day: number;
  cutoff_day?: number | null;
  recurrence: "monthly" | "yearly" | "weekly";
  notes: string;
  email_notifications_enabled: boolean;
  email_notification_timings: ReminderNotificationTiming[];
}

const CREDIT_CARD_CATEGORY = "Tarjeta de Crédito";

export function ReminderEditForm({
  reminder,
  onSuccess,
}: ReminderEditFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialValues: ReminderFormValues = {
    name: reminder.name,
    category: reminder.category,
    due_day: reminder.due_day,
    cutoff_day: reminder.cutoff_day,
    recurrence: reminder.recurrence,
    notes: reminder.notes || "",
    email_notifications_enabled: reminder.email_notifications_enabled,
    email_notification_timings: reminder.email_notification_timings,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateReminderSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setError(null);
        setSuccess(false);
        try {
          const updateData: Partial<Reminder> = {
            name: values.name,
            category: values.category,
            due_day: values.due_day,
            recurrence: values.recurrence,
            notes: values.notes || undefined,
            email_notifications_enabled: values.email_notifications_enabled,
            email_notification_timings: values.email_notifications_enabled
              ? values.email_notification_timings
              : [],
          };

          // Only include cutoff_day for credit cards
          if (values.category === CREDIT_CARD_CATEGORY && values.cutoff_day) {
            updateData.cutoff_day = values.cutoff_day;
          } else {
            updateData.cutoff_day = null;
          }

          await api.patch(`/reminders/${reminder.id}`, updateData);

          setSuccess(true);
          onSuccess();

          setTimeout(() => setSuccess(false), 3000);
        } catch (error: unknown) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al actualizar el recordatorio",
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-8">
          {success && (
            <div className="rounded-xl bg-secondary/10 text-secondary p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Cambios guardados exitosamente.
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-error/10 text-error p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <section className="space-y-5">
            <div>
              <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">
                Identidad
              </p>
              <h3 className="font-(family-name:--font-headline) text-xl font-bold tracking-tight text-base-content mt-1">
                Cómo aparece en tu lista
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Nombre del recordatorio
                </label>
                <Field
                  name="name"
                  type="text"
                  className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Ej: Tarjeta de crédito Visa"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-error text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoría
                </label>
                <Field
                  name="category"
                  as="select"
                  className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  disabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newCategory = e.target.value;
                    setFieldValue("category", newCategory);
                    if (newCategory !== CREDIT_CARD_CATEGORY) {
                      setFieldValue("cutoff_day", null);
                    }
                  }}
                >
                  {REMINDER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="category"
                  component="div"
                  className="text-error text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Recurrencia
                </label>
                <Field
                  name="recurrence"
                  as="select"
                  className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  disabled={isSubmitting}
                >
                  {RECURRENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="recurrence"
                  component="div"
                  className="text-error text-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">
                Calendario
              </p>
              <h3 className="font-(family-name:--font-headline) text-xl font-bold tracking-tight text-base-content mt-1">
                Cuándo debe moverse el pago
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Día de vencimiento
                </label>
                <Field
                  name="due_day"
                  type="number"
                  min="1"
                  max="31"
                  className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="15"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-base-content/40">Día del mes (1-31)</p>
                <ErrorMessage
                  name="due_day"
                  component="div"
                  className="text-error text-sm"
                />
              </div>

              {values.category === CREDIT_CARD_CATEGORY && (
                <div className="rounded-xl bg-primary/10 p-4 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Fecha de corte
                  </label>
                  <Field
                    name="cutoff_day"
                    type="number"
                    min="1"
                    max="31"
                    className="w-full bg-base-100 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="1"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-base-content/50">
                    Día en que cierra el periodo de facturación.
                  </p>
                  <ErrorMessage
                    name="cutoff_day"
                    component="div"
                    className="text-error text-sm"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl bg-base-300/60 p-5 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Avisos por correo
                </p>
                <p className="text-sm text-base-content/60 mt-2">
                  Configura cuándo quieres recibir correos para este recordatorio.
                </p>
              </div>
              <Field
                name="email_notifications_enabled"
                type="checkbox"
                className="toggle toggle-primary shrink-0"
                disabled={isSubmitting}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue(
                    "email_notifications_enabled",
                    e.target.checked,
                  );
                  if (!e.target.checked) {
                    setFieldValue("email_notification_timings", []);
                  }
                }}
              />
            </div>

            {values.email_notifications_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EMAIL_NOTIFICATION_TIMINGS.map((timing) => {
                  const checked = values.email_notification_timings.includes(
                    timing.value,
                  );

                  return (
                    <label
                      key={timing.value}
                      className="flex items-center gap-2 rounded-xl bg-base-200 px-3 py-3 text-sm text-base-content/80"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={checked}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const nextTimings = e.target.checked
                            ? [
                                ...values.email_notification_timings,
                                timing.value,
                              ]
                            : values.email_notification_timings.filter(
                                (value) => value !== timing.value,
                              );
                          setFieldValue(
                            "email_notification_timings",
                            nextTimings,
                          );
                        }}
                      />
                      {timing.label}
                    </label>
                  );
                })}
              </div>
            )}
            <ErrorMessage
              name="email_notification_timings"
              component="div"
              className="text-error text-sm"
            />
          </section>

          <section className="space-y-5">
            <div>
              <p className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">
                Contexto
              </p>
              <h3 className="font-(family-name:--font-headline) text-xl font-bold tracking-tight text-base-content mt-1">
                Notas internas
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notas (opcional)
              </label>
              <Field
                name="notes"
                as="textarea"
                className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
                placeholder="Notas adicionales..."
                disabled={isSubmitting}
              />
              <div className="flex justify-between gap-3">
                <ErrorMessage
                  name="notes"
                  component="span"
                  className="text-error text-sm"
                />
                <span className="text-xs text-base-content/40">
                  {values.notes?.length || 0}/500
                </span>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/reminders/${reminder.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-base-300 text-base-content rounded-full text-sm font-bold hover:bg-base-300/80 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
