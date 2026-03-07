import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminders } from '@/lib/api/reminders';
import { getDaysUntilDue, isOverdue } from '@/lib/utils/dates';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ReminderList } from '@/components/reminders/ReminderList';
import { ReminderStats } from '@/components/reminders/ReminderStats';
import { CategoryFilterClient } from '@/components/reminders/CategoryFilterClient';
import { Plus, Bell } from 'lucide-react';

import type { Reminder } from '@/types/reminder.types';

// Type for reminder with calculated fields
type ReminderWithDays = Reminder & {
  daysUntilDue: number;
  isOverdue: boolean;
};

// Server action to toggle reminder active status
async function toggleReminderActive(id: string, isActive: boolean) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autorizado');
  
  const { error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

// Server action to delete reminder
async function deleteReminder(id: string) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autorizado');
  
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

// Server action to search reminders
async function searchReminders(query: string, category: string | null) {
  'use server';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autorizado');
  
  let dbQuery = supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id);
  
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }
  
  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }
  
  const { data, error } = await dbQuery.order('due_day', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

interface RemindersPageProps {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
  }>;
}

function RemindersLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🗓️
          </div>
        </div>
        <p className="text-base-content/60">Cargando recordatorios...</p>
      </div>
    </div>
  );
}

export default async function RemindersPage({ searchParams }: RemindersPageProps) {
  const { q: searchQuery = '', category: selectedCategory = null } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch reminders (with search if query exists)
  let reminders: ReminderWithDays[];
  
  if (searchQuery || selectedCategory) {
    const rawReminders = await searchReminders(searchQuery, selectedCategory);
    reminders = rawReminders.map(r => ({
      ...r,
      daysUntilDue: getDaysUntilDue(r.due_day, r.recurrence),
      isOverdue: isOverdue(getDaysUntilDue(r.due_day, r.recurrence)),
    }));
  } else {
    const rawReminders = await getReminders(user.id);
    reminders = rawReminders.map(r => ({
      ...r,
      daysUntilDue: getDaysUntilDue(r.due_day, r.recurrence),
      isOverdue: isOverdue(getDaysUntilDue(r.due_day, r.recurrence)),
    }));
  }

  // Calculate stats
  const total = reminders.length;
  const active = reminders.filter(r => r.is_active).length;
  const inactive = reminders.filter(r => !r.is_active).length;
  const upcoming = reminders.filter(r => r.is_active && r.daysUntilDue > 0 && r.daysUntilDue <= 7).length;
  const overdue = reminders.filter(r => r.is_active && (r.isOverdue || r.daysUntilDue <= 3)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <span className="text-4xl">🗓️</span>
            Recordatorios de pagos
          </h1>
          <p className="text-base-content/70 mt-1 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Nunca olvides un pago importante
          </p>
        </div>
        <Link 
          href="/reminders/new" 
          className="btn btn-primary gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Agregar recordatorio
        </Link>
      </div>

      {/* Stats */}
      <ReminderStats 
        total={total}
        active={active}
        upcoming={upcoming}
        overdue={overdue}
        inactive={inactive}
      />

      {/* Search & Filter */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <Suspense fallback={<div className="loading loading-spinner"></div>}>
            <CategoryFilterClient 
              initialQuery={searchQuery}
              initialCategory={selectedCategory}
            />
          </Suspense>
        </div>
      </div>

      {/* Reminders List */}
      <Suspense fallback={<RemindersLoading />}>
        <ReminderList 
          reminders={reminders}
          onToggleActive={toggleReminderActive}
          onDelete={deleteReminder}
        />
      </Suspense>

      {/* Empty State */}
      {total === 0 && !searchQuery && !selectedCategory && (
        <div className="card bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/20">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-xl font-bold mb-2">¡Comienza a organizar tus pagos!</h3>
            <p className="text-base-content/60 max-w-lg mx-auto mb-6">
              Agrega tus tarjetas de crédito, servicios, suscripciones y otros pagos recurrentes. 
              Te avisaremos antes de que venzan.
            </p>
            <Link href="/reminders/new" className="btn btn-primary gap-2">
              <Plus className="w-5 h-5" />
              Crear primer recordatorio
            </Link>
          </div>
        </div>
      )}

      {/* No Results */}
      {total === 0 && (searchQuery || selectedCategory) && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
          <p className="text-base-content/60">
            Intenta con otros términos de búsqueda o categorías
          </p>
        </div>
      )}
    </div>
  );
}
