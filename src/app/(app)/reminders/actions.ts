'use server';

import { searchRemindersWithPaymentStatus } from '@/lib/api/remindersWithPayments';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function searchRemindersAction(
  query: string,
  category: string | null,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  return searchRemindersWithPaymentStatus(user.id, query, category);
}
