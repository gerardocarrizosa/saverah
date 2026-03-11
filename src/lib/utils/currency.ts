import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_REGION } from '@/config/constants';

export class CurrencyFormatter {
  private region: string;
  private currency: string;
  private defaultMaxFractionDigits: number;

  constructor(options: {
    region: string;
    currency: string;
    defaultMaxFractionDigits?: number;
  }) {
    this.region = options.region;
    this.currency = options.currency;
    this.defaultMaxFractionDigits = options.defaultMaxFractionDigits ?? 2;
  }

  format(amount: number, options?: { maximumFractionDigits?: number }): string {
    const maxFractionDigits =
      options?.maximumFractionDigits ?? this.defaultMaxFractionDigits;

    const formatter = new Intl.NumberFormat(this.region, {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: maxFractionDigits,
    });

    return formatter.format(amount);
  }
}

export const currencyFormatter = new CurrencyFormatter({
  region: DEFAULT_CURRENCY_REGION,
  currency: DEFAULT_CURRENCY,
});

export function formatCurrency(
  amount: number,
  maximumFractionDigits?: number,
): string {
  return currencyFormatter.format(amount, { maximumFractionDigits });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
