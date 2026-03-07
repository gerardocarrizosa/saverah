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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}
