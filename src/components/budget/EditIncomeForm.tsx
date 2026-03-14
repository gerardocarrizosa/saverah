'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
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
  Pencil,
} from 'lucide-react';

interface EditIncomeFormProps {
  income: Income;
}

export function EditIncomeForm({ income }: EditIncomeFormProps) {
  const router = useRouter();
  const { updateIncome } = useBudget();
  const [error, setError] = useState<string | null>(null);

  const initialValues = {
    source: income.source,
    type: income.type,
    amount: income.amount,
    received_at: income.received_at,
    notes: income.notes || '',
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Simple Header */}
      <div className="mb-6">
        <Link
          href="/budget"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Pencil className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Editar ingreso
            </h1>
            <p className="text-sm text-base-content/60">
              Modifica los detalles de tu ingreso
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={createIncomeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setError(null);
              try {
                await updateIncome(income.id, {
                  source: values.source,
                  type: values.type,
                  amount: values.amount,
                  received_at: values.received_at,
                  notes: values.notes || undefined,
                });
                router.push('/budget/income');
              } catch (err: unknown) {
                setError(
                  err instanceof Error
                    ? err.message
                    : 'Error al actualizar el ingreso',
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-4">
                {error && (
                  <div className="alert alert-error alert-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
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

                <div className="grid grid-cols-2 gap-4">
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
                    className="textarea textarea-bordered w-full h-24 resize-none"
                    placeholder="Notas adicionales sobre este ingreso..."
                    disabled={isSubmitting}
                  />
                  <div className="label">
                    <ErrorMessage
                      name="notes"
                      component="span"
                      className="label-text-alt text-error"
                    />
                    <span className="label-text-alt">
                      {values.notes?.length || 0}/500
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link
                    href="/budget/income"
                    className="btn btn-ghost flex-1 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4" />
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
