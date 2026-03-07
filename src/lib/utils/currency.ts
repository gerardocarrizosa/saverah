const CURRENCY_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
