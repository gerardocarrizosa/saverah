'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Plus, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import { createPaymentSchema } from '@/lib/validations/reminder.schemas';
import api from '@/lib/axios';
import { DEFAULT_CURRENCY } from '@/config/constants';

interface PaymentFormProps {
  reminderId: string;
  onSuccess: () => void;
}

interface PaymentFormValues {
  amount_paid: number;
  paid_at: string;
}

export function PaymentForm({ reminderId, onSuccess }: PaymentFormProps) {
  const [success, setSuccess] = useState(false);

  const initialValues: PaymentFormValues = {
    amount_paid: 0,
    paid_at: new Date().toISOString().split('T')[0],
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createPaymentSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await api.post(`/reminders/${reminderId}/payments`, {
            amount_paid: values.amount_paid,
            paid_at: values.paid_at,
          });
          
          setSuccess(true);
          resetForm();
          onSuccess();
          
          setTimeout(() => setSuccess(false), 3000);
        } catch (error: unknown) {
          console.error('Error creating payment:', error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Pago registrado exitosamente!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto pagado ({DEFAULT_CURRENCY})
                </span>
              </label>
              <Field
                name="amount_paid"
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="amount_paid"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de pago
                </span>
              </label>
              <Field
                name="paid_at"
                type="date"
                className="input input-bordered w-full"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="paid_at"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>
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
                <Plus className="w-4 h-4" />
                Registrar pago
              </>
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
}
