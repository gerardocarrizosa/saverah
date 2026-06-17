'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import Link from 'next/link';
import { createExpenseSchema } from '@/lib/validations/budget.schemas';
import { useBudget } from '@/hooks/useBudget';
import { EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from '@/config/constants';
import type { Expense } from '@/types/budget.types';
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
  Pencil,
  X,
} from 'lucide-react';

interface ExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editExpense?: Expense | null;
}

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

export function ExpenseForm({ onSuccess, onCancel, editExpense }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useBudget();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editExpense;

  const formInitialValues = isEditing
    ? {
        description: editExpense.description,
        category: editExpense.category,
        amount: editExpense.amount,
        spent_at: editExpense.spent_at,
        notes: editExpense.notes || '',
      }
    : initialValues;

  return (
    <Formik
      key={isEditing ? editExpense.id : 'new'}
      initialValues={formInitialValues}
      validationSchema={createExpenseSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setError(null);
        try {
          if (isEditing && editExpense) {
            await updateExpense(editExpense.id, {
              description: values.description,
              category: values.category,
              amount: values.amount,
              spent_at: values.spent_at,
              notes: values.notes || undefined,
            });
          } else {
            await addExpense({
              description: values.description,
              category: values.category,
              amount: values.amount,
              spent_at: values.spent_at,
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
              ? 'Error al actualizar el gasto'
              : 'Error al registrar el gasto'
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
              <FileText className="w-4 h-4" />
              Descripción
            </label>
            <Field
              name="description"
              type="text"
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Ej: Compra en supermercado"
              disabled={isSubmitting}
            />
            <ErrorMessage
              name="description"
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
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
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
              className="text-error text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </label>
              <Field
                name="spent_at"
                type="date"
                className="w-full bg-base-200 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="spent_at"
                component="div"
                className="text-error text-sm"
              />
            </div>
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
              placeholder="Notas adicionales sobre este gasto..."
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Registrar
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
