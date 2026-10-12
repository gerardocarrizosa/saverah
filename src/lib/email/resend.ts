import 'server-only';

import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getReminderEmailSender(): string {
  const from = process.env.REMINDER_EMAIL_FROM?.trim();

  if (!from) {
    throw new Error('Falta configurar REMINDER_EMAIL_FROM para enviar recordatorios por correo.');
  }

  return from;
}

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Falta configurar RESEND_API_KEY para enviar recordatorios por correo.');
  }

  resendClient ??= new Resend(apiKey);
  return resendClient;
}
