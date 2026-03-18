'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createReminderSchema,
  type CreateReminderInput,
} from '@/lib/validations/reminder.schemas';
import { useReminders } from '@/hooks/useReminders';
import { REMINDER_CATEGORIES, RECURRENCE_TYPES } from '@/config/constants';
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
} from 'lucide-react';

interface ReminderFormProps {
  onSuccess?: () => void;
}

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';

const initialValues: CreateReminderInput = {
  name: '',
  due_day: 1,
  cutoff_day: undefined,
  category: '',
  recurrence: 'monthly',
  notes: '',
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
          const reminderData: CreateReminderInput = {
            name: values.name,
            due_day: values.due_day,
            category: values.category,
            recurrence: values.recurrence,
            notes: values.notes || undefined,
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
