import { Calendar, Receipt } from "lucide-react";
import { PaymentHistoryActionsClient } from "@/components/reminders/PaymentHistoryActionsClient";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { ReminderPayment } from "@/types/reminder.types";

interface PaymentHistoryProps {
  reminderId: string;
  payments: ReminderPayment[];
}

export function PaymentHistory({ reminderId, payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12 bg-base-300/50 rounded-xl">
        <div className="w-14 h-14 rounded-2xl bg-base-300 mx-auto mb-4 flex items-center justify-center">
          <Receipt className="w-7 h-7 text-base-content/30" />
        </div>
        <p className="font-(family-name:--font-headline) text-lg font-bold text-base-content">
          No hay pagos registrados aún
        </p>
        <p className="font-(family-name:--font-body) text-sm text-base-content/40 mt-1">
          Registra tu primer pago usando el formulario de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id}>
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <p className="font-(family-name:--font-headline) font-bold text-lg text-base-content">
                  {formatCurrency(payment.amount_paid)}
                </p>
                <p className="font-(family-name:--font-body) text-xs text-base-content/50 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(payment.paid_at)}
                </p>
              </div>
            </div>

            <PaymentHistoryActionsClient
              reminderId={reminderId}
              payment={payment}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
