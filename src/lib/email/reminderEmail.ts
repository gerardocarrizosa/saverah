import type { Reminder, ReminderNotificationTiming } from '@/types/reminder.types';
import { getNotificationTimingLabel } from '@/lib/utils/reminders';
import { formatDate } from '@/lib/utils/dates';

type ReminderEmailInput = {
  reminder: Pick<Reminder, 'name'>;
  dueDate: string;
  timingDaysBefore: ReminderNotificationTiming;
};

export function buildReminderEmail({
  reminder,
  dueDate,
  timingDaysBefore,
}: ReminderEmailInput): { subject: string; text: string; html: string } {
  const timingLabel = getNotificationTimingLabel(timingDaysBefore).toLowerCase();
  const dueText = timingDaysBefore === 0 ? 'vence hoy' : `vence ${timingLabel}`;
  const formattedDueDate = formatDate(dueDate);
  const subject =
    timingDaysBefore === 0
      ? `Recordatorio: ${reminder.name} vence hoy`
      : `Recordatorio: ${reminder.name} vence ${timingLabel}`;

  const text = [
    `Tu recordatorio "${reminder.name}" ${dueText}.`,
    `Fecha de vencimiento: ${formattedDueDate}.`,
    'Si ya completaste este pago, márcalo como pagado en Saverah para evitar futuros avisos de este ciclo.',
  ].join('\n\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Tu recordatorio <strong>${reminder.name}</strong> ${dueText}.</p>
      <p><strong>Fecha de vencimiento:</strong> ${formattedDueDate}</p>
      <p>Si ya completaste este pago, márcalo como pagado en Saverah para evitar futuros avisos de este ciclo.</p>
    </div>
  `;

  return { subject, text, html };
}
