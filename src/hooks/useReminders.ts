'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type { Reminder } from '@/types/reminder.types';

export function useReminders(initialData: Reminder[] = []) {
  const [reminders, setReminders] = useState<Reminder[]>(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Reminder[] }>('/reminders');
      setReminders(res.data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar recordatorios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData.length) refresh();
  }, []);

  const createReminder = async (data: { name: string; due_day: number; cutoff_day?: number; category: string; recurrence: 'monthly' | 'yearly' | 'weekly'; notes?: string }) => {
    const res = await api.post<{ data: Reminder }>('/reminders', data);
    setReminders((prev) => [...prev, res.data.data]);
    return res.data.data;
  };

  const updateReminder = async (id: string, data: Partial<Reminder>) => {
    const res = await api.patch<{ data: Reminder }>(`/reminders/${id}`, data);
    setReminders((prev) => prev.map((r) => (r.id === id ? res.data.data : r)));
    return res.data.data;
  };

  const deleteReminder = async (id: string) => {
    await api.delete(`/reminders/${id}`);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    reminders,
    loading,
    error,
    refresh,
    createReminder,
    updateReminder,
    deleteReminder,
  };
}
