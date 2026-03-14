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

          <div className="flex gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="btn btn-ghost flex-1 gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
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
                      Actualizar
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/budget" 
                  className="btn btn-ghost flex-1 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 gap-2"
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
