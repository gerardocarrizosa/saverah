import { createSupabaseServerClient } from '../supabase/server';
import type { SavingsGoal, CreateSavingsGoalInput } from '@/types/dashboard.types';

export async function getCurrentSavingsGoal(userId: string): Promise<SavingsGoal | null> {
  const supabase = await createSupabaseServerClient();
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('is_active', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

export async function getSavingsGoalByMonth(
  userId: string,
  month: number,
  year: number
): Promise<SavingsGoal | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

export async function createSavingsGoal(
  userId: string,
  input: CreateSavingsGoalInput
): Promise<SavingsGoal> {
  const supabase = await createSupabaseServerClient();
  
  // Check if goal already exists for this month
  const existing = await getSavingsGoalByMonth(userId, input.month, input.year);
  
  if (existing) {
    // Update existing goal
    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        goal_type: input.goal_type,
        target_amount: input.target_amount || null,
        target_percentage: input.target_percentage || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Create new goal
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: userId,
      goal_type: input.goal_type,
      target_amount: input.target_amount || null,
      target_percentage: input.target_percentage || null,
      month: input.month,
      year: input.year,
      is_active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function completeSavingsGoal(
  userId: string,
  goalId: string
): Promise<SavingsGoal> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('savings_goals')
    .update({
      is_active: false,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSavingsGoal(
  userId: string,
  goalId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId);
  
  if (error) throw error;
}

export function calculateSavingsProgress(
  balance: number,
  income: number,
  goal: SavingsGoal
): { percentage: number; remaining: number; target: number } {
  if (goal.goal_type === 'fixed' && goal.target_amount) {
    const saved = Math.max(0, balance);
    return {
      percentage: Math.min(100, (saved / goal.target_amount) * 100),
      remaining: Math.max(0, goal.target_amount - saved),
      target: goal.target_amount,
    };
  }
  
  if (goal.goal_type === 'percentage' && goal.target_percentage) {
    const target = (income * goal.target_percentage) / 100;
    const saved = Math.max(0, balance);
    return {
      percentage: Math.min(100, (saved / target) * 100),
      remaining: Math.max(0, target - saved),
      target,
    };
  }
  
  return { percentage: 0, remaining: 0, target: 0 };
}
