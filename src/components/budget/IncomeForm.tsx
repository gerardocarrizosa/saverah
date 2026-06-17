'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import Link from 'next/link';
import { createIncomeSchema } from '@/lib/validations/budget.schemas';
import { useBudget } from '@/hooks/useBudget';
import { INCOME_TYPES, DEFAULT_CURRENCY } from '@/config/constants';
import type { Income } from '@/types/budget.types';
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  StickyNote,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  X,
} from 'lucide-react';

interface IncomeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editIncome?: Income | null;
}

interface IncomeFormValues {
  source: string;
  type: 'steady' | 'variable' | 'other';
  amount: number;
  received_at: string;
  notes: string;
}

const initialValues: IncomeFormValues = {
  source: '',
  type: 'steady',
  amount: 0,
  received_at: new Date().toISOString().split('T')[0],
  notes: '',
};

export function IncomeForm({ onSuccess, onCancel, editIncome }: IncomeFormProps) {
  const { addIncome, updateIncome } = useBudget();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editIncome;

  const formInitialValues = isEditing
    ? {
        source: editIncome.source,
        type: editIncome.type,
        amount: editIncome.amount,
        received_at: editIncome.received_at,
        notes: editIncome.notes || '',
      }
    : initialValues;

  return (
    <Formik
      key={isEditing ? editIncome.id : 'new'}
      initialValues={formInitialValues}
      validationSchema={createIncomeSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setError(null);
        try {
          if (isEditing && editIncome) {
            await updateIncome(editIncome.id, {
              source: values.source,
              type: values.type,
              amount: values.amount,
              received_at: values.received_at,
              notes: values.notes || undefined,
            });
          } else {
            await addIncome({
              source: values.source,
              type: values.type,
              amount: values.amount,
              received_at: values.received_at,
              notes: values.notes || undefined,
            });
            resetForm();
          }

          if (onSuccess) {
            onSuccess();
          }
        } catch (err: unknown) {
          setError(
            err instanceof Error
              ? err.message
              : isEditing
              ? 'Error al actualizar el ingreso'
              : 'Error al registrar el ingreso'
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values }) => (
        <Form className="space-y-6">
          {error && (
            <div className="bg-error/10 text-error rounded-xl p-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Fuente de ingreso
            </label>
            <Field
              name="source"
              type="text"
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Ej: Salario, Freelance, Inversiones"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="source"
              component="div"
              className="text-error text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tipo
              </label>
              <Field
                name="type"
                as="select"
                className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                disabled={isSubmitting}
              >
                {INCOME_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="type"
                component="div"
                className="text-error text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monto ({DEFAULT_CURRENCY})
              </label>
              <Field
                name="amount"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-error text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de recepción
            </label>
            <Field
              name="received_at"
              type="date"
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="received_at"
              component="div"
              className="text-error text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notas (opcional)
            </label>
            <Field
              name="notes"
              as="textarea"
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
              placeholder="Notas adicionales sobre este ingreso..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-base-300 text-base-content rounded-full text-sm font-bold hover:bg-base-300/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" />
                      Actualizar
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/budget"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-base-300 text-base-content rounded-full text-sm font-bold hover:bg-base-300/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-success/10 text-success rounded-full text-sm font-bold hover:bg-success/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Registrar ingreso
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
