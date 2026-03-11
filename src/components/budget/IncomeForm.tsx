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
        <Form className="space-y-5">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Fuente de ingreso
              </span>
            </label>
            <Field
              name="source"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ej: Salario, Freelance, Inversiones"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="source"
              component="div"
              className="text-error text-sm mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tipo
                </span>
              </label>
              <Field
                name="type"
                as="select"
                className="select select-bordered w-full"
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
                className="text-error text-sm mt-1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto ({DEFAULT_CURRENCY})
                </span>
              </label>
              <Field
                name="amount"
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de recepción
              </span>
            </label>
            <Field
              name="received_at"
              type="date"
              className="input input-bordered w-full"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="received_at"
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
              placeholder="Notas adicionales sobre este ingreso..."
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="btn btn-ghost flex-1"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" />
                      Actualizar ingreso
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link href="/budget" className="btn btn-ghost flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
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
