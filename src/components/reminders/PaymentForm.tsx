"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Loader2,
  Plus,
} from "lucide-react";
import { createPaymentSchema } from "@/lib/validations/reminder.schemas";
import api from "@/lib/axios";
import { DEFAULT_CURRENCY } from "@/config/constants";

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
    paid_at: new Date().toISOString().split("T")[0],
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
          console.error("Error creating payment:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {success && (
            <div className="rounded-xl bg-secondary/10 p-4 flex items-center gap-3 text-secondary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-(family-name:--font-body) text-sm font-medium">
                Pago registrado exitosamente.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                Monto pagado ({DEFAULT_CURRENCY})
              </label>
              <Field
                name="amount_paid"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="amount_paid"
                component="div"
                className="font-(family-name:--font-body) text-error text-xs mt-2"
              />
            </div>

            <div>
              <label className="font-(family-name:--font-body) text-[10px] font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha de pago
              </label>
              <Field
                name="paid_at"
                type="date"
                className="w-full bg-base-300 rounded-xl border-none px-4 py-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="paid_at"
                component="div"
                className="font-(family-name:--font-body) text-error text-xs mt-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary rounded-xl px-5 py-3 font-(family-name:--font-body) text-sm font-bold text-primary-content flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
