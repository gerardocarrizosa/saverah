import { createSupabaseServerClient } from '../supabase/server';
import type { EstimatedReminderAmount } from '@/types/dashboard.types';

export async function getEstimatedReminderAmounts(
  userId: string
): Promise<EstimatedReminderAmount[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('estimated_reminder_amounts')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
}

export async function getEstimatedAmountForReminder(
  userId: string,
  reminderId: string
): Promise<EstimatedReminderAmount | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('estimated_reminder_amounts')
    .select('*')
    .eq('user_id', userId)
    .eq('reminder_id', reminderId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

export async function updateEstimatedAmount(
  userId: string,
  reminderId: string,
  amount: number,
  method: 'average' | 'last_payment' | 'manual'
): Promise<EstimatedReminderAmount> {
  const supabase = await createSupabaseServerClient();
  
  // Check if record exists
  const existing = await getEstimatedAmountForReminder(userId, reminderId);
  
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('estimated_reminder_amounts')
      .update({
        estimated_amount: amount,
        calculation_method: method,
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Create new
  const { data, error } = await supabase
    .from('estimated_reminder_amounts')
    .insert({
      user_id: userId,
      reminder_id: reminderId,
      estimated_amount: amount,
      calculation_method: method,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function calculateEstimatedAmountFromHistory(
  userId: string,
  reminderId: string
): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  
  // Get payment history for this reminder
  const { data: payments, error } = await supabase
    .from('reminder_payments')
    .select('amount_paid')
    .eq('user_id', userId)
    .eq('reminder_id', reminderId)
    .order('paid_at', { ascending: false })
    .limit(6); // Last 6 payments
  
  if (error) throw error;
  if (!payments || payments.length === 0) return null;
  
  // Calculate average
  const total = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const average = total / payments.length;
  
  return Math.round(average * 100) / 100;
}

export async function autoUpdateEstimatedAmounts(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // Get all active reminders
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (remindersError) throw remindersError;
  if (!reminders) return;
  
  for (const reminder of reminders) {
    // Calculate from history
    const average = await calculateEstimatedAmountFromHistory(userId, reminder.id);
    
    if (average !== null) {
      await updateEstimatedAmount(userId, reminder.id, average, 'average');
    }
  }
}

export async function deleteEstimatedAmount(
  userId: string,
  reminderId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('estimated_reminder_amounts')
    .delete()
    .eq('user_id', userId)
    .eq('reminder_id', reminderId);
  
  if (error) throw error;
}
