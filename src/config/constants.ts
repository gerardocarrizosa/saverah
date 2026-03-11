export const EXPENSE_CATEGORIES = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Tecnología',
  'Ahorro',
  'Otros',
] as const;

export const REMINDER_CATEGORIES = [
  'Tarjeta de Crédito',
  'Servicios',
  'Suscripción',
  'Alquiler',
  'Préstamo',
  'Seguro',
  'Impuestos',
  'Otros',
] as const;

export const INCOME_TYPES = [
  { value: 'steady', label: 'Fijo' },
  { value: 'variable', label: 'Variable' },
  { value: 'other', label: 'Otro' },
] as const;

export const RECURRENCE_TYPES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
  { value: 'weekly', label: 'Semanal' },
] as const;

export const APP_NAME = 'Saverah';

export const DEFAULT_CURRENCY_REGION = 'es-MX';

export const DEFAULT_CURRENCY = 'MXN';

export const categoryEmojis: Record<string, string> = {
  'Tarjeta de Crédito': '💳',
  Servicios: '⚡',
  Suscripción: '📱',
  Alquiler: '🏠',
  Préstamo: '📊',
  Seguro: '🛡️',
  Impuestos: '📄',
  Otros: '📦',
};
