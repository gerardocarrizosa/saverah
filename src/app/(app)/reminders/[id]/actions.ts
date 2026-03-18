'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function toggleReminderStatus(id: string, isActive: boolean) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  const { error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function deleteReminder(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  redirect('/reminders');
}
