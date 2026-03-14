'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { createExpenseSchema } from '@/lib/validations/budget.schemas';
import { useBudget } from '@/hooks/useBudget';
import { EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from '@/config/constants';
import {
  FileText,
  Calendar,
  DollarSign,
  Tag,
  StickyNote,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
} from 'lucide-react';

interface ExpenseFormValues {
  description: string;
  category: string;
  amount: number;
  spent_at: string;
  notes: string;
}

const initialValues: ExpenseFormValues = {
  description: '',
  category: '',
  amount: 0,
  spent_at: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function NewExpensePage() {
  const router = useRouter();
  const { addExpense } = useBudget();
  const [error, setError] = useState<string | null>(null);

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
          <div className="p-2 rounded-xl bg-error/10">
            <Plus className="w-5 h-5 text-error" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">Nuevo gasto</h1>
            <p className="text-sm text-base-content/60">
              Registra un nuevo gasto en tu presupuesto
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-lg">
        <div className="card-body p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={createExpenseSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setError(null);
              try {
                await addExpense({
                  description: values.description,
                  category: values.category,
                  amount: values.amount,
                  spent_at: values.spent_at,
                  notes: values.notes || undefined,
                });
                router.push('/budget/expenses');
              } catch (err: unknown) {
                setError(
                  err instanceof Error
                    ? err.message
                    : 'Error al registrar el gasto',
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
                      <FileText className="w-4 h-4" />
                      Descripción
                    </span>
                  </label>
                  <Field
                    name="description"
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Ej: Compra en supermercado"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-error text-sm mt-1"
                  />
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
                  >
                    <option value="">Selecciona una categoría</option>
                    {EXPENSE_CATEGORIES.map((category) => (
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

                <div className="grid grid-cols-2 gap-4">
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

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha
                      </span>
                    </label>
                    <Field
                      name="spent_at"
                      type="date"
                      className="input input-bordered w-full"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage
                      name="spent_at"
                      component="div"
                      className="text-error text-sm mt-1"
                    />
                  </div>
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
                    placeholder="Notas adicionales sobre este gasto..."
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
                    href="/budget/expenses"
                    className="btn btn-ghost flex-1 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1 gap-2 rounded"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Registrar gasto
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
