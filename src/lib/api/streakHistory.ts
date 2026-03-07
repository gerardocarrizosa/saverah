import { createSupabaseServerClient } from '../supabase/server';
import type { BudgetStreakRecord } from '@/types/dashboard.types';

export async function getCurrentStreak(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  
  // Get all records within limit, ordered by date descending
  const { data, error } = await supabase
    .from('budget_streak_history')
    .select('*')
    .eq('user_id', userId)
    .eq('all_categories_within_limit', true)
    .order('record_date', { ascending: false });
  
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  
  // Calculate consecutive days from today backwards
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const record of data) {
    const recordDate = new Date(record.record_date);
    recordDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - recordDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      // Gap found, streak broken
      break;
    }
    // If diffDays < streak, it means same day (shouldn't happen with unique constraint)
  }
  
  return streak;
}

export async function getStreakHistory(
  userId: string,
  days: number = 30
): Promise<BudgetStreakRecord[]> {
  const supabase = await createSupabaseServerClient();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('budget_streak_history')
    .select('*')
    .eq('user_id', userId)
    .gte('record_date', cutoffDate.toISOString().split('T')[0])
    .order('record_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function recordDailyBudgetStatus(
  userId: string,
  date: string,
  allCategoriesWithinLimit: boolean,
  exceededCategories: string[] = [],
  dailyTotal?: number
): Promise<BudgetStreakRecord> {
  const supabase = await createSupabaseServerClient();
  
  // Upsert record (insert or update)
  const { data, error } = await supabase
    .from('budget_streak_history')
    .upsert({
      user_id: userId,
      record_date: date,
      all_categories_within_limit: allCategoriesWithinLimit,
      exceeded_categories: exceededCategories,
      daily_total: dailyTotal || 0,
    }, {
      onConflict: 'user_id,record_date',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTodayBudgetStatus(
  userId: string
): Promise<BudgetStreakRecord | null> {
  const supabase = await createSupabaseServerClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('budget_streak_history')
    .select('*')
    .eq('user_id', userId)
    .eq('record_date', today)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

export async function getLongestStreak(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  
  // Get all records ordered by date
  const { data, error } = await supabase
    .from('budget_streak_history')
    .select('record_date, all_categories_within_limit')
    .eq('user_id', userId)
    .order('record_date', { ascending: true });
  
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const record of data) {
    if (!record.all_categories_within_limit) {
      currentStreak = 0;
      lastDate = null;
      continue;
    }
    
    const currentDate = new Date(record.record_date);
    
    if (lastDate) {
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Gap found, reset streak
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    
    lastDate = currentDate;
    longestStreak = Math.max(longestStreak, currentStreak);
  }
  
  return longestStreak;
}
