'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type { ReminderAnalytics } from '@/types/reminder.types';

export function useAnalytics(reminderId: string) {
  const [analytics, setAnalytics] = useState<ReminderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: ReminderAnalytics }>(`/analytics/reminders/${reminderId}`);
      setAnalytics(res.data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reminderId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderId]);

  return {
    analytics,
    loading,
    error,
    refresh,
  };
}
