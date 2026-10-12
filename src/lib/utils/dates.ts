export type ReminderRecurrence = 'monthly' | 'yearly' | 'weekly';

export type ReminderDueStatus = {
  daysUntilDue: number;
  isOverdue: boolean;
  isDueToday: boolean;
  currentDueDate: Date;
  nextDueDate: Date;
};

export type ReminderUrgencyLevel =
  | 'paid'
  | 'inactive'
  | 'overdue'
  | 'urgent'
  | 'soon'
  | 'future';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE ?? 'America/Mexico_City';

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

function startOfCalendarDay(date: Date = new Date(), timeZone = DEFAULT_TIME_ZONE): Date {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);

  return new Date(year, month - 1, day);
}

function daysBetweenCalendarDates(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

function clampDayToMonth(year: number, month: number, day: number): number {
  return Math.min(day, new Date(year, month + 1, 0).getDate());
}

function getMonthlyDate(year: number, month: number, dueDay: number): Date {
  return new Date(year, month, clampDayToMonth(year, month, dueDay));
}

function getNextMonthlyDate(today: Date, dueDay: number): Date {
  const currentMonthDueDate = getMonthlyDate(
    today.getFullYear(),
    today.getMonth(),
    dueDay,
  );

  if (currentMonthDueDate >= today) {
    return currentMonthDueDate;
  }

  return getMonthlyDate(today.getFullYear(), today.getMonth() + 1, dueDay);
}

function getYearlyDate(year: number, dueDay: number): Date {
  return new Date(year, 0, clampDayToMonth(year, 0, dueDay));
}

function getNextYearlyDate(today: Date, dueDay: number): Date {
  const currentYearDueDate = getYearlyDate(today.getFullYear(), dueDay);

  if (currentYearDueDate >= today) {
    return currentYearDueDate;
  }

  return getYearlyDate(today.getFullYear() + 1, dueDay);
}

function getWeekDueDate(today: Date, dueDay: number): Date {
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const weekDueDate = new Date(currentWeekStart);
  weekDueDate.setDate(currentWeekStart.getDate() + dueDay);

  return weekDueDate;
}

function getNextWeeklyDate(today: Date, dueDay: number): Date {
  const currentWeekDueDate = getWeekDueDate(today, dueDay);

  if (currentWeekDueDate >= today) {
    return currentWeekDueDate;
  }

  const nextWeekDueDate = new Date(currentWeekDueDate);
  nextWeekDueDate.setDate(currentWeekDueDate.getDate() + 7);

  return nextWeekDueDate;
}

export function getReminderDueStatus(
  dueDay: number,
  recurrence: ReminderRecurrence,
  date: Date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): ReminderDueStatus {
  const today = startOfCalendarDay(date, timeZone);
  let nextDueDate: Date;

  switch (recurrence) {
    case 'monthly':
      nextDueDate = getNextMonthlyDate(today, dueDay);
      break;
    case 'yearly':
      nextDueDate = getNextYearlyDate(today, dueDay);
      break;
    case 'weekly':
      nextDueDate = getNextWeeklyDate(today, dueDay);
      break;
  }

  const daysUntilDue = daysBetweenCalendarDates(today, nextDueDate);

  return {
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    isDueToday: daysUntilDue === 0,
    currentDueDate: nextDueDate,
    nextDueDate,
  };
}

export function getDaysUntilDue(
  dueDay: number,
  recurrence: ReminderRecurrence,
  date?: Date,
  timeZone?: string,
): number {
  return getReminderDueStatus(dueDay, recurrence, date, timeZone).daysUntilDue;
}

export function getReminderUrgencyLevel({
  daysUntilDue,
  isActive = true,
  isPaidForCurrentCycle = false,
}: {
  daysUntilDue: number;
  isActive?: boolean;
  isPaidForCurrentCycle?: boolean;
}): ReminderUrgencyLevel {
  if (!isActive) return 'inactive';
  if (isPaidForCurrentCycle) return 'paid';
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'urgent';
  if (daysUntilDue <= 7) return 'soon';
  return 'future';
}

export function getCountdownText(
  daysUntilDue: number,
  options: { paidText?: string; isPaidForCurrentCycle?: boolean } = {},
): string {
  if (options.isPaidForCurrentCycle) return options.paidText ?? 'Pagado';
  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return `Vencido hace ${daysOverdue} ${daysOverdue === 1 ? 'día' : 'días'}`;
  }
  if (daysUntilDue === 0) return 'Vence hoy';
  if (daysUntilDue === 1) return 'Vence mañana';
  return `En ${daysUntilDue} días`;
}

export function getDaysUntilCutoff(
  cutoffDay: number,
  date: Date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): number {
  const today = startOfCalendarDay(date, timeZone);
  const currentCutoffDate = getMonthlyDate(
    today.getFullYear(),
    today.getMonth(),
    cutoffDay,
  );
  const nextCutoffDate =
    currentCutoffDate >= today
      ? currentCutoffDate
      : getMonthlyDate(today.getFullYear(), today.getMonth() + 1, cutoffDay);

  return daysBetweenCalendarDates(today, nextCutoffDate);
}

export function getDaysToPayFromCutoff(
  cutoffDay: number,
  dueDay: number,
  date: Date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): number {
  const today = startOfCalendarDay(date, timeZone);
  const cutoffDate = getMonthlyDate(today.getFullYear(), today.getMonth(), cutoffDay);
  const nextCutoffDate =
    cutoffDate >= today
      ? cutoffDate
      : getMonthlyDate(today.getFullYear(), today.getMonth() + 1, cutoffDay);
  const sameMonthDueDate = getMonthlyDate(
    nextCutoffDate.getFullYear(),
    nextCutoffDate.getMonth(),
    dueDay,
  );
  const dueDate =
    sameMonthDueDate >= nextCutoffDate
      ? sameMonthDueDate
      : getMonthlyDate(
          nextCutoffDate.getFullYear(),
          nextCutoffDate.getMonth() + 1,
          dueDay,
        );

  return daysBetweenCalendarDates(nextCutoffDate, dueDate);
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
