export function getDaysUntilDue(
  dueDay: number,
  recurrence: 'monthly' | 'yearly' | 'weekly',
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDueDate: Date;

  switch (recurrence) {
    case 'monthly':
      nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
      }
      break;

    case 'yearly':
      nextDueDate = new Date(today.getFullYear(), 0, dueDay);
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear() + 1, 0, dueDay);
      }
      break;

    case 'weekly':
      const dayOfWeek = today.getDay();
      const daysUntilDueDay = (dueDay - dayOfWeek + 7) % 7;
      nextDueDate = new Date(today);
      nextDueDate.setDate(today.getDate() + daysUntilDueDay);
      if (nextDueDate <= today) {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      }
      break;

    default:
      nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  }

  const diffTime = nextDueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function normalizeDate(date: Date = new Date()): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function formatDateForDatabase(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getClampedMonthlyDate(year: number, month: number, dueDay: number): Date {
  return new Date(year, month, Math.min(dueDay, getDaysInMonth(year, month)));
}

export function getConcreteDueDate(
  dueDay: number,
  recurrence: 'monthly' | 'yearly' | 'weekly',
  referenceDate: Date = new Date(),
): Date {
  const reference = normalizeDate(referenceDate);

  switch (recurrence) {
    case 'monthly': {
      let dueDate = getClampedMonthlyDate(
        reference.getFullYear(),
        reference.getMonth(),
        dueDay,
      );

      if (dueDate < reference) {
        dueDate = getClampedMonthlyDate(
          reference.getFullYear(),
          reference.getMonth() + 1,
          dueDay,
        );
      }

      return dueDate;
    }

    case 'yearly': {
      let dueDate = getClampedMonthlyDate(reference.getFullYear(), 0, dueDay);

      if (dueDate < reference) {
        dueDate = getClampedMonthlyDate(reference.getFullYear() + 1, 0, dueDay);
      }

      return dueDate;
    }

    case 'weekly': {
      const daysUntilDueDay = (dueDay - reference.getDay() + 7) % 7;
      const dueDate = new Date(reference);
      dueDate.setDate(reference.getDate() + daysUntilDueDay);
      return dueDate;
    }
  }
}

export function getNotificationDateForDueDate(
  dueDate: Date,
  timingDaysBefore: number,
): Date {
  const notificationDate = normalizeDate(dueDate);
  notificationDate.setDate(notificationDate.getDate() - timingDaysBefore);
  return notificationDate;
}

export function isNotificationDateMatch(
  dueDate: Date,
  notificationDate: Date,
  timingDaysBefore: number,
): boolean {
  return (
    formatDateForDatabase(getNotificationDateForDueDate(dueDate, timingDaysBefore)) ===
    formatDateForDatabase(normalizeDate(notificationDate))
  );
}

export function getDaysUntilCutoff(cutoffDay: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate next cutoff date (always monthly)
  let nextCutoffDate = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
  if (nextCutoffDate < today) {
    nextCutoffDate = new Date(today.getFullYear(), today.getMonth() + 1, cutoffDay);
  }

  const diffTime = nextCutoffDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function isOverdue(daysUntilDue: number): boolean {
  return daysUntilDue < 0;
}

export function isCutoffSoon(daysUntilCutoff: number): boolean {
  return daysUntilCutoff >= 0 && daysUntilCutoff <= 3;
}

export function formatDate(
  dateString: string,
  options: { includeYear?: boolean } = {},
): string {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(dateString);

  return date.toLocaleDateString('es-ES', {
    ...(options.includeYear === false ? {} : { year: 'numeric' }),
    month: 'long',
    day: 'numeric',
  });
}

export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}
