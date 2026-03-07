import * as Yup from 'yup';

const CREDIT_CARD_CATEGORY = 'Tarjeta de Crédito';

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
