"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Edit2,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { createPaymentSchema } from "@/lib/validations/reminder.schemas";
import type { ReminderPayment } from "@/types/reminder.types";

interface PaymentHistoryActionsClientProps {
  reminderId: string;
  payment: ReminderPayment;
}

export function PaymentHistoryActionsClient({
  reminderId,
  payment,
}: PaymentHistoryActionsClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/reminders/${reminderId}/payments/${payment.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setIsEditing((current) => !current);
            setConfirmDelete(false);
          }}
          className="w-9 h-9 rounded-lg text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors flex items-center justify-center"
          title={isEditing ? "Cancelar edición" : "Editar pago"}
          type="button"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`w-9 h-9 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 ${
            confirmDelete
              ? "bg-accent text-accent-content"
              : "text-accent hover:bg-accent/10"
          }`}
          title={confirmDelete ? "Confirmar eliminación" : "Eliminar pago"}
          type="button"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {confirmDelete && !isEditing && (
        <div className="rounded-xl bg-accent/10 px-3 py-2 flex items-center gap-2 text-accent">
          <AlertCircle className="w-4 h-4" />
          <span className="font-(family-name:--font-body) text-xs">
            Haz clic nuevamente para confirmar.
          </span>
        </div>
      )}

      {isEditing && (
        <PaymentEditForm
          reminderId={reminderId}
          payment={payment}
          onSuccess={() => {
            setIsEditing(false);
            router.refresh();
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

interface PaymentEditFormProps {
  reminderId: string;
  payment: ReminderPayment;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentEditForm({
  reminderId,
  payment,
  onSuccess,
  onCancel,
}: PaymentEditFormProps) {
  return (
    <Formik
      initialValues={{
        amount_paid: payment.amount_paid,
        paid_at: payment.paid_at.split("T")[0],
      }}
      validationSchema={createPaymentSchema}
      onSubmit={async (values) => {
        try {
          await api.patch(`/reminders/${reminderId}/payments/${payment.id}`, {
            amount_paid: values.amount_paid,
            paid_at: values.paid_at,
          });
          onSuccess();
        } catch (error) {
          console.error("Error updating payment:", error);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="grid w-[min(26rem,calc(100vw-4rem))] grid-cols-1 gap-3 p-4 bg-base-200 rounded-xl shadow-lg md:grid-cols-[1fr_1fr_auto] md:w-[36rem]">
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <Field
                name="amount_paid"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-base-300 rounded-xl border-none px-4 py-3 pl-10 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isSubmitting}
              />
            </div>
            <ErrorMessage
              name="amount_paid"
              component="div"
              className="font-(family-name:--font-body) text-error text-xs mt-2"
            />
          </div>

          <div className="flex-1">
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

          <div className="flex items-start gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-11 h-11 rounded-xl text-base-content/50 hover:text-base-content hover:bg-base-300 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
