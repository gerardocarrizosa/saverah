'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { 
  Calendar, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { createPaymentSchema } from '@/lib/validations/reminder.schemas';
import api from '@/lib/axios';
import { DEFAULT_CURRENCY } from '@/config/constants';
import type { ReminderPayment } from '@/types/reminder.types';

interface PaymentHistoryProps {
  reminderId: string;
  payments: ReminderPayment[];
  onUpdate: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PaymentHistory({ reminderId, payments, onUpdate }: PaymentHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (paymentId: string) => {
    if (confirmDelete === paymentId) {
      setDeletingId(paymentId);
      try {
        await api.delete(`/reminders/${reminderId}/payments/${paymentId}`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting payment:', error);
      } finally {
        setDeletingId(null);
        setConfirmDelete(null);
      }
    } else {
      setConfirmDelete(paymentId);
      setTimeout(() => setConfirmDelete((current) => current === paymentId ? null : current), 3000);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 bg-base-200/50 rounded-xl">
        <Receipt className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
        <p className="text-base-content/60">No hay pagos registrados aún</p>
        <p className="text-sm text-base-content/40 mt-1">
          Registra tu primer pago usando el formulario de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id}>
          {editingId === payment.id ? (
            <PaymentEditForm
              reminderId={reminderId}
              payment={payment}
              onSuccess={() => {
                setEditingId(null);
                onUpdate();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{formatCurrency(payment.amount_paid)}</p>
                  <p className="text-sm text-base-content/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(payment.paid_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(payment.id)}
                  className="btn btn-sm btn-ghost"
                  title="Editar pago"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(payment.id)}
                  disabled={deletingId === payment.id}
                  className={`btn btn-sm ${confirmDelete === payment.id ? 'btn-error' : 'btn-ghost text-error'}`}
                  title={confirmDelete === payment.id ? 'Confirmar eliminación' : 'Eliminar pago'}
                >
                  {deletingId === payment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          
          {confirmDelete === payment.id && editingId !== payment.id && (
            <div className="alert alert-warning alert-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Haz clic nuevamente para confirmar la eliminación</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface PaymentEditFormProps {
  reminderId: string;
  payment: ReminderPayment;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentEditForm({ reminderId, payment, onSuccess, onCancel }: PaymentEditFormProps) {
  const [, setSubmitting] = useState(false);

  return (
    <Formik
      initialValues={{
        amount_paid: payment.amount_paid,
        paid_at: payment.paid_at.split('T')[0],
      }}
      validationSchema={createPaymentSchema}
      onSubmit={async (values) => {
        setSubmitting(true);
        try {
          await api.patch(`/reminders/${reminderId}/payments/${payment.id}`, {
            amount_paid: values.amount_paid,
            paid_at: values.paid_at,
          });
          onSuccess();
        } catch (error) {
          console.error('Error updating payment:', error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting: formSubmitting }) => (
        <Form className="flex items-center gap-2 p-4 bg-base-200 rounded-xl">
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <Field
                name="amount_paid"
                type="number"
                min="0"
                step="0.01"
                className="input input-sm input-bordered w-full pl-10"
                disabled={formSubmitting}
              />
            </div>
            <ErrorMessage
              name="amount_paid"
              component="div"
              className="text-error text-xs mt-1"
            />
          </div>
          
          <div className="flex-1">
            <Field
              name="paid_at"
              type="date"
              className="input input-sm input-bordered w-full"
              disabled={formSubmitting}
            />
            <ErrorMessage
              name="paid_at"
              component="div"
              className="text-error text-xs mt-1"
            />
          </div>
          
          <button
            type="submit"
            disabled={formSubmitting}
            className="btn btn-sm btn-success"
          >
            {formSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={formSubmitting}
            className="btn btn-sm btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </Form>
      )}
    </Formik>
  );
}
