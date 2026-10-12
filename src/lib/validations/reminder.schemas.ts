import * as Yup from 'yup';

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';
const VALID_EMAIL_NOTIFICATION_TIMINGS = [0, 1, 3, 7] as const;

const emailNotificationFields = {
  email_notifications_enabled: Yup.boolean().default(false),
  email_notification_timings: Yup.array()
    .of(
      Yup.number()
        .oneOf([...VALID_EMAIL_NOTIFICATION_TIMINGS], 'Selecciona un momento de aviso válido')
        .required(),
    )
    .default([])
    .when('email_notifications_enabled', {
      is: true,
      then: (schema) =>
        schema.min(1, 'Selecciona al menos un momento para recibir avisos por correo'),
      otherwise: (schema) => schema.max(0).default([]),
    }),
};

export const createReminderSchema = Yup.object({
  name: Yup.string()
    .required('El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  due_day: Yup.number()
    .required('El día de vencimiento es requerido')
    .min(1, 'Debe ser al menos 1')
    .max(31, 'Debe ser 31 o menos'),
  cutoff_day: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(1, 'Debe ser al menos 1')
    .max(31, 'Debe ser 31 o menos')
    .when('category', {
      is: CREDIT_CARD_CATEGORY,
      then: (schema) => schema.required('La fecha de corte es requerida para tarjetas de crédito'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  category: Yup.string().required('La categoría es requerida'),
  recurrence: Yup.string()
    .oneOf(['monthly', 'yearly', 'weekly'])
    .required('La recurrencia es requerida'),
  notes: Yup.string().optional().max(500),
  ...emailNotificationFields,
});

export const updateReminderSchema = createReminderSchema.partial();

export type CreateReminderInput = Yup.InferType<typeof createReminderSchema>;

export const createPaymentSchema = Yup.object({
  amount_paid: Yup.number()
    .required('El monto es requerido')
    .positive('Debe ser un número positivo'),
  paid_at: Yup.date().required('La fecha es requerida'),
});

export type CreatePaymentInput = Yup.InferType<typeof createPaymentSchema>;

export type UpdateReminderInput = Yup.InferType<typeof updateReminderSchema>;
