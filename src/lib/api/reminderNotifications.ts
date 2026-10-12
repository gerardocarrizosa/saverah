import type { PostgrestError } from '@supabase/supabase-js';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getReminderEmailSender, getResendClient } from '@/lib/email/resend';
import { buildReminderEmail } from '@/lib/email/reminderEmail';
import {
  formatDateForDatabase,
  getConcreteDueDate,
  isNotificationDateMatch,
  normalizeDate,
} from '@/lib/utils/dates';
import { checkIfPaidForCurrentCycle } from '@/lib/utils/reminders';
import type {
  NotificationOutcome,
  NotificationRunResult,
  Reminder,
  ReminderNotification,
  ReminderNotificationStatus,
  ReminderNotificationTiming,
  ReminderPayment,
} from '@/types/reminder.types';

type NotificationReminder = Reminder & { is_active: boolean };

const DUPLICATE_ERROR_CODE = '23505';

function toNotificationDate(date?: string): Date {
  if (!date) return normalizeDate();

  const [year, month, day] = date.split('-').map(Number);
  return normalizeDate(new Date(year, month - 1, day));
}

function isDuplicateSentError(error: PostgrestError): boolean {
  return error.code === DUPLICATE_ERROR_CODE;
}

async function recordNotification(
  input: {
    userId: string;
    reminderId: string;
    notificationDate: string;
    dueDate: string;
    timingDaysBefore: ReminderNotificationTiming;
    status: ReminderNotificationStatus;
    recipientEmail?: string | null;
    providerMessageId?: string | null;
    errorMessage?: string | null;
  },
): Promise<ReminderNotification> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('reminder_notifications')
    .insert({
      user_id: input.userId,
      reminder_id: input.reminderId,
      channel: 'email',
      notification_date: input.notificationDate,
      due_date: input.dueDate,
      timing_days_before: input.timingDaysBefore,
      status: input.status,
      recipient_email: input.recipientEmail ?? null,
      provider: 'resend',
      provider_message_id: input.providerMessageId ?? null,
      error_message: input.errorMessage?.slice(0, 300) ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('No se pudo registrar el resultado del aviso.');

  return data as ReminderNotification;
}

function toOutcome(
  reminderId: string,
  timingDaysBefore: ReminderNotificationTiming,
  status: ReminderNotificationStatus,
  record?: ReminderNotification,
  extra?: { providerMessageId?: string; errorMessage?: string },
): NotificationOutcome {
  return {
    reminder_id: reminderId,
    timing_days_before: timingDaysBefore,
    status,
    ...(record ? { notification_id: record.id } : {}),
    ...(extra?.providerMessageId
      ? { provider_message_id: extra.providerMessageId }
      : {}),
    ...(extra?.errorMessage ? { error_message: extra.errorMessage } : {}),
  };
}

export async function runReminderEmailNotifications(
  notificationDateInput?: string,
): Promise<NotificationRunResult> {
  const notificationDate = toNotificationDate(notificationDateInput);
  const notificationDateString = formatDateForDatabase(notificationDate);
  const supabase = createSupabaseServiceClient();

  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_active', true)
    .eq('email_notifications_enabled', true);

  if (remindersError) throw remindersError;

  const activeReminders = (reminders ?? []) as NotificationReminder[];
  const reminderIds = activeReminders.map((reminder) => reminder.id);

  const [paymentsResult, sentNotificationsResult] = await Promise.all([
    reminderIds.length
      ? supabase
          .from('reminder_payments')
          .select('*')
          .in('reminder_id', reminderIds)
      : Promise.resolve({ data: [], error: null }),
    reminderIds.length
      ? supabase
          .from('reminder_notifications')
          .select('*')
          .eq('channel', 'email')
          .eq('status', 'sent')
          .eq('notification_date', notificationDateString)
          .in('reminder_id', reminderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (paymentsResult.error) throw paymentsResult.error;
  if (sentNotificationsResult.error) throw sentNotificationsResult.error;

  const paymentsByReminder = new Map<string, ReminderPayment[]>();
  ((paymentsResult.data ?? []) as ReminderPayment[]).forEach((payment) => {
    const reminderPayments = paymentsByReminder.get(payment.reminder_id) ?? [];
    reminderPayments.push(payment);
    paymentsByReminder.set(payment.reminder_id, reminderPayments);
  });

  const sentKeys = new Set(
    ((sentNotificationsResult.data ?? []) as ReminderNotification[]).map(
      (notification) =>
        `${notification.reminder_id}:${notification.timing_days_before}`,
    ),
  );

  const userEmailById = new Map<string, string | null>();

  await Promise.all(
    [...new Set(activeReminders.map((reminder) => reminder.user_id))].map(
      async (userId) => {
        const { data } = await supabase.auth.admin.getUserById(userId);
        userEmailById.set(userId, data.user?.email ?? null);
      },
    ),
  );

  const result: NotificationRunResult = {
    notification_date: notificationDateString,
    evaluated_count: 0,
    sent_count: 0,
    failed_count: 0,
    skipped_count: 0,
    sent: [],
    failed: [],
    skipped: [],
  };

  for (const reminder of activeReminders) {
    const dueDate = getConcreteDueDate(
      reminder.due_day,
      reminder.recurrence,
      notificationDate,
    );
    const dueDateString = formatDateForDatabase(dueDate);
    const timings = reminder.email_notification_timings ?? [];

    for (const timingDaysBefore of timings) {
      if (!isNotificationDateMatch(dueDate, notificationDate, timingDaysBefore)) {
        continue;
      }

      result.evaluated_count += 1;

      const sentKey = `${reminder.id}:${timingDaysBefore}`;
      if (sentKeys.has(sentKey)) {
        const record = await recordNotification({
          userId: reminder.user_id,
          reminderId: reminder.id,
          notificationDate: notificationDateString,
          dueDate: dueDateString,
          timingDaysBefore,
          status: 'skipped',
          errorMessage: 'Ya se envió este aviso.',
        });
        result.skipped.push(
          toOutcome(reminder.id, timingDaysBefore, 'skipped', record, {
            errorMessage: 'Ya se envió este aviso.',
          }),
        );
        result.skipped_count += 1;
        continue;
      }

      const payments = paymentsByReminder.get(reminder.id) ?? [];
      const { isPaidForCurrentCycle } = checkIfPaidForCurrentCycle(
        reminder,
        payments,
        notificationDate,
      );

      if (isPaidForCurrentCycle) {
        const record = await recordNotification({
          userId: reminder.user_id,
          reminderId: reminder.id,
          notificationDate: notificationDateString,
          dueDate: dueDateString,
          timingDaysBefore,
          status: 'skipped',
          errorMessage: 'Recordatorio ya pagado en el ciclo actual.',
        });
        result.skipped.push(
          toOutcome(reminder.id, timingDaysBefore, 'skipped', record, {
            errorMessage: 'Recordatorio ya pagado en el ciclo actual.',
          }),
        );
        result.skipped_count += 1;
        continue;
      }

      const recipientEmail = userEmailById.get(reminder.user_id) ?? null;
      if (!recipientEmail) {
        const record = await recordNotification({
          userId: reminder.user_id,
          reminderId: reminder.id,
          notificationDate: notificationDateString,
          dueDate: dueDateString,
          timingDaysBefore,
          status: 'skipped',
          errorMessage: 'El usuario no tiene correo registrado.',
        });
        result.skipped.push(
          toOutcome(reminder.id, timingDaysBefore, 'skipped', record, {
            errorMessage: 'El usuario no tiene correo registrado.',
          }),
        );
        result.skipped_count += 1;
        continue;
      }

      try {
        const email = buildReminderEmail({
          reminder,
          dueDate: dueDateString,
          timingDaysBefore,
        });
        const resend = getResendClient();
        const sendResult = await resend.emails.send({
          from: getReminderEmailSender(),
          to: recipientEmail,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });
        const providerMessageId = sendResult.data?.id ?? null;
        const record = await recordNotification({
          userId: reminder.user_id,
          reminderId: reminder.id,
          notificationDate: notificationDateString,
          dueDate: dueDateString,
          timingDaysBefore,
          status: 'sent',
          recipientEmail,
          providerMessageId,
        });

        sentKeys.add(sentKey);
        result.sent.push(
          toOutcome(reminder.id, timingDaysBefore, 'sent', record, {
            providerMessageId: providerMessageId ?? undefined,
          }),
        );
        result.sent_count += 1;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo enviar el aviso.';

        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          isDuplicateSentError(error as PostgrestError)
        ) {
          result.skipped.push(
            toOutcome(reminder.id, timingDaysBefore, 'skipped', undefined, {
              errorMessage: 'Ya se envió este aviso.',
            }),
          );
          result.skipped_count += 1;
          continue;
        }

        const record = await recordNotification({
          userId: reminder.user_id,
          reminderId: reminder.id,
          notificationDate: notificationDateString,
          dueDate: dueDateString,
          timingDaysBefore,
          status: 'failed',
          recipientEmail,
          errorMessage,
        });
        result.failed.push(
          toOutcome(reminder.id, timingDaysBefore, 'failed', record, {
            errorMessage,
          }),
        );
        result.failed_count += 1;
      }
    }
  }

  return result;
}
