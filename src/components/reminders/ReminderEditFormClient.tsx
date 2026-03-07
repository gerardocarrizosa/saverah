'use client';

import { useRouter } from 'next/navigation';
import { ReminderEditForm } from '@/components/reminders/ReminderEditForm';
import type { Reminder } from '@/types/reminder.types';

interface ReminderEditFormClientProps {
  reminder: Reminder;
}

export function ReminderEditFormClient({ reminder }: ReminderEditFormClientProps) {
  const router = useRouter();
  
  return (
    <ReminderEditForm
      reminder={reminder}
      onSuccess={() => {
        router.refresh();
      }}
    />
  );
}
