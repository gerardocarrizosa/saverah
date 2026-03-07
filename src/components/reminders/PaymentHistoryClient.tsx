'use client';

import { useRouter } from 'next/navigation';
import { PaymentHistory } from '@/components/reminders/PaymentHistory';
import type { ReminderPayment } from '@/types/reminder.types';

interface PaymentHistoryClientProps {
  reminderId: string;
  initialPayments: ReminderPayment[];
}

export function PaymentHistoryClient({ 
  reminderId, 
  initialPayments 
}: PaymentHistoryClientProps) {
  const router = useRouter();
  
  return (
    <PaymentHistory
      reminderId={reminderId}
      payments={initialPayments}
      onUpdate={() => {
        router.refresh();
      }}
    />
  );
}
