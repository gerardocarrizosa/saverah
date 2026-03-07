'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Tag, 
  Repeat, 
  StickyNote,
  Scissors,
  Loader2,
  Save,
  CheckCircle2
} from 'lucide-react';
import { updateReminderSchema } from '@/lib/validations/reminder.schemas';
import api from '@/lib/axios';
import { REMINDER_CATEGORIES, RECURRENCE_TYPES } from '@/config/constants';
import type { Reminder } from '@/types/reminder.types';

interface ReminderEditFormProps {
  reminder: Reminder;
  onSuccess: () => void;
}

interface ReminderFormValues {
  name: string;
  category: string;
  due_day: number;
  cutoff_day?: number | null;
  recurrence: 'monthly' | 'yearly' | 'weekly';
  notes: string;
}

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';

export function ReminderEditForm({ reminder, onSuccess }: ReminderEditFormProps) {
  const [success, setSuccess] = useState(false);

  const initialValues: ReminderFormValues = {
    name: reminder.name,
    category: reminder.category,
    due_day: reminder.due_day,
    cutoff_day: reminder.cutoff_day,
    recurrence: reminder.recurrence,
    notes: reminder.notes || '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateReminderSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const updateData: Partial<Reminder> = {
            name: values.name,
            category: values.category,
            due_day: values.due_day,
            recurrence: values.recurrence,
            notes: values.notes || undefined,
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
          console.error('Error updating reminder:', error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values }) => (
        <Form className="space-y-4">
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Cambios guardados exitosamente!</span>
            </div>
          )}

          {/* Name */}
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

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="text-error text-sm mt-1"
              />
            </div>

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
          </div>

          {/* Due Day & Cutoff Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="15"
                disabled={isSubmitting}
              />
              <label className="label">
                <span className="label-text-alt">Día del mes (1-31)</span>
              </label>
              <ErrorMessage
                name="due_day"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            {values.category === CREDIT_CARD_CATEGORY && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 text-primary">
                    <Scissors className="w-4 h-4" />
                    Fecha de corte
                  </span>
                </label>
                <Field
                  name="cutoff_day"
                  type="number"
                  min="1"
                  max="31"
                  className="input input-bordered w-full input-primary"
                  placeholder="1"
                  disabled={isSubmitting}
                />
                <label className="label">
                  <span className="label-text-alt">Día del mes (1-31)</span>
                </label>
                <ErrorMessage
                  name="cutoff_day"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>
            )}
          </div>

          {/* Notes */}
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
              placeholder="Notas adicionales..."
              disabled={isSubmitting}
            />
            <label className="label">
              <span className="label-text-alt">
                {values.notes?.length || 0}/500 caracteres
              </span>
            </label>
            <ErrorMessage
              name="notes"
              component="div"
              className="text-error text-sm mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full gap-2"
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
        </Form>
      )}
    </Formik>
  );
}
