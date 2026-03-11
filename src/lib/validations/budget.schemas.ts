import * as Yup from 'yup';

export const createIncomeSchema = Yup.object({
  source: Yup.string()
    .required('La fuente es requerida')
    .max(100, 'Máximo 100 caracteres'),
  type: Yup.string()
    .oneOf(['steady', 'variable', 'other'])
    .required('El tipo es requerido'),
  amount: Yup.number()
    .required('El monto es requerido')
    .positive('Debe ser un número positivo'),
  received_at: Yup.date().required('La fecha es requerida'),
  notes: Yup.string().optional().max(500),
});

export const createExpenseSchema = Yup.object({
  description: Yup.string()
    .required('La descripción es requerida')
    .max(200, 'Máximo 200 caracteres'),
  amount: Yup.number()
    .required('El monto es requerido')
    .positive('Debe ser un número positivo'),
  category: Yup.string().required('La categoría es requerida'),
  spent_at: Yup.date().required('La fecha es requerida'),
  notes: Yup.string().optional().max(500),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const updateIncomeSchema = createIncomeSchema.partial();

export const budgetLimitSchema = Yup.object({
  category: Yup.string().required('La categoría es requerida'),
  monthly_limit: Yup.number()
    .required('El límite es requerido')
    .positive('Debe ser un número positivo'),
});

export type CreateIncomeInput = Yup.InferType<typeof createIncomeSchema>;

export type CreateExpenseInput = Yup.InferType<typeof createExpenseSchema>;

export type UpdateExpenseInput = Yup.InferType<typeof updateExpenseSchema>;

export type UpdateIncomeInput = Yup.InferType<typeof updateIncomeSchema>;

export type BudgetLimitInput = Yup.InferType<typeof budgetLimitSchema>;
