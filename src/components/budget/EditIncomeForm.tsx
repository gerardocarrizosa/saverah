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
    <div className="space-y-10 max-w-2xl mx-auto">
      <Link
        href="/budget/income"
        className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a ingresos
      </Link>

      <section className="space-y-2">
        <span className="font-[family-name:var(--font-body)] text-primary uppercase tracking-[0.2em] text-[0.6875rem] font-semibold">
          Edición
        </span>
        <h1 className="font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-base-content">
          Editar ingreso
        </h1>
        <p className="font-[family-name:var(--font-body)] text-base-content/60 mt-2">
          Modifica los detalles de tu ingreso.
        </p>
      </section>

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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-3 pt-4">
              <Link
                href="/budget/income"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-base-300 text-base-content rounded-full text-sm font-bold hover:bg-base-300/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
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
  );
}
