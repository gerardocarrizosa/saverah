'use client';

import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/reminders/PaymentForm';

interface PaymentFormClientProps {
  reminderId: string;
}

export function PaymentFormClient({ reminderId }: PaymentFormClientProps) {
  const router = useRouter();
  
  return (
    <PaymentForm
      reminderId={reminderId}
      onSuccess={() => {
        router.refresh();
      }}
    />
  );
}
