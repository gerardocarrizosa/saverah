'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createReminderSchema } from '@/lib/validations/reminder.schemas';
import { useReminders } from '@/hooks/useReminders';
import { REMINDER_CATEGORIES, RECURRENCE_TYPES } from '@/config/constants';
import { EMAIL_NOTIFICATION_TIMINGS } from '@/config/constants';
import type { ReminderNotificationTiming } from '@/types/reminder.types';

type ReminderFormValues = {
  name: string;
  due_day: number;
  cutoff_day?: number;
  category: string;
  recurrence: 'monthly' | 'yearly' | 'weekly';
  notes: string;
  email_notifications_enabled: boolean;
  email_notification_timings: ReminderNotificationTiming[];
};
import {
  FileText,
  Calendar,
  Tag,
  Repeat,
  StickyNote,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2,
  Scissors,
  Mail,
} from 'lucide-react';

interface ReminderFormProps {
  onSuccess?: () => void;
}

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';

const initialValues: ReminderFormValues = {
  name: '',
  due_day: 1,
  cutoff_day: undefined,
  category: '',
  recurrence: 'monthly',
  notes: '',
  email_notifications_enabled: false,
  email_notification_timings: [],
};

export function ReminderForm({ onSuccess }: ReminderFormProps) {
  const router = useRouter();
  const { createReminder } = useReminders([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createReminderSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setError(null);
        try {
          const reminderData = {
            name: values.name,
            due_day: values.due_day,
            cutoff_day: undefined as number | undefined,
            category: values.category,
            recurrence: values.recurrence,
            notes: values.notes || undefined,
            email_notifications_enabled: values.email_notifications_enabled,
            email_notification_timings: values.email_notifications_enabled
              ? values.email_notification_timings
              : [],
          };

          // Only include cutoff_day for credit cards
          if (
            values.category === CREDIT_CARD_CATEGORY &&
            values.cutoff_day !== undefined
          ) {
            reminderData.cutoff_day = values.cutoff_day;
          }

          await createReminder(reminderData);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/reminders');
            router.refresh();
          }
        } catch (err: unknown) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al crear el recordatorio',
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-6">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nombre del recordatorio
              </span>
            </label>
            <Field
              name="name"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ej: Tarjeta de crédito Visa"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="name"
              component="div"
              className="text-error text-sm mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Día de vencimiento
                </span>
              </label>
              <Field
                name="due_day"
                type="number"
                min="1"
                max="31"
                className="input input-bordered w-full"
                placeholder="1"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="due_day"
                component="div"
                className="text-error text-sm mt-1"
              />
              <label className="label">
                <span className="label-text-alt">Día del mes (1-31)</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoría
                </span>
              </label>
              <Field
                name="category"
                as="select"
                className="select select-bordered w-full"
                disabled={isSubmitting}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newCategory = e.target.value;
                  setFieldValue('category', newCategory);
                  // Reset cutoff_day when category changes to non-credit-card
                  if (newCategory !== CREDIT_CARD_CATEGORY) {
                    setFieldValue('cutoff_day', undefined);
                  }
                }}
              >
                <option value="">Selecciona</option>
                {REMINDER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="category"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>
          </div>

          {/* Conditional cutoff_day field - only shows for credit cards */}
          {values.category === CREDIT_CARD_CATEGORY && (
            <div className="form-control bg-base-200 p-4 rounded-lg border border-primary/20">
              <label className="label">
                <span className="label-text flex items-center gap-2 text-primary font-medium">
                  <Scissors className="w-4 h-4" />
                  Fecha de corte (día del mes)
                </span>
              </label>
              <Field
                name="cutoff_day"
                type="number"
                min="1"
                max="31"
                className="input input-bordered w-full input-primary"
                placeholder="15"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="cutoff_day"
                component="div"
                className="text-error text-sm mt-1"
              />
              <label className="label">
                <span className="label-text-alt">
                  Día en que cierra el periodo de facturación (1-31)
                </span>
              </label>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Recurrencia
              </span>
            </label>
            <Field
              name="recurrence"
              as="select"
              className="select select-bordered w-full"
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
              className="text-error text-sm mt-1"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notas (opcional)
              </span>
            </label>
            <Field
              name="notes"
              as="textarea"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Notas adicionales sobre este recordatorio..."
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="notes"
              component="div"
              className="text-error text-sm mt-1"
            />
            <label className="label">
              <span className="label-text-alt">
                {values.notes?.length || 0}/500 caracteres
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 space-y-4">
            <label className="label cursor-pointer justify-start gap-3 p-0">
              <Field
                name="email_notifications_enabled"
                type="checkbox"
                className="toggle toggle-primary"
                disabled={isSubmitting}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('email_notifications_enabled', e.target.checked);
                  if (!e.target.checked) {
                    setFieldValue('email_notification_timings', []);
                  }
                }}
              />
              <span className="label-text flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4" />
                Enviar avisos por correo
              </span>
            </label>
            <p className="text-sm text-base-content/60">
              Recibe un correo antes del vencimiento de este recordatorio.
            </p>

            {values.email_notifications_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EMAIL_NOTIFICATION_TIMINGS.map((timing) => {
                  const checked = values.email_notification_timings.includes(
                    timing.value,
                  );

                  return (
                    <label
                      key={timing.value}
                      className="flex items-center gap-2 rounded-lg bg-base-100 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={checked}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const nextTimings = e.target.checked
                            ? [...values.email_notification_timings, timing.value]
                            : values.email_notification_timings.filter(
                                (value) => value !== timing.value,
                              );
                          setFieldValue('email_notification_timings', nextTimings);
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-base-200">
            <Link
              href="/reminders"
              className="btn btn-ghost flex-1 order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary p-2 rounded flex-1 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear recordatorio
                </>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
